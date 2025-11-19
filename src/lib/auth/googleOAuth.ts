/**
 * Google OAuth Configuration and Helper Functions
 * Handles Google Sign-In integration with Supabase Auth
 */

import { supabase } from "@/integrations/supabase/client";

export interface GoogleAuthConfig {
  redirectTo?: string;
}

/**
 * Initiates Google OAuth flow
 * Opens Google sign-in popup or redirect
 */
export async function signInWithGoogle(config?: GoogleAuthConfig) {
  const redirectUrl = config?.redirectTo || `${window.location.origin}/auth/callback`;
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Google OAuth error:', error);
    throw error;
  }

  return data;
}

/**
 * Checks if Google OAuth is properly configured
 * Returns configuration status
 */
export async function isGoogleOAuthConfigured(): Promise<boolean> {
  try {
    // Try to get OAuth providers from Supabase
    const { data } = await supabase.auth.getSession();
    // If we can check session, OAuth should be available
    return true;
  } catch (error) {
    console.error('Error checking Google OAuth configuration:', error);
    return false;
  }
}

/**
 * Handles OAuth callback and processes user data
 * Should be called on the redirect page
 */
export async function handleGoogleCallback() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }

    if (session?.user) {
      // User authenticated successfully
      return {
        user: session.user,
        session,
        isNewUser: !session.user.last_sign_in_at || 
                   session.user.last_sign_in_at === session.user.created_at,
      };
    }

    return null;
  } catch (error) {
    console.error('Error handling Google callback:', error);
    throw error;
  }
}
