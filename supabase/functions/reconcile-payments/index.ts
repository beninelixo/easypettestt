import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verifyAdminAccess } from '../_shared/schemas.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReconciliationResult {
  total_checked: number;
  discrepancies: number;
  fixed: number;
  issues: any[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check admin role using helper (supports multiple roles)
    const { isAdmin } = await verifyAdminAccess(supabase, user.id);
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result: ReconciliationResult = {
      total_checked: 0,
      discrepancies: 0,
      fixed: 0,
      issues: []
    };

    // 1. Pagamentos marcados como "pago" sem data
    const { data: paymentsWithoutDate, error: error1 } = await supabase
      .from('payments')
      .select('id, amount, created_at')
      .eq('status', 'pago')
      .is('paid_at', null);

    if (error1) throw error1;

    if (paymentsWithoutDate && paymentsWithoutDate.length > 0) {
      result.discrepancies += paymentsWithoutDate.length;
      
      const { error: fixError } = await supabase
        .from('payments')
        .update({ paid_at: new Date().toISOString() })
        .in('id', paymentsWithoutDate.map(p => p.id));

      if (!fixError) {
        result.fixed += paymentsWithoutDate.length;
        result.issues.push({
          type: 'missing_paid_date',
          severity: 'medium',
          count: paymentsWithoutDate.length,
          action: 'fixed'
        });
      }
    }

    // 2. Pagamentos pendentes há mais de 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: oldPendingPayments, error: error2 } = await supabase
      .from('payments')
      .select('id, amount, created_at')
      .eq('status', 'pendente')
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (error2) throw error2;

    if (oldPendingPayments && oldPendingPayments.length > 0) {
      result.issues.push({
        type: 'old_pending_payments',
        severity: 'warning',
        count: oldPendingPayments.length,
        action: 'review_required',
        payments: oldPendingPayments.map(p => ({
          id: p.id,
          amount: p.amount,
          days_pending: Math.floor(
            (new Date().getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24)
          )
        }))
      });
    }

    // 3. Appointments completados sem pagamento
    const { data: completedWithoutPayment, error: error3 } = await supabase
      .from('appointments')
      .select(`
        id, 
        scheduled_date,
        service:services(price)
      `)
      .eq('status', 'completed')
      .not('id', 'in', `(SELECT appointment_id FROM payments)`);

    if (error3) throw error3;

    if (completedWithoutPayment && completedWithoutPayment.length > 0) {
      result.discrepancies += completedWithoutPayment.length;
      result.issues.push({
        type: 'completed_without_payment',
        severity: 'high',
        count: completedWithoutPayment.length,
        action: 'create_payment_required',
        appointments: completedWithoutPayment.map(a => a.id)
      });
    }

    result.total_checked = 
      (paymentsWithoutDate?.length || 0) + 
      (oldPendingPayments?.length || 0) + 
      (completedWithoutPayment?.length || 0);

    // Registrar log
    if (result.issues.length > 0) {
      await supabase.from('system_logs').insert({
        module: 'reconcile_payments',
        log_type: result.issues.some(i => i.severity === 'high') ? 'error' : 'warning',
        message: `Reconciliação de pagamentos: ${result.fixed} corrigidos, ${result.discrepancies - result.fixed} requerem atenção`,
        details: result
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        ...result
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error reconciling payments:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});