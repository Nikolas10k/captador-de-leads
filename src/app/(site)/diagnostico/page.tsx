import type { Metadata } from "next";
import { DiagnosticForm } from "@/features/diagnostico/diagnostic-form";

export const metadata: Metadata = {
  title: "Diagnóstico gratuito",
  description: "Responda em 2 minutos e receba uma recomendação para o seu negócio, com prévia gratuita do seu site.",
};

export default function DiagnosticoPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 md:py-16">
      <DiagnosticForm />
    </div>
  );
}
