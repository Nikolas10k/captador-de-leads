import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { SUPABASE_SCHEMA, supabasePublishableKey, supabaseUrl } from "./env";

/**
 * Cliente com a sessão do usuário logado. Respeita RLS.
 * Crie um por requisição (nunca compartilhe entre requisições).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database, typeof SUPABASE_SCHEMA>(supabaseUrl(), supabasePublishableKey(), {
    db: { schema: SUPABASE_SCHEMA },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Chamado de um Server Component: o proxy.ts já renova a sessão.
        }
      },
    },
  });
}
