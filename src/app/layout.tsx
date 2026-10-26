import type { Metadata, Viewport } from "next";
import { Public_Sans } from "next/font/google";
import { siteConfig } from "@/config/site";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: "Givance Leads", template: "%s · Givance Leads" },
  description: "Painel de prospecção e gestão de leads da Givance Tech.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#faf9f7",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${publicSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
