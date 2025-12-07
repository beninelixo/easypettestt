// Edge Function para adicionar headers de segurança avançados
// Este middleware adiciona headers de segurança importantes para todas as respostas

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400', // 24 hours preflight cache
};

// Generate a random nonce for CSP (used for inline scripts)
const generateNonce = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
};

// Content Security Policy configurado para prevenir XSS
const getSecurityHeaders = (nonce: string) => ({
  // CSP - Content Security Policy with nonce support
  'Content-Security-Policy': [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://cdn.jsdelivr.net https://esm.sh`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.cakto.com.br",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; '),
  
  // Prevenir clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevenir MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Habilitar proteção XSS do navegador
  'X-XSS-Protection': '1; mode=block',
  
  // Forçar HTTPS com preload
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  
  // Controlar informações do referrer
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy (antiga Feature Policy) - mais restritivo
  'Permissions-Policy': [
    'accelerometer=()',
    'ambient-light-sensor=()',
    'autoplay=()',
    'battery=()',
    'camera=()',
    'cross-origin-isolated=()',
    'display-capture=()',
    'document-domain=()',
    'encrypted-media=()',
    'execution-while-not-rendered=()',
    'execution-while-out-of-viewport=()',
    'fullscreen=(self)',
    'geolocation=()',
    'gyroscope=()',
    'keyboard-map=()',
    'magnetometer=()',
    'microphone=()',
    'midi=()',
    'navigation-override=()',
    'payment=()',
    'picture-in-picture=()',
    'publickey-credentials-get=()',
    'screen-wake-lock=()',
    'sync-xhr=()',
    'usb=()',
    'web-share=()',
    'xr-spatial-tracking=()'
  ].join(', '),
  
  // Cross-Origin policies
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Resource-Policy': 'same-origin',
  
  // Cache control for security
  'Cache-Control': 'no-store, max-age=0',
  
  // Prevent caching of sensitive responses
  'Pragma': 'no-cache',
});

Deno.serve(async (req) => {
  const nonce = generateNonce();
  const securityHeaders = getSecurityHeaders(nonce);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: { 
        ...corsHeaders,
        ...securityHeaders 
      } 
    });
  }

  try {
    // Return security configuration info
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Security headers configurados',
        nonce,
        headers: Object.keys(securityHeaders),
        timestamp: new Date().toISOString()
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
