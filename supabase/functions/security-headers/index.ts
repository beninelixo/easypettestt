// Edge Function para adicionar headers de segurança
// Este middleware adiciona headers de segurança importantes para todas as respostas

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Content Security Policy configurado para prevenir XSS
const securityHeaders = {
  // CSP - Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://esm.sh",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  
  // Prevenir clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevenir MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Habilitar proteção XSS do navegador
  'X-XSS-Protection': '1; mode=block',
  
  // Forçar HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  
  // Controlar informações do referrer
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy (antiga Feature Policy)
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()'
  ].join(', ')
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: { 
        ...corsHeaders,
        ...securityHeaders 
      } 
    });
  }

  try {
    // Este é um exemplo - normalmente você faria proxy da requisição original
    // ou usaria isso como middleware em outras funções
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Security headers configurados',
        headers: Object.keys(securityHeaders)
      }), 
      { 
        headers: { 
          ...corsHeaders,
          ...securityHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in security headers function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      }), 
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          ...securityHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
