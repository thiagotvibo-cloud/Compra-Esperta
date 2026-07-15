import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '').trim();

let finalUrl = supabaseUrl;
let finalKey = supabaseAnonKey;

if (!finalUrl || !finalUrl.startsWith('http') || !finalKey) {
  console.warn("As variáveis de ambiente do Supabase estão ausentes. Verifique o painel do Vercel e adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
  finalUrl = 'https://placeholder.supabase.co';
  finalKey = 'placeholder';
}

export const supabase = createClient(finalUrl, finalKey);

