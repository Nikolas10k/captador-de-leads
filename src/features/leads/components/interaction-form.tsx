"use client";

import { Button } from "@/components/ui/button";
import { describedBy, Field, Select, Textarea } from "@/components/ui/field";
import { useFormAction } from "@/lib/use-form-action";
import { INTERACTION_TYPES } from "../options";
import type { ActionState } from "../schema";

export function InteractionForm({ action }: { action: (prev: ActionState, formData: FormData) => Promise<ActionState> }) {
  const [state, onSubmit, pending] = useFormAction<ActionState>(action, {}, { resetOnSuccess: true });
  const e = state.errors ?? {};

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <Field id="type" label="Tipo">
          <Select id="type" name="type" defaultValue="whatsapp">
            {INTERACTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="content" label="O que aconteceu" error={e.content}>
          <Textarea
            id="content"
            name="content"
            className="min-h-11"
            rows={2}
            placeholder="Ex.: respondeu que vai ver a prévia com o sócio"
            aria-invalid={!!e.content}
            aria-describedby={describedBy("content", e.content)}
          />
        </Field>
      </div>
      <div className="flex items-center gap-4">
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Registrando…" : "Registrar interação"}
        </Button>
        {state.message && !state.ok && (
          <p role="alert" className="text-sm text-danger">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
