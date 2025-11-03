import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar perfis incompletos
    const { data: incompleteProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, phone, created_at')
      .or('full_name.eq.,phone.eq.');

    if (profilesError) throw profilesError;

    // Buscar pets órfãos
    const { data: orphanPets, error: petsError } = await supabase
      .from('pets')
      .select('id, name, owner_id')
      .is('owner_id', null);

    if (petsError) throw petsError;

    const issues: any[] = [];

    if (incompleteProfiles && incompleteProfiles.length > 0) {
      issues.push({
        type: 'incomplete_profiles',
        severity: 'warning',
        count: incompleteProfiles.length,
        profiles: incompleteProfiles.map(p => ({
          id: p.id,
          missing_fields: [
            !p.full_name && 'nome',
            !p.phone && 'telefone'
          ].filter(Boolean),
          days_since_creation: Math.floor(
            (new Date().getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24)
          )
        }))
      });

      // TODO: Enviar email para usuários pedirem completar cadastro
    }

    if (orphanPets && orphanPets.length > 0) {
      issues.push({
        type: 'orphan_pets',
        severity: 'critical',
        count: orphanPets.length,
        pets: orphanPets
      });

      // Deletar pets órfãos
      const { error: deleteError } = await supabase
        .from('pets')
        .delete()
        .in('id', orphanPets.map(p => p.id));

      if (deleteError) throw deleteError;
    }

    // Registrar log
    if (issues.length > 0) {
      await supabase.from('system_logs').insert({
        module: 'validate_profiles',
        log_type: orphanPets && orphanPets.length > 0 ? 'error' : 'warning',
        message: `Validação de perfis: ${incompleteProfiles?.length || 0} incompletos, ${orphanPets?.length || 0} pets órfãos`,
        details: { issues }
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        issues,
        summary: {
          incomplete_profiles: incompleteProfiles?.length || 0,
          orphan_pets: orphanPets?.length || 0,
          orphan_pets_deleted: orphanPets?.length || 0
        }
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error validating profiles:', error);
    
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