import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Member = { id: string; email: string; role: string };

/**
 * Usuário logado E cadastrado em givance.team_members.
 * O Auth do projeto pode ter usuários de outros sistemas: estar logado não basta.
 */
export const getMember = cache(async (): Promise<Member | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const { data: member } = await supabase
    .from("team_members")
    .select("role")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (!member) return null;

  return { id: data.user.id, email: data.user.email ?? "", role: member.role };
});

export async function requireMember() {
  const member = await getMember();
  if (!member) redirect("/painel/login?erro=sem-acesso");
  return member;
}
