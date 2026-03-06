import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não definidos. Configure o .env.'
  );
}

export const supabaseClient = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');
