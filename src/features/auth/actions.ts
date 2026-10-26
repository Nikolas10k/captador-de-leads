"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string; email?: string };

const loginSchema = z.object({
  email: z.email({ error: "Digite um e-mail válido." }),
  password: z.string().min(1, { error: "Digite sua senha." }),
  next: z.string().optional(),
});

function safeNext(next: string | undefined) {
  return next && next.startsWith("/painel") && !next.startsWith("//") ? next : "/painel";
}

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  const email = String(formData.get("email") ?? "");
  if (!parsed.success) return { error: parsed.error.issues[0].message, email };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error || !data.user) {
    return { error: "E-mail ou senha não conferem. Confira e tente de novo.", email };
  }

  const { data: member } = await supabase.from("team_members").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!member) {
    await supabase.auth.signOut();
    return { error: "Este usuário ainda não tem acesso ao painel da Givance. Peça a liberação ao administrador.", email };
  }

  redirect(safeNext(parsed.data.next));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/painel/login");
}
