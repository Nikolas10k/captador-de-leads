"use client";

import { Button } from "@/components/ui/button";
import { describedBy, Field, Input, Textarea } from "@/components/ui/field";
import { useFormAction } from "@/lib/use-form-action";
import type { ActionState } from "@/features/leads/schema";

type Props = {
  id: string;
  name: string;
  body: string;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
};

export function TemplateEditor({ id, name, body, action }: Props) {
  const [state, onSubmit, pending] = useFormAction<ActionState>(action, {});
  const e = state.errors ?? {};
  const f = (k: string) => `${k}-${id}`;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Field id={f("name")} label="Nome do modelo" error={e.name}>
        <Input id={f("name")} name="name" defaultValue={name} aria-invalid={!!e.name} aria-describedby={describedBy(f("name"), e.name)} />
      </Field>
      <Field id={f("body")} label="Mensagem" error={e.body}>
        <Textarea id={f("body")} name="body" rows={4} defaultValue={body} aria-invalid={!!e.body} aria-describedby={describedBy(f("body"), e.body)} />
      </Field>
      <div className="flex items-center gap-4">
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Salvando…" : "Salvar modelo"}
        </Button>
        {state.message && (
          <p role={state.ok ? "status" : "alert"} className={state.ok ? "text-sm text-success" : "text-sm text-danger"}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
