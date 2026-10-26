import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { SEGMENTS, SOURCES, STAGES, TEMPERATURES } from "../options";
import type { LeadFilters } from "../queries";

/** Formulário GET: funciona sem JavaScript e mantém os filtros na URL (dá para salvar o link) */
export function LeadFiltersForm({ filters }: { filters: LeadFilters }) {
  const active = Object.values(filters).some(Boolean);
  const selects = [
    { name: "etapa", label: "Etapa", options: STAGES, value: filters.etapa },
    { name: "origem", label: "Origem", options: SOURCES, value: filters.origem },
    { name: "segmento", label: "Segmento", options: SEGMENTS, value: filters.segmento },
    { name: "temperatura", label: "Temperatura", options: TEMPERATURES, value: filters.temperatura },
  ] as const;

  return (
    <form method="get" role="search" className="mb-6 flex flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="q" className="text-sm font-semibold">
          Buscar
        </label>
        <div className="flex gap-2">
          <Input id="q" name="q" type="search" defaultValue={filters.q} placeholder="Nome, negócio, Instagram ou telefone" />
          <Button type="submit" variant="secondary" className="h-11" aria-label="Buscar">
            <Search aria-hidden className="size-4" />
            <span className="hidden sm:inline">Buscar</span>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {selects.map((s) => (
          <div key={s.name} className="flex flex-col gap-2">
            <label htmlFor={`f-${s.name}`} className="text-sm font-semibold">
              {s.label}
            </label>
            <Select id={`f-${s.name}`} name={s.name} defaultValue={s.value ?? ""}>
              <option value="">Todas</option>
              {(s.options as readonly { value: string; label: string }[]).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit">Aplicar filtros</Button>
        {active && (
          <Link href="/painel/leads" className="inline-flex h-10 items-center px-3 text-sm font-semibold text-muted hover:text-ink">
            Limpar filtros
          </Link>
        )}
      </div>
    </form>
  );
}
