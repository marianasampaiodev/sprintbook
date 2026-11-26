import { createClient } from '@supabase/supabase-js';

// Cliente único do Supabase, usado por todo o app.
// A chave "publishable" pode ficar no front-end: quem protege os dados são as políticas (RLS) do passo 2.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no ambiente.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);