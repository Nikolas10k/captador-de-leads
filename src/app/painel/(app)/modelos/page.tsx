import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TEMPLATE_PLACEHOLDERS } from "@/lib/whatsapp";
import { PageHeader, SectionSkeleton } from "@/features/panel/page-header";
import { getTemplates } from "@/features/leads/queries";
import { updateTemplate } from "@/features/leads/actions";
import { TemplateEditor } from "@/features/templates/template-editor";

export const metadata = { title: "Modelos de mensagem" };

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Modelos de mensagem"
        description={
          <>
            Use {TEMPLATE_PLACEHOLDERS.map((p, i) => (
              <span key={p}>
                <code className="rounded bg-subtle px-1">{p}</code>
                {i < TEMPLATE_PLACEHOLDERS.length - 1 ? ", " : ""}
              </span>
            ))}{" "}
            para preencher com os dados do lead.
          </>
        }
      />
      <Suspense fallback={<SectionSkeleton rows={4} />}>
        <TemplatesContent />
      </Suspense>
    </div>
  );
}

async function TemplatesContent() {
  const templates = await getTemplates();
  if (templates.length === 0) {
    return (
      <EmptyState
        title="Nenhum modelo cadastrado"
        description="Os quatro modelos padrão são criados pela migration do banco. Rode as migrations de novo para recriá-los."
      />
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {templates.map((t) => (
        <Card key={t.id}>
          <TemplateEditor id={t.id} name={t.name} body={t.body} action={updateTemplate.bind(null, t.id)} />
        </Card>
      ))}
    </div>
  );
}
