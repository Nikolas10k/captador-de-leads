"use client";

import { Button } from "@/components/ui/button";
import { describedBy, Field, Input } from "@/components/ui/field";
import { toLocalInputValue } from "@/lib/format";
import { useFormAction } from "@/lib/use-form-action";
import type { ActionState } from "../schema";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  nextAction: string | null;
  nextActionAt: string | null;
  estimatedValue: number | null;
};

export function FollowUpForm({ action, nextAction, nextActionAt, estimatedValue }: Props) {
  const [state, onSubmit, pending] = useFormAction<ActionState>(action, {});
  const e = state.errors ?? {};

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Field id="next_action" label="Próxima ação" error={e.next_action}>
        <Input
          id="next_action"
          name="next_action"
          defaultValue={nextAction ?? ""}
          placeholder="Ex.: ligar para apresentar a prévia"
          aria-invalid={!!e.next_action}
          aria-describedby={describedBy("next_action", e.next_action)}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="next_action_at" label="Data e hora" error={e.next_action_at}>
          <Input id="next_action_at" name="next_action_at" type="datetime-local" defaultValue={toLocalInputValue(nextActionAt)} />
        </Field>
        <Field id="estimated_value" label="Valor da proposta (R$)" error={e.estimated_value}>
          <Input
            id="estimated_value"
            name="estimated_value"
            inputMode="decimal"
            placeholder="2.500"
            defaultValue={estimatedValue != null ? String(estimatedValue).replace(".", ",") : ""}
            aria-invalid={!!e.estimated_value}
            aria-describedby={describedBy("estimated_value", e.estimated_value)}
          />
        </Field>
      </div>
      <div className="flex items-center gap-4">
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Salvando…" : "Salvar próxima ação"}
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
