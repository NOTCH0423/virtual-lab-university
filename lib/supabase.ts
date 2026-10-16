import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Cliente de Supabase (navegador y servidor) con la anon key.
 * El acceso principal a datos sigue siendo Prisma (lib/prisma.ts) conectado
 * a la base Postgres de Supabase vía DATABASE_URL / DIRECT_URL.
 * Este cliente sirve para Storage, Realtime o consultas directas.
 */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase no está configurado: define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }
  return supabase;
}

export default supabase;
