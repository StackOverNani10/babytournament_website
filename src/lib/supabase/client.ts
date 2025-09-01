import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'sb-auth-token',
  },
  global: {
    headers: {
      'X-Client-Info': 'detallazo-web/1.0',
    },
  },
});

// Initialize auth state change listener
if (typeof window !== 'undefined') {
  // Set up auth state change listener
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
  });

  // Check for existing session
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      console.log('Restored session for user:', session.user.email);
    }
  });
}

// Export types
export * from './types';
