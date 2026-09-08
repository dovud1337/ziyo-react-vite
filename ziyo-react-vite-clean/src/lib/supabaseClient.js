import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client = null;
try {
  if (supabaseUrl && supabaseAnonKey) client = createClient(supabaseUrl, supabaseAnonKey);
} catch {
  // Configuration errors must not prevent React from rendering a useful message.
}
export const supabase = client;
