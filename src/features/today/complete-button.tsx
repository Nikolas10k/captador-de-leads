"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeNextAction } from "@/features/leads/actions";

export function CompleteButton({ leadId }: { leadId: string }) {
  const [pending, start] = useTransition();
  return (
    <Button variant="secondary" disabled={pending} onClick={() => start(async () => void (await completeNextAction(leadId)))}>
      <Check aria-hidden className="size-4" />
      {pending ? "Salvando…" : "Feito"}
    </Button>
  );
}
