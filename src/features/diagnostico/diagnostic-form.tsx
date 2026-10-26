"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, MessageCircle } from "lucide-react";
import { Button, ButtonExternal } from "@/components/ui/button";
import { Choice, describedBy, Field, FieldError, Input, Select } from "@/components/ui/field";
import { maskPhoneBR } from "@/lib/format";
import { givanceWaLink } from "@/lib/whatsapp";
import { BUDGETS, NEEDS, REGIONS, SEGMENTS, TIMELINES } from "@/features/leads/options";
import { getAttribution } from "@/features/tracking/attribution";
import { track } from "@/features/tracking/events";
import { emptyDraft, fieldErrors, STEP_TITLES, stepSchemas, type DiagnosticDraft } from "./schema";
import { diagnosticWhatsAppMessage } from "./summary";

const DRAFT_KEY = "gv_diagnostico_rascunho";
type Errors = Record<string, string>;

export function DiagnosticForm() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<DiagnosticDraft>(emptyDraft);
  const [errors, setErrors] = useState<Errors>({});
  const [showErrors, setShowErrors] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const startedAt = useRef(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const firstRender = useRef(true);

  // Restaura rascunho (sessão) e marca início
  useEffect(() => {
    startedAt.current = Date.now();
    track({ name: "diagnostic_start" });
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura única de storage após montar
      if (saved) setDraft({ ...emptyDraft, ...JSON.parse(saved), consent: false });
    } catch {
      // sem storage: segue em branco
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // ignora
    }
  }, [draft]);

  // Foco no título ao trocar de etapa (leitores de tela anunciam a nova etapa)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step, status]);

  function validate(d: DiagnosticDraft, s = step) {
    const result = stepSchemas[s].safeParse(d);
    return result.success ? {} : fieldErrors(result.error);
  }

  function update<K extends keyof DiagnosticDraft>(key: K, value: DiagnosticDraft[K]) {
    const next = { ...draft, [key]: value };
    setDraft(next);
    if (showErrors) setErrors(validate(next));
  }

  function toggleNeed(value: string, checked: boolean) {
    let needs = checked ? [...draft.needs, value] : draft.needs.filter((n) => n !== value);
    // "Ainda não sei" é exclusivo
    if (checked && value === "nao_sei") needs = ["nao_sei"];
    if (checked && value !== "nao_sei") needs = needs.filter((n) => n !== "nao_sei");
    update("needs", needs);
  }

  function focusFirstError(errs: Errors) {
    const first = Object.keys(errs)[0];
    if (!first) return;
    const el = formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`);
    el?.focus();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(draft);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setShowErrors(true);
      focusFirstError(errs);
      return;
    }
    setShowErrors(false);

    if (step < stepSchemas.length - 1) {
      setStep(step + 1);
      track({ name: "diagnostic_step", step: step + 2 });
      return;
    }

    setStatus("sending");
    setSubmitError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...draft,
          attribution: getAttribution(),
          company_website: honeypot,
          elapsed_ms: Date.now() - startedAt.current,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("idle");
        setSubmitError(json.message ?? "Não conseguimos enviar agora. Tente de novo em instantes.");
        if (json.errors) {
          setErrors(json.errors);
          setShowErrors(true);
        }
        return;
      }
      track({ name: "lead_submitted", segment: draft.segment, budget: draft.budget_range });
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {}
      setStatus("done");
    } catch {
      setStatus("idle");
      setSubmitError("Sem conexão no momento. Seus dados continuam aqui: confira a internet e tente de novo.");
    }
  }

  if (status === "done") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex size-12 items-center justify-center rounded-full bg-success-soft text-success">
          <Check aria-hidden className="size-6" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Recebemos seu diagnóstico, {draft.name.split(" ")[0]}.
          </h1>
          <p className="max-w-prose text-muted">
            Vamos analisar o {draft.business_name} e responder pelo WhatsApp em até 1 dia útil. Se preferir adiantar, mande
            agora o resumo para a gente: a conversa já começa com tudo que você respondeu.
          </p>
        </div>
        <ButtonExternal
          href={givanceWaLink(diagnosticWhatsAppMessage(draft))}
          variant="whatsapp"
          size="lg"
          className="self-start"
          onClick={() => track({ name: "whatsapp_click", placement: "obrigado" })}
        >
          <MessageCircle aria-hidden className="size-5" />
          Falar agora no WhatsApp
        </ButtonExternal>
        <Link href="/" className="text-sm font-semibold text-muted underline underline-offset-4 hover:text-ink">
          Voltar para o início
        </Link>
      </div>
    );
  }

  const shown = showErrors ? errors : {};
  const total = stepSchemas.length;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            Etapa {step + 1} de {total}
          </span>
          <span>Leva cerca de 2 minutos</span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-subtle"
          role="progressbar"
          aria-label="Progresso do diagnóstico"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={step + 1}
        >
          <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${((step + 1) / total) * 100}%` }} />
        </div>
        <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {STEP_TITLES[step]}
        </h1>
      </div>

      {/* Honeypot: escondido de pessoas e de leitores de tela */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="company_website">Site da empresa</label>
        <input
          id="company_website"
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {step === 0 && (
        <div className="flex flex-col gap-6">
          <Field id="name" label="Seu nome" error={shown.name}>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              value={draft.name}
              onChange={(e) => update("name", e.target.value)}
              aria-invalid={!!shown.name}
              aria-describedby={describedBy("name", shown.name)}
            />
          </Field>
          <Field id="business_name" label="Nome do negócio" error={shown.business_name}>
            <Input
              id="business_name"
              name="business_name"
              autoComplete="organization"
              value={draft.business_name}
              onChange={(e) => update("business_name", e.target.value)}
              aria-invalid={!!shown.business_name}
              aria-describedby={describedBy("business_name", shown.business_name)}
            />
          </Field>
          <Field id="whatsapp" label="WhatsApp" hint="Vamos responder por aqui." error={shown.whatsapp}>
            <Input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="(61) 99999-9999"
              value={draft.whatsapp}
              onChange={(e) => update("whatsapp", maskPhoneBR(e.target.value))}
              aria-invalid={!!shown.whatsapp}
              aria-describedby={describedBy("whatsapp", shown.whatsapp, true)}
            />
          </Field>
          <Field id="instagram" label="Instagram do negócio" optional error={shown.instagram}>
            <Input
              id="instagram"
              name="instagram"
              autoCapitalize="none"
              placeholder="@seunegocio"
              value={draft.instagram}
              onChange={(e) => update("instagram", e.target.value)}
              aria-invalid={!!shown.instagram}
              aria-describedby={describedBy("instagram", shown.instagram)}
            />
          </Field>
          <Field id="city_region" label="Cidade ou região administrativa" error={shown.city_region}>
            <Select
              id="city_region"
              name="city_region"
              value={draft.city_region}
              onChange={(e) => update("city_region", e.target.value)}
              aria-invalid={!!shown.city_region}
              aria-describedby={describedBy("city_region", shown.city_region)}
            >
              <option value="">Selecione</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-8">
          <fieldset className="flex flex-col gap-4" aria-describedby={describedBy("segment", shown.segment)}>
            <legend className="mb-4 text-sm font-semibold">Segmento do negócio</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {SEGMENTS.map((s) => (
                <Choice
                  key={s.value}
                  type="radio"
                  name="segment"
                  value={s.value}
                  label={s.label}
                  checked={draft.segment === s.value}
                  onChange={() => update("segment", s.value)}
                />
              ))}
            </div>
            <FieldError id="segment" error={shown.segment} />
            {draft.segment === "outro" && (
              <Field id="segment_other" label="Qual é o seu segmento?" error={shown.segment_other}>
                <Input
                  id="segment_other"
                  name="segment_other"
                  value={draft.segment_other}
                  onChange={(e) => update("segment_other", e.target.value)}
                  aria-invalid={!!shown.segment_other}
                  aria-describedby={describedBy("segment_other", shown.segment_other)}
                />
              </Field>
            )}
          </fieldset>

          {(
            [
              ["has_website", "Já tem site?"],
              ["sells_on_instagram", "Vende pelo Instagram?"],
              ["orders_via_whatsapp", "Recebe pedidos ou agendamentos pelo WhatsApp?"],
            ] as const
          ).map(([key, question]) => (
            <fieldset key={key} className="flex flex-col gap-2" aria-describedby={describedBy(key, shown[key])}>
              <legend className="mb-2 text-sm font-semibold">{question}</legend>
              <div className="grid grid-cols-2 gap-2">
                {(["sim", "nao"] as const).map((v) => (
                  <Choice
                    key={v}
                    type="radio"
                    name={key}
                    value={v}
                    label={v === "sim" ? "Sim" : "Não"}
                    checked={draft[key] === v}
                    onChange={() => update(key, v)}
                  />
                ))}
              </div>
              <FieldError id={key} error={shown[key]} />
            </fieldset>
          ))}
        </div>
      )}

      {step === 2 && (
        <fieldset className="flex flex-col gap-4" aria-describedby={describedBy("needs", shown.needs, true)}>
          <legend className="mb-2 text-sm font-semibold">Marque tudo que faz sentido para você agora</legend>
          <p id="needs-hint" className="-mt-2 text-sm text-muted">
            Não precisa ter certeza. A gente ajuda a definir no diagnóstico.
          </p>
          <div className="grid gap-2">
            {NEEDS.map((n) => (
              <Choice
                key={n.value}
                type="checkbox"
                name="needs"
                value={n.value}
                label={n.label}
                checked={draft.needs.includes(n.value)}
                onChange={(e) => toggleNeed(n.value, e.target.checked)}
              />
            ))}
          </div>
          <FieldError id="needs" error={shown.needs} />
        </fieldset>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-8">
          <fieldset className="flex flex-col gap-2" aria-describedby={describedBy("budget_range", shown.budget_range)}>
            <legend className="mb-2 text-sm font-semibold">Quanto pretende investir?</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {BUDGETS.map((b) => (
                <Choice
                  key={b.value}
                  type="radio"
                  name="budget_range"
                  value={b.value}
                  label={b.label}
                  checked={draft.budget_range === b.value}
                  onChange={() => update("budget_range", b.value)}
                />
              ))}
            </div>
            <FieldError id="budget_range" error={shown.budget_range} />
          </fieldset>

          <fieldset className="flex flex-col gap-2" aria-describedby={describedBy("timeline", shown.timeline)}>
            <legend className="mb-2 text-sm font-semibold">Para quando você precisa?</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {TIMELINES.map((t) => (
                <Choice
                  key={t.value}
                  type="radio"
                  name="timeline"
                  value={t.value}
                  label={t.label}
                  checked={draft.timeline === t.value}
                  onChange={() => update("timeline", t.value)}
                />
              ))}
            </div>
            <FieldError id="timeline" error={shown.timeline} />
          </fieldset>

          <div className="flex flex-col gap-2">
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                name="consent"
                className="mt-0.5 size-4 shrink-0 accent-accent"
                checked={draft.consent}
                onChange={(e) => update("consent", e.target.checked)}
                aria-invalid={!!shown.consent}
                aria-describedby={describedBy("consent", shown.consent)}
              />
              <span>
                Autorizo a Givance Tech a usar estes dados para entrar em contato sobre o meu diagnóstico, conforme a{" "}
                <Link href="/privacidade" target="_blank" className="font-semibold text-accent underline underline-offset-4">
                  política de privacidade
                </Link>
                .
              </span>
            </label>
            <FieldError id="consent" error={shown.consent} />
          </div>
        </div>
      )}

      {submitError && (
        <p role="alert" className="rounded-lg bg-danger-soft p-4 text-sm text-danger">
          {submitError}
        </p>
      )}

      <div className="flex items-center justify-between gap-4 border-t border-line pt-6">
        {step > 0 ? (
          <Button
            variant="ghost"
            onClick={() => {
              setShowErrors(false);
              setStep(step - 1);
            }}
          >
            <ArrowLeft aria-hidden className="size-4" />
            Voltar
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" size="lg" disabled={status === "sending"}>
          {step < total - 1 ? (
            <>
              Continuar
              <ArrowRight aria-hidden className="size-4" />
            </>
          ) : status === "sending" ? (
            "Enviando…"
          ) : (
            "Enviar diagnóstico"
          )}
        </Button>
      </div>
    </form>
  );
}
