"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/field";

const QUICK_REASONS = ["Preço acima do esperado", "Fechou com outro fornecedor", "Sem resposta", "Adiou o projeto"];

type Props = {
  open: boolean;
  leadName: string;
  pending?: boolean;
  error?: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
};

/** <dialog> nativo: prende o foco, fecha com Esc e devolve o foco ao fechar */
export function LostReasonDialog({ open, leadName, pending, error, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [reason, setReason] = useState("");
  const [localError, setLocalError] = useState<string>();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setReason("");
      setLocalError(undefined);
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      setLocalError("Conte o motivo da perda. Isso ajuda a melhorar as próximas propostas.");
      return;
    }
    onConfirm(reason.trim());
  }

  const shownError = localError ?? error;

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      aria-labelledby={`${id}-title`}
      className="m-auto w-[calc(100%-32px)] max-w-md rounded-[var(--radius-card)] border border-line bg-surface p-0 text-ink shadow-[var(--shadow-soft)] backdrop:bg-ink/40"
    >
      <form onSubmit={submit} className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-1">
          <h2 id={`${id}-title`} className="text-lg font-semibold">
            Marcar {leadName} como perdido
          </h2>
          <p className="text-sm text-muted">O motivo fica na linha do tempo e entra nos relatórios.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setReason(r);
                setLocalError(undefined);
              }}
              className="rounded-full border border-line-strong px-3 py-1 text-sm hover:bg-subtle"
            >
              {r}
            </button>
          ))}
        </div>
        <Field id={`${id}-reason`} label="Motivo da perda" error={shownError}>
          <Textarea
            id={`${id}-reason`}
            name="lost_reason"
            value={reason}
            maxLength={500}
            onChange={(e) => {
              setReason(e.target.value);
              if (e.target.value.trim()) setLocalError(undefined);
            }}
            aria-invalid={!!shownError}
            aria-describedby={shownError ? `${id}-reason-error` : undefined}
            autoFocus
          />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" variant="danger" disabled={pending}>
            {pending ? "Salvando…" : "Marcar como perdido"}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
