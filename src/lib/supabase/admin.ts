import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { SUPABASE_SCHEMA, supabaseServiceKey, supabaseUrl } from "./env";

/**
 * Cliente com service role: IGNORA RLS.
 * Uso restrito a rotas de servidor que precisam gravar sem usuário logado
 * (formulário público). Nunca importe em código de cliente.
 */
export function createAdminClient() {
  return createClient<Database, typeof SUPABASE_SCHEMA>(supabaseUrl(), supabaseServiceKey(), {
    db: { schema: SUPABASE_SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
