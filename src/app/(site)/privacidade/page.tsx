import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Política de privacidade",
};

export default function PrivacidadePage() {
  return (
    <article className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 text-ink sm:px-6 md:py-16 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_li]:text-muted [&_p]:text-muted [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-6">
      <h1 className="text-3xl font-semibold tracking-tight">Política de privacidade</h1>
      <p>Versão {siteConfig.consentVersion}. Esta política explica como a Givance Tech trata os dados enviados pelo diagnóstico, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).</p>

      <h2>Quais dados coletamos</h2>
      <ul>
        <li>Dados que você informa: nome, nome do negócio, WhatsApp, Instagram, região e as respostas do diagnóstico.</li>
        <li>Dados de navegação: página de entrada, site de origem, parâmetros de campanha (UTM) e tipo de dispositivo.</li>
        <li>Seu endereço IP é guardado apenas de forma cifrada (hash), para evitar envios automáticos em massa.</li>
      </ul>

      <h2>Para que usamos</h2>
      <ul>
        <li>Entrar em contato sobre o seu diagnóstico e enviar prévias e propostas.</li>
        <li>Entender quais canais de divulgação trazem clientes.</li>
      </ul>
      <p>A base legal é o seu consentimento, registrado com data e versão desta política no momento do envio.</p>

      <h2>Com quem compartilhamos</h2>
      <p>Não vendemos seus dados. Usamos fornecedores para operar o serviço (hospedagem, banco de dados e envio de e-mail), que tratam os dados apenas em nosso nome. Se você chegou por um anúncio, o Meta e o Google podem registrar a visita pelos seus próprios cookies.</p>

      <h2>Por quanto tempo guardamos</h2>
      <p>Enquanto houver relação comercial ou interesse em contato. Você pode pedir a exclusão a qualquer momento.</p>

      <h2>Seus direitos</h2>
      <p>Você pode pedir acesso, correção ou exclusão dos seus dados, ou retirar o consentimento, pelo WhatsApp {siteConfig.whatsappDisplay}.</p>
    </article>
  );
}
