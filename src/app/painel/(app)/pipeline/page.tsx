import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader, SectionSkeleton } from "@/features/panel/page-header";
import { getPipelineLeads } from "@/features/leads/queries";
import { KanbanBoard } from "@/features/pipeline/kanban-board";

export const metadata = { title: "Pipeline" };

export default function PipelinePage() {
  return (
    <div>
      <PageHeader
        title="Pipeline"
        description="Arraste os cartões entre as etapas. No celular, segure o cartão por um instante ou use a visão em lista."
      />
      <Suspense fallback={<SectionSkeleton rows={3} />}>
        <PipelineContent />
      </Suspense>
    </div>
  );
}

async function PipelineContent() {
  const leads = await getPipelineLeads();
  if (leads.length === 0) {
    return (
      <EmptyState
        title="O pipeline está vazio"
        description="Cadastre os negócios que você encontrar no Instagram, no Google ou por indicação e acompanhe cada um até fechar."
        action={<ButtonLink href="/painel/leads/novo">Cadastrar lead</ButtonLink>}
      />
    );
  }
  return <KanbanBoard initialLeads={leads} />;
}
