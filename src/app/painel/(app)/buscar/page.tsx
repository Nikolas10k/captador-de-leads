import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/features/panel/page-header";
import { placesConfigured } from "@/features/prospecting/google-places";
import { ProspectSearch } from "@/features/prospecting/prospect-search";

export const metadata = { title: "Buscar clientes" };

export default function BuscarPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Buscar clientes"
        description="Procure no Google Maps negócios do DF e entorno sem site e adicione ao pipeline com um clique. Eles já entram com o primeiro contato marcado para hoje."
      />
      {placesConfigured() ? (
        <ProspectSearch />
      ) : (
        <EmptyState
          title="A busca no Google Maps ainda não foi ativada"
          description="Peça ao administrador para cadastrar a chave GOOGLE_PLACES_API_KEY na Vercel (passo a passo no README do projeto)."
        />
      )}
    </div>
  );
}
