import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LogOut, Plus } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { Logo } from "@/features/panel/logo";
import { BottomNav, SideNav } from "@/features/panel/nav";
import { getMember } from "@/features/auth/session";
import { signOut } from "@/features/auth/actions";

export const metadata: Metadata = {
  title: { default: "Painel", template: "%s · Painel Givance" },
  robots: { index: false, follow: false },
};

export default function PanelLayout({ children }: LayoutProps<"/painel">) {
  return (
    <div className="flex min-h-full flex-1">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-8 border-r border-line bg-surface p-4 md:flex">
        <Logo />
        <SideNav />
        <div className="mt-auto">
          <Suspense fallback={null}>
            <UserMenu />
          </Suspense>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-line bg-canvas/95 px-4 backdrop-blur-sm sm:px-6">
          <div className="md:hidden">
            <Logo />
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-2">
            <Link href="/painel/leads/novo" className={buttonClass("primary", "md")}>
              <Plus aria-hidden className="size-4" />
              Novo lead
            </Link>
            <form action={signOut} className="md:hidden">
              <button type="submit" className={buttonClass("ghost", "md", "px-3")} aria-label="Sair">
                <LogOut aria-hidden className="size-4" />
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 px-4 pt-6 pb-24 sm:px-6 md:pb-10">{children}</main>
      </div>

      <BottomNav />
    </div>
  );
}

async function UserMenu() {
  const member = await getMember();
  if (!member) return null;
  return (
    <div className="flex flex-col gap-2 border-t border-line pt-4">
      <p className="truncate text-sm text-muted" title={member.email}>
        {member.email}
      </p>
      <form action={signOut}>
        <button type="submit" className={buttonClass("ghost", "sm", "-ml-3")}>
          <LogOut aria-hidden className="size-4" />
          Sair
        </button>
      </form>
    </div>
  );
}
