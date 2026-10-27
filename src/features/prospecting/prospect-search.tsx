"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ExternalLink, MapPin, Search, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { describedBy, Field, Input, Select } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, formatPhone } from "@/lib/format";
import { useFormAction } from "@/lib/use-form-action";
import { DF_REGIONS, ENTORNO_CITIES } from "@/features/leads/options";
import { importProspects, searchProspects, type ProspectResult, type SearchState } from "./actions";

const SUGGESTIONS = [
  "barbearia",
  "salão de beleza",
  "clínica de estética",
  "clínica odontológica",
  "pet shop",
  "academia",
  "oficina mecânica",
  "lava jato",
  "restaurante",
  "hamburgueria",
  "doceria",
  "loja de roupas",
  "imobiliária",
  "escritório de contabilidade",
  "fisioterapia",
  "nutricionista",
  "autoescola",
  "vidraçaria",
  "serralheria",
  "marmoraria",
];

export function ProspectSearch() {
  const [state, onSubmit, searching] = useFormAction<SearchState>(searchProspects, {});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState<Record<string, string>>({});
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string }>();
  const [importing, startImport] = useTransition();
  const e = state.errors ?? {};

  const results = (state.results ?? []).map((r) => ({ ...r, leadId: r.leadId ?? added[r.placeId] ?? null }));
  const available = results.filter((r) => !r.leadId);

  function toggle(id: string, on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function add(items: ProspectResult[]) {
    if (items.length === 0) return;
    setImportMsg(undefined);
    startImport(async () => {
      const res = await importProspects(
        items.map((p) => ({ ...p, leadId: undefined })),
        state.query?.region ?? "",
      );
      setImportMsg({ ok: res.ok, text: res.message ?? "" });
      if (res.ok && res.created) {
        setAdded((prev) => ({ ...prev, ...res.created }));
        setSelected(new Set());
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:p-6" noValidate>
        <input type="hidden" name="mode" value="new" />
        <div className="grid gap-4 md:grid-cols-[1fr_260px]">
          <Field id="term" label="Tipo de negócio" error={e.term} hint="Ex.: barbearia, pet shop, clínica de estética">
            <Input
              id="term"
              name="term"
              list="term-suggestions"
              defaultValue={state.query?.term}
              aria-invalid={!!e.term}
              aria-describedby={describedBy("term", e.term, true)}
            />
            <datalist id="term-suggestions">
              {SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>
          <Field id="region" label="Região" error={e.region}>
            <Select id="region" name="region" defaultValue={state.query?.region ?? ""} aria-invalid={!!e.region}>
              <option value="">Selecione</option>
              <optgroup label="Distrito Federal">
                {DF_REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Entorno (Goiás)">
                {ENTORNO_CITIES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </optgroup>
            </Select>
          </Field>
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name="onlyNoSite" defaultChecked={state.query?.onlyNoSite ?? true} className="size-4 accent-accent" />
          Mostrar só negócios sem site próprio (quem tem só Instagram ou Facebook entra)
        </label>
        <div>
          <Button type="submit" disabled={searching}>
            <Search aria-hidden className="size-4" />
            {searching ? "Buscando no Google Maps…" : "Buscar negócios"}
          </Button>
        </div>
        {state.message && !state.ok && (
          <p role="alert" className="rounded-lg bg-danger-soft p-4 text-sm text-danger">
            {state.message}
          </p>
        )}
      </form>

      {state.ok && results.length === 0 && (
        <EmptyState
          title="Nenhum negócio sem site nessa busca"
          description={
            state.hiddenWithSite
              ? `Os ${state.hiddenWithSite} resultados encontrados já têm site. Tente outra região ou outro tipo de negócio.`
              : "O Google não encontrou resultados. Tente um termo mais comum, como “salão de beleza” em vez de “estúdio de sobrancelha”."
          }
        />
      )}

      {results.length > 0 && (
        <section aria-labelledby="results-title" className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="results-title" className="font-semibold">
                {results.length} {results.length === 1 ? "negócio encontrado" : "negócios encontrados"}
              </h2>
              <p className="text-sm text-muted">
                Celulares primeiro (dá para chamar no WhatsApp), depois os com mais avaliações.
                {state.hiddenWithSite ? ` ${state.hiddenWithSite} com site próprio ficaram de fora.` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={available.length === 0}
                onClick={() => setSelected(selected.size === available.length ? new Set() : new Set(available.map((r) => r.placeId)))}
              >
                {selected.size === available.length && available.length > 0 ? "Desmarcar todos" : "Marcar todos"}
              </Button>
              <Button
                size="sm"
                disabled={selected.size === 0 || importing}
                onClick={() => add(results.filter((r) => selected.has(r.placeId) && !r.leadId))}
              >
                {importing ? "Adicionando…" : `Adicionar ${selected.size || ""} ao pipeline`}
              </Button>
            </div>
          </div>

          {importMsg && (
            <p role="status" className={cn("rounded-lg p-4 text-sm", importMsg.ok ? "bg-success-soft text-success" : "bg-danger-soft text-danger")}>
              {importMsg.text}
              {importMsg.ok && (
                <>
                  {" "}
                  <Link href="/painel" className="font-semibold underline underline-offset-4">
                    Ver na tela Hoje
                  </Link>
                </>
              )}
            </p>
          )}

          <ul className="flex flex-col gap-2">
            {results.map((r) => (
              <ResultItem
                key={r.placeId}
                result={r}
                checked={selected.has(r.placeId)}
                onCheck={(on) => toggle(r.placeId, on)}
                onAdd={() => add([r])}
                busy={importing}
              />
            ))}
          </ul>

          {state.nextPageToken && (
            <form onSubmit={onSubmit}>
              <input type="hidden" name="mode" value="more" />
              <Button type="submit" variant="secondary" disabled={searching}>
                {searching ? "Buscando…" : "Carregar mais resultados"}
              </Button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}

function ResultItem({
  result: r,
  checked,
  onCheck,
  onAdd,
  busy,
}: {
  result: ProspectResult;
  checked: boolean;
  onCheck: (on: boolean) => void;
  onAdd: () => void;
  busy: boolean;
}) {
  const id = `chk-${r.placeId}`;
  return (
    <li className="flex gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-4">
      <div className="pt-1">
        {r.leadId ? (
          <span className="block size-4" />
        ) : (
          <input
            id={id}
            type="checkbox"
            className="size-4 accent-accent"
            checked={checked}
            onChange={(e) => onCheck(e.target.checked)}
            aria-label={`Selecionar ${r.name}`}
          />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{r.name}</span>
            {r.ownSite ? (
              <Badge>Tem site</Badge>
            ) : r.website ? (
              <Badge tone="accent">Só rede social</Badge>
            ) : (
              <Badge tone="accent">Sem site</Badge>
            )}
          </div>
          <p className="text-sm text-muted">
            {[r.category, r.address].filter(Boolean).join(" · ")}
          </p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            {r.phone ? (
              <span>
                {formatPhone(r.phone)}{" "}
                <span className={r.isMobile ? "text-success" : "text-muted"}>{r.isMobile ? "· celular (WhatsApp)" : "· fixo"}</span>
              </span>
            ) : (
              <span className="text-muted">Sem telefone no Google</span>
            )}
            {r.rating != null && (
              <span className="inline-flex items-center gap-1">
                <Star aria-hidden className="size-3.5" />
                {String(r.rating).replace(".", ",")} <span className="text-muted">({r.reviews} avaliações)</span>
              </span>
            )}
            {r.mapsUrl && (
              <a href={r.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-muted hover:text-ink">
                <MapPin aria-hidden className="size-3.5" />
                Ver no Maps
                <ExternalLink aria-hidden className="size-3" />
              </a>
            )}
          </p>
        </div>
        <div className="shrink-0">
          {r.leadId ? (
            <Link href={`/painel/leads/${r.leadId}`} className="text-sm font-semibold text-accent underline underline-offset-4">
              Já no pipeline
            </Link>
          ) : (
            <Button variant="secondary" size="sm" disabled={busy} onClick={onAdd}>
              Adicionar
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}
