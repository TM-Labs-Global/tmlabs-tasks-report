import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('SUPABASE ADMIN INITIALIZATION -> URL:', supabaseUrl, 'KEY starts with:', supabaseServiceKey ? supabaseServiceKey.substring(0, 15) : 'EMPTY');

export const supabaseAdmin: SupabaseClient = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            cache: 'no-store',
          });
        },
      },
    })
  : null as unknown as SupabaseClient;
