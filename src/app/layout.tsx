import type { Metadata, Viewport } from "next";
import { Public_Sans } from "next/font/google";
import { Analytics } from "@/features/tracking/analytics";
import { siteConfig } from "@/config/site";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Givance Tech · Sites e automação de WhatsApp em Brasília",
    template: "%s · Givance Tech",
  },
  description:
    "Sites, landing pages e automação de WhatsApp para pequenos negócios do DF. Receba uma prévia do seu site antes de decidir.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Givance Tech",
  },
};

export const viewport: Viewport = {
  themeColor: "#faf9f7",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${publicSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
