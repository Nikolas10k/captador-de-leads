import { Suspense } from "react";
import { Download } from "lucide-react";
import { buttonClass, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader, SectionSkeleton } from "@/features/panel/page-header";
import { LeadFiltersForm } from "@/features/leads/components/lead-filters";
import { LeadListItem } from "@/features/leads/components/lead-list-item";
import { listLeads, parseLeadFilters, type LeadFilters } from "@/features/leads/queries";

export const metadata = { title: "Leads" };

export default function LeadsPage({ searchParams }: PageProps<"/painel/leads">) {
  return (
    <div className="mx-auto max-w-5xl">
      <Suspense fallback={<SectionSkeleton rows={6} />}>
        <LeadsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function toQuery(filters: LeadFilters) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) if (v) qs.set(k, v);
  const s = qs.toString();
  return s ? `?${s}` : "";
}

async function LeadsContent({ searchParams }: { searchParams: PageProps<"/painel/leads">["searchParams"] }) {
  const filters = parseLeadFilters(await searchParams);
  const leads = await listLeads(filters);
  const filtered = Object.values(filters).some(Boolean);

  return (
    <>
      <PageHeader
        title="Leads"
        description={`${leads.length} ${leads.length === 1 ? "lead encontrado" : "leads encontrados"}`}
        actions={
          <a href={`/painel/leads/exportar${toQuery(filters)}`} className={buttonClass("secondary", "md")} download>
            <Download aria-hidden className="size-4" />
            Exportar CSV
          </a>
        }
      />
      <LeadFiltersForm filters={filters} />
      {leads.length === 0 ? (
        filtered ? (
          <EmptyState
            title="Nenhum lead com esses filtros"
            description="Tente outro termo de busca ou remova alguns filtros."
            action={<ButtonLink href="/painel/leads" variant="secondary">Limpar filtros</ButtonLink>}
          />
        ) : (
          <EmptyState
            title="Nenhum lead ainda"
            description="Quando alguém preencher o diagnóstico no site, o lead aparece aqui. Você também pode cadastrar leads de prospecção."
            action={<ButtonLink href="/painel/leads/novo">Cadastrar lead</ButtonLink>}
          />
        )
      ) : (
        <ul className="flex flex-col gap-2">
          {leads.map((l) => (
            <LeadListItem key={l.id} lead={l} />
          ))}
        </ul>
      )}
    </>
  );
}
