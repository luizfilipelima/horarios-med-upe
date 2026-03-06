import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const hasConfig = Boolean(supabaseUrl && supabaseAnonKey);

// Debug (não imprime valores completos por segurança)
console.log('[Supabase] URL existe?', !!import.meta.env.VITE_SUPABASE_URL);
console.log('[Supabase] Key existe?', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('[Supabase] Configurado?', hasConfig);

if (!hasConfig) {
  console.warn(
    'Supabase: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não definidos. Configure no .env (local) ou nas variáveis de ambiente do deploy (ex: Vercel).'
  );
}

// Usa placeholder para não lançar "supabaseUrl is required" quando env falta (ex: deploy sem variáveis)
const url: string = hasConfig ? supabaseUrl! : 'https://placeholder.supabase.co';
const key: string = hasConfig ? supabaseAnonKey! : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDB9.placeholder';

export const supabaseClient = createClient(url, key);
export const isSupabaseConfigured = hasConfig;
