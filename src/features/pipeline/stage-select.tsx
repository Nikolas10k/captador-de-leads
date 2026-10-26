"use client";

import { useState, useTransition } from "react";
import { Select } from "@/components/ui/field";
import { STAGES, type StageId } from "@/features/leads/options";
import { moveStage } from "@/features/leads/actions";
import { LostReasonDialog } from "./lost-reason-dialog";

export function StageSelect({ leadId, leadName, stage, label = "Etapa" }: { leadId: string; leadName: string; stage: StageId; label?: string }) {
  const [value, setValue] = useState<StageId>(stage);
  const [askLost, setAskLost] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function apply(next: StageId, reason?: string) {
    setError(undefined);
    const previous = value;
    setValue(next);
    startTransition(async () => {
      const res = await moveStage(leadId, next, reason);
      if (!res.ok) {
        setValue(previous);
        setError(res.errors?.lost_reason ?? res.message);
        if (next === "perdido") setAskLost(true);
      } else {
        setAskLost(false);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={`stage-${leadId}`} className="sr-only">
        {label}
      </label>
      <Select
        id={`stage-${leadId}`}
        value={value}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as StageId;
          if (next === "perdido") setAskLost(true);
          else apply(next);
        }}
        className="h-10 w-auto min-w-44"
      >
        {STAGES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </Select>
      {error && !askLost && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <LostReasonDialog
        open={askLost}
        leadName={leadName}
        pending={pending}
        error={askLost ? error : undefined}
        onCancel={() => {
          setAskLost(false);
          setError(undefined);
        }}
        onConfirm={(reason) => apply("perdido", reason)}
      />
    </div>
  );
}
