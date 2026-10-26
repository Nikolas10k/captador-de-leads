"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteLead } from "../actions";

/** Exclusão com confirmação nomeada (pedido de exclusão LGPD, duplicados) */
export function DeleteLead({ leadId, leadName }: { leadId: string; leadName: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();

  return (
    <>
      <Button variant="ghost" size="sm" className="text-danger" onClick={() => ref.current?.showModal()}>
        Excluir lead
      </Button>
      <dialog
        ref={ref}
        aria-labelledby="delete-title"
        className="m-auto w-[calc(100%-32px)] max-w-md rounded-[var(--radius-card)] border border-line bg-surface p-6 text-ink backdrop:bg-ink/40"
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 id="delete-title" className="text-lg font-semibold">
              Excluir {leadName}?
            </h2>
            <p className="text-sm text-muted">
              A ficha, a linha do tempo e o histórico de etapas serão apagados de vez. Use para pedidos de exclusão de dados ou
              cadastros duplicados.
            </p>
          </div>
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => ref.current?.close()}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const res = await deleteLead(leadId);
                  if (res && !res.ok) setError(res.message);
                })
              }
            >
              {pending ? "Excluindo…" : `Excluir ${leadName}`}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
