"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useFormAction } from "@/lib/use-form-action";
import { describedBy, Field, Input, Select, Textarea } from "@/components/ui/field";
import { formatPhone, maskPhoneBR } from "@/lib/format";
import { BUDGETS, NEEDS, REGIONS, SEGMENTS, SOURCES, TIMELINES } from "../options";
import type { ActionState } from "../schema";
import type { Lead } from "../queries";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  lead?: Lead;
  mode: "create" | "edit";
};

const triValue = (v: boolean | null | undefined) => (v == null ? "" : v ? "sim" : "nao");

export function LeadForm({ action, lead, mode }: Props) {
  const [state, onSubmit, pending] = useFormAction<ActionState>(action, {});
  const [phone, setPhone] = useState(formatPhone(lead?.whatsapp));
  const [segment, setSegment] = useState(lead?.segment ?? "");
  const e = state.errors ?? {};

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8" noValidate>
      <fieldset className="grid gap-6 sm:grid-cols-2">
        <legend className="mb-4 text-base font-semibold">Contato</legend>
        <Field id="name" label="Nome do contato" error={e.name}>
          <Input id="name" name="name" defaultValue={lead?.name} required aria-invalid={!!e.name} aria-describedby={describedBy("name", e.name)} />
        </Field>
        <Field id="business_name" label="Negócio" optional error={e.business_name}>
          <Input id="business_name" name="business_name" defaultValue={lead?.business_name ?? ""} />
        </Field>
        <Field id="whatsapp" label="WhatsApp" optional error={e.whatsapp}>
          <Input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            placeholder="(61) 99999-9999"
            value={phone}
            onChange={(ev) => setPhone(maskPhoneBR(ev.target.value))}
            aria-invalid={!!e.whatsapp}
            aria-describedby={describedBy("whatsapp", e.whatsapp)}
          />
        </Field>
        <Field id="instagram" label="Instagram" optional hint="@perfil ou link" error={e.instagram}>
          <Input id="instagram" name="instagram" autoCapitalize="none" defaultValue={lead?.instagram ?? ""} aria-describedby={describedBy("instagram", e.instagram, true)} />
        </Field>
        <Field id="city_region" label="Região" optional error={e.city_region}>
          <Input id="city_region" name="city_region" list="regions" defaultValue={lead?.city_region ?? ""} />
          <datalist id="regions">
            {REGIONS.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </Field>
        <Field id="source" label="Origem" error={e.source}>
          <Select id="source" name="source" defaultValue={lead?.source ?? "prospeccao_ativa"} aria-invalid={!!e.source}>
            {SOURCES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="website_url" label="Site atual" optional error={e.website_url}>
          <Input id="website_url" name="website_url" type="url" inputMode="url" placeholder="https://" defaultValue={lead?.website_url ?? ""} />
        </Field>
        <Field id="preview_url" label="Link da prévia criada" optional error={e.preview_url}>
          <Input id="preview_url" name="preview_url" type="url" inputMode="url" placeholder="https://" defaultValue={lead?.preview_url ?? ""} />
        </Field>
      </fieldset>

      <fieldset className="grid gap-6 sm:grid-cols-2">
        <legend className="mb-4 text-base font-semibold">Diagnóstico</legend>
        <Field id="segment" label="Segmento" optional error={e.segment}>
          <Select id="segment" name="segment" value={segment} onChange={(ev) => setSegment(ev.target.value)}>
            <option value="">Não informado</option>
            {SEGMENTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>
        {segment === "outro" ? (
          <Field id="segment_other" label="Qual segmento?" error={e.segment_other}>
            <Input id="segment_other" name="segment_other" defaultValue={lead?.segment_other ?? ""} />
          </Field>
        ) : (
          <div className="hidden sm:block" />
        )}
        <Field id="budget_range" label="Faixa de investimento" optional error={e.budget_range}>
          <Select id="budget_range" name="budget_range" defaultValue={lead?.budget_range ?? ""}>
            <option value="">Não informado</option>
            {BUDGETS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="timeline" label="Prazo" optional error={e.timeline}>
          <Select id="timeline" name="timeline" defaultValue={lead?.timeline ?? ""}>
            <option value="">Não informado</option>
            {TIMELINES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
        {(
          [
            ["has_website", "Já tem site?"],
            ["sells_on_instagram", "Vende pelo Instagram?"],
            ["orders_via_whatsapp", "Pedidos pelo WhatsApp?"],
          ] as const
        ).map(([key, label]) => (
          <Field key={key} id={key} label={label} optional>
            <Select id={key} name={key} defaultValue={triValue(lead?.[key])}>
              <option value="">Não sei</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
        ))}
        <fieldset className="flex flex-col gap-2 sm:col-span-2">
          <legend className="mb-2 text-sm font-semibold">O que precisa</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {NEEDS.map((n) => (
              <label key={n.value} className="flex items-center gap-3 text-sm">
                <input type="checkbox" name="needs" value={n.value} defaultChecked={lead?.needs.includes(n.value)} className="size-4 accent-accent" />
                {n.label}
              </label>
            ))}
          </div>
        </fieldset>
      </fieldset>

      {mode === "create" && (
        <fieldset className="grid gap-6 sm:grid-cols-2">
          <legend className="mb-4 text-base font-semibold">Próximo passo</legend>
          <Field id="next_action" label="Próxima ação" optional error={e.next_action}>
            <Input id="next_action" name="next_action" placeholder="Ex.: mandar primeira mensagem" />
          </Field>
          <Field id="next_action_at" label="Quando" optional error={e.next_action_at}>
            <Input id="next_action_at" name="next_action_at" type="datetime-local" />
          </Field>
          <Field id="estimated_value" label="Valor estimado (R$)" optional error={e.estimated_value}>
            <Input id="estimated_value" name="estimated_value" inputMode="decimal" placeholder="2.500" aria-invalid={!!e.estimated_value} />
          </Field>
          <Field id="note" label="Observação" optional className="sm:col-span-2" error={e.note}>
            <Textarea id="note" name="note" placeholder="Onde encontrou, o que chamou atenção, ideias para a prévia…" />
          </Field>
        </fieldset>
      )}

      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={state.ok ? "text-sm text-success" : "rounded-lg bg-danger-soft p-4 text-sm text-danger"}>
          {state.message}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : mode === "create" ? "Cadastrar lead" : "Salvar dados"}
        </Button>
      </div>
    </form>
  );
}
