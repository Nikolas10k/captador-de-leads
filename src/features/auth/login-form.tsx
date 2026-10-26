"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { signIn, type LoginState } from "./actions";

export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});
  const message = state.error ?? notice;

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="next" value={next ?? ""} />
      <Field id="email" label="E-mail">
        <Input id="email" name="email" type="email" autoComplete="email" defaultValue={state.email} required />
      </Field>
      <Field id="password" label="Senha">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      {message && (
        <p role="alert" className="rounded-lg bg-danger-soft p-4 text-sm text-danger">
          {message}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Entrando…" : "Entrar no painel"}
      </Button>
    </form>
  );
}
