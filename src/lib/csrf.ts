/**
 * CSRF Token Management
 * Generates and validates CSRF tokens for critical form submissions
 */

const CSRF_TOKEN_KEY = 'easypet_csrf_token';
const CSRF_TOKEN_EXPIRY = 'easypet_csrf_expiry';
const TOKEN_VALIDITY_MS = 60 * 60 * 1000; // 1 hour

/**
 * Generate a cryptographically secure random token
 */
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Get or create a CSRF token
 * Automatically refreshes expired tokens
 */
export function getCSRFToken(): string {
  const now = Date.now();
  const storedToken = sessionStorage.getItem(CSRF_TOKEN_KEY);
  const storedExpiry = sessionStorage.getItem(CSRF_TOKEN_EXPIRY);

  // Check if token exists and is still valid
  if (storedToken && storedExpiry && parseInt(storedExpiry) > now) {
    return storedToken;
  }

  // Generate new token
  const newToken = generateToken();
  const newExpiry = now + TOKEN_VALIDITY_MS;

  sessionStorage.setItem(CSRF_TOKEN_KEY, newToken);
  sessionStorage.setItem(CSRF_TOKEN_EXPIRY, newExpiry.toString());

  return newToken;
}

/**
 * Validate a CSRF token
 */
export function validateCSRFToken(token: string): boolean {
  const storedToken = sessionStorage.getItem(CSRF_TOKEN_KEY);
  const storedExpiry = sessionStorage.getItem(CSRF_TOKEN_EXPIRY);
  const now = Date.now();

  if (!storedToken || !storedExpiry) {
    return false;
  }

  // Check if token expired
  if (parseInt(storedExpiry) <= now) {
    clearCSRFToken();
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  return token === storedToken;
}

/**
 * Clear CSRF token (use on logout)
 */
export function clearCSRFToken(): void {
  sessionStorage.removeItem(CSRF_TOKEN_KEY);
  sessionStorage.removeItem(CSRF_TOKEN_EXPIRY);
}

/**
 * Add CSRF token to request headers
 */
export function addCSRFHeader(headers: HeadersInit = {}): HeadersInit {
  return {
    ...headers,
    'X-CSRF-Token': getCSRFToken()
  };
}

/**
 * Hook to use CSRF token in forms
 */
export function useCSRFToken(): { token: string; headerName: string } {
  return {
    token: getCSRFToken(),
    headerName: 'X-CSRF-Token'
  };
}
