"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Columns3, List } from "lucide-react";
import { TemperatureBadge } from "@/components/ui/badge";
import { Select } from "@/components/ui/field";
import { cn, formatCurrency, formatDate } from "@/lib/format";
import { moveStage } from "@/features/leads/actions";
import { SEGMENT_SHORT, STAGES, STAGE_LABEL, type SegmentId, type StageId } from "@/features/leads/options";
import type { LeadCard } from "@/features/leads/queries";
import { LostReasonDialog } from "./lost-reason-dialog";

type View = "kanban" | "lista";
type PendingLost = { lead: LeadCard; from: StageId };

export function KanbanBoard({ initialLeads }: { initialLeads: LeadCard[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [view, setView] = useState<View>("kanban");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingLost, setPendingLost] = useState<PendingLost | null>(null);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  // Recebe dados novos do servidor (após refresh) sem perder o estado otimista em voo
  const [prevInitial, setPrevInitial] = useState(initialLeads);
  if (initialLeads !== prevInitial) {
    setPrevInitial(initialLeads);
    setLeads(initialLeads);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const byStage = useMemo(() => {
    const map = Object.fromEntries(STAGES.map((s) => [s.value, [] as LeadCard[]])) as Record<StageId, LeadCard[]>;
    for (const l of leads) map[l.stage_id as StageId]?.push(l);
    return map;
  }, [leads]);

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : undefined;

  function setStageLocal(id: string, stage: StageId) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage_id: stage } : l)));
  }

  function commit(lead: LeadCard, to: StageId, from: StageId, reason?: string) {
    setError(undefined);
    setStageLocal(lead.id, to);
    startTransition(async () => {
      const res = await moveStage(lead.id, to, reason);
      if (!res.ok) {
        setStageLocal(lead.id, from);
        setError(res.errors?.lost_reason ?? res.message ?? "Não conseguimos mover o lead. Tente de novo.");
      }
    });
  }

  function requestMove(lead: LeadCard, to: StageId) {
    const from = lead.stage_id as StageId;
    if (to === from) return;
    if (to === "perdido") {
      setPendingLost({ lead, from });
      return;
    }
    commit(lead, to, from);
  }

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const lead = leads.find((l) => l.id === e.active.id);
    const to = e.over?.id as StageId | undefined;
    if (lead && to) requestMove(lead, to);
  }

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Movendo ${leads.find((l) => l.id === active.id)?.name ?? "lead"}.`,
    onDragOver: ({ over }) => (over ? `Sobre a coluna ${STAGE_LABEL[over.id as StageId]}.` : "Fora das colunas."),
    onDragEnd: ({ over }) => (over ? `Solto em ${STAGE_LABEL[over.id as StageId]}.` : "Movimento cancelado."),
    onDragCancel: () => "Movimento cancelado.",
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label="Visualização" className="inline-flex rounded-lg border border-line-strong bg-surface p-1">
          {(
            [
              ["kanban", "Quadro", Columns3],
              ["lista", "Lista", List],
            ] as const
          ).map(([v, label, Icon]) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={cn(
                "inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm",
                view === v ? "bg-ink font-semibold text-canvas" : "text-muted hover:text-ink",
              )}
            >
              <Icon aria-hidden className="size-4" />
              {label}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted" aria-live="polite">
          {pending ? "Salvando…" : `${leads.length} leads no quadro`}
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-danger-soft p-4 text-sm text-danger">
          {error}
        </p>
      )}

      {view === "kanban" ? (
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={() => setActiveId(null)}
          accessibility={{
            announcements,
            screenReaderInstructions: {
              draggable:
                "Para mover um lead, pressione espaço ou enter, use as setas para trocar de coluna e pressione espaço de novo para soltar. Esc cancela.",
            },
          }}
        >
          <div className="scroll-x -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6">
            {STAGES.map((s) => (
              <Column key={s.value} stage={s.value} label={s.label} leads={byStage[s.value]} />
            ))}
          </div>
          <DragOverlay>{activeLead ? <CardBody lead={activeLead} dragging /> : null}</DragOverlay>
        </DndContext>
      ) : (
        <div className="flex flex-col gap-6">
          {STAGES.map((s) => (
            <section key={s.value} aria-labelledby={`list-${s.value}`} className="flex flex-col gap-2">
              <h2 id={`list-${s.value}`} className="flex items-center gap-2 text-sm font-semibold">
                {s.label}
                <span className="rounded-md bg-subtle px-2 text-muted">{byStage[s.value].length}</span>
              </h2>
              {byStage[s.value].length === 0 ? (
                <p className="text-sm text-muted">Nenhum lead nesta etapa.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {byStage[s.value].map((l) => (
                    <li key={l.id} className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
                      <CardText lead={l} />
                      <div className="flex shrink-0 flex-col gap-1">
                        <label htmlFor={`mv-${l.id}`} className="sr-only">
                          Mover {l.name} para
                        </label>
                        <Select
                          id={`mv-${l.id}`}
                          value={l.stage_id}
                          className="h-10 w-full sm:w-48"
                          onChange={(e) => requestMove(l, e.target.value as StageId)}
                        >
                          {STAGES.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}

      <LostReasonDialog
        open={!!pendingLost}
        leadName={pendingLost?.lead.name ?? ""}
        onCancel={() => setPendingLost(null)}
        onConfirm={(reason) => {
          if (!pendingLost) return;
          commit(pendingLost.lead, "perdido", pendingLost.from, reason);
          setPendingLost(null);
        }}
      />
    </div>
  );
}

function Column({ stage, label, leads }: { stage: StageId; label: string; leads: LeadCard[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const total = leads.reduce((sum, l) => sum + (l.estimated_value ?? 0), 0);

  return (
    <section
      ref={setNodeRef}
      aria-labelledby={`col-${stage}`}
      className={cn(
        "flex w-[82vw] max-w-72 shrink-0 snap-start flex-col gap-2 rounded-[var(--radius-card)] border bg-subtle p-2 sm:w-72",
        isOver ? "border-accent" : "border-transparent",
      )}
    >
      <header className="flex items-baseline justify-between gap-2 px-2 pt-1">
        <h2 id={`col-${stage}`} className="text-sm font-semibold">
          {label} <span className="font-normal text-muted">{leads.length}</span>
        </h2>
        {total > 0 && <span className="text-xs text-muted">{formatCurrency(total)}</span>}
      </header>
      <ul className="flex min-h-24 flex-col gap-2">
        {leads.map((l) => (
          <DraggableCard key={l.id} lead={l} />
        ))}
        {leads.length === 0 && <li className="px-2 py-4 text-center text-xs text-muted">Arraste um lead para cá</li>}
      </ul>
    </section>
  );
}

function DraggableCard({ lead }: { lead: LeadCard }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.id });
  return (
    <li ref={setNodeRef} className={cn(isDragging && "opacity-40")} {...attributes} {...listeners} aria-roledescription="lead arrastável">
      <CardBody lead={lead} />
    </li>
  );
}

function CardBody({ lead, dragging }: { lead: LeadCard; dragging?: boolean }) {
  return (
    <div
      className={cn(
        "flex cursor-grab touch-manipulation flex-col gap-2 rounded-lg border border-line bg-surface p-3 active:cursor-grabbing",
        dragging && "shadow-[var(--shadow-soft)]",
      )}
    >
      <CardText lead={lead} compact />
    </div>
  );
}

function CardText({ lead, compact }: { lead: LeadCard; compact?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/painel/leads/${lead.id}`}
          className="text-sm font-semibold text-ink hover:underline hover:underline-offset-4"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {lead.name}
        </Link>
        <TemperatureBadge temperature={lead.temperature} score={compact ? undefined : lead.score} />
      </div>
      <p className="truncate text-xs text-muted">
        {[lead.business_name, lead.segment && SEGMENT_SHORT[lead.segment as SegmentId]].filter(Boolean).join(" · ")}
      </p>
      {(lead.estimated_value != null || lead.next_action_at) && (
        <p className="flex justify-between gap-2 text-xs text-muted">
          <span>{lead.estimated_value != null ? formatCurrency(lead.estimated_value) : ""}</span>
          {lead.next_action_at && <span>Próx.: {formatDate(lead.next_action_at)}</span>}
        </p>
      )}
    </div>
  );
}
