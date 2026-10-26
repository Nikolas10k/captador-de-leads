"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { MessageCircle } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/field";
import { fillTemplate, leadWaLink } from "@/lib/whatsapp";
import { logWhatsAppSent } from "../actions";
import type { Lead, MessageTemplate } from "../queries";

type Props = {
  lead: Pick<Lead, "id" | "name" | "business_name" | "whatsapp" | "preview_url" | "estimated_value">;
  templates: MessageTemplate[];
};

export function WhatsAppComposer({ lead, templates }: Props) {
  const id = useId();
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const template = templates.find((t) => t.id === templateId);
  const [message, setMessage] = useState(template ? fillTemplate(template.body, lead) : "");

  if (!lead.whatsapp) {
    return <p className="text-sm text-muted">Cadastre o WhatsApp do lead em “Dados do lead” para usar os modelos de mensagem.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-tpl`} className="text-sm font-semibold">
          Modelo
        </label>
        <Select
          id={`${id}-tpl`}
          value={templateId}
          onChange={(e) => {
            setTemplateId(e.target.value);
            const t = templates.find((x) => x.id === e.target.value);
            setMessage(t ? fillTemplate(t.body, lead) : "");
          }}
        >
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
          <option value="">Mensagem livre</option>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-msg`} className="text-sm font-semibold">
          Mensagem
        </label>
        <Textarea id={`${id}-msg`} rows={6} value={message} onChange={(e) => setMessage(e.target.value)} />
        <p className="text-sm text-muted">
          Edite à vontade antes de abrir. Os modelos ficam em{" "}
          <Link href="/painel/modelos" className="font-semibold underline underline-offset-4">
            Modelos
          </Link>
          .
        </p>
      </div>
      <a
        href={leadWaLink(lead.whatsapp, message)}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass("whatsapp", "md", "self-start")}
        onClick={() => {
          if (message.trim()) void logWhatsAppSent(lead.id, template?.name ?? "Mensagem livre", message);
        }}
      >
        <MessageCircle aria-hidden className="size-4" />
        Abrir no WhatsApp
      </a>
    </div>
  );
}
