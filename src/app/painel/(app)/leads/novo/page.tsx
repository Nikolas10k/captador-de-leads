import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/features/panel/page-header";
import { LeadForm } from "@/features/leads/components/lead-form";
import { createLead } from "@/features/leads/actions";

export const metadata = { title: "Novo lead" };

export default function NewLeadPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/painel/leads" className="mb-4 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft aria-hidden className="size-4" />
        Leads
      </Link>
      <PageHeader
        title="Novo lead"
        description="Negócios que você encontrou no Instagram ou no Google, indicações e contatos que chegaram pelo WhatsApp. Só o nome é obrigatório."
      />
      <Card>
        <LeadForm action={createLead} mode="create" />
      </Card>
    </div>
  );
}
