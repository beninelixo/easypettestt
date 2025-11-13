import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
};

// Validation schema
const uploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z.number().positive().max(5 * 1024 * 1024), // 5MB max
  mimeType: z.string().regex(/^image\/(jpeg|jpg|png|webp|gif)$/i),
  base64Data: z.string().min(1)
});

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validate file MIME type from magic numbers (file signature)
 */
function validateMimeFromSignature(base64Data: string): string | null {
  try {
    // Decode first few bytes to check file signature
    const binaryString = atob(base64Data.substring(0, 100));
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Check magic numbers
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      return 'image/jpeg';
    }
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      return 'image/png';
    }
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
      return 'image/gif';
    }
    if (bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
      return 'image/webp';
    }

    return null;
  } catch (error) {
    console.error('Error validating MIME from signature:', error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify JWT authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Validate CSRF token
    const csrfToken = req.headers.get('X-CSRF-Token');
    if (!csrfToken) {
      throw new Error('Missing CSRF token');
    }

    // Parse and validate request body
    const body = await req.json();
    const validated = uploadSchema.parse(body);

    // Validate file size
    if (validated.fileSize > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Arquivo muito grande. Tamanho máximo: 5MB (recebido: ${(validated.fileSize / 1024 / 1024).toFixed(2)}MB)`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate MIME type from magic numbers
    const detectedMime = validateMimeFromSignature(validated.base64Data);
    if (!detectedMime) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Tipo de arquivo não suportado. Use apenas JPEG, PNG, WebP ou GIF.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify detected MIME matches declared MIME
    if (detectedMime !== validated.mimeType.toLowerCase()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Tipo de arquivo declarado não corresponde ao conteúdo real do arquivo.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if MIME type is allowed
    if (!ALLOWED_MIME_TYPES.includes(detectedMime)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Tipo de arquivo não permitido. Use apenas JPEG, PNG, WebP ou GIF.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate secure UUID-based filename
    const fileExtension = detectedMime.split('/')[1];
    const secureFileName = `${crypto.randomUUID()}.${fileExtension}`;
    const filePath = `${user.id}/${secureFileName}`;

    // Convert base64 to binary
    const binaryString = atob(validated.base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Upload to Supabase Storage with sanitized filename
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, bytes, {
        contentType: detectedMime,
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrl,
        fileName: secureFileName,
        mimeType: detectedMime,
        size: validated.fileSize
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Upload validation error:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Dados de upload inválidos',
          details: error.errors
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao processar upload'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
