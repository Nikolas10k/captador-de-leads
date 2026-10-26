"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { CalendarCheck, Columns3, LayoutDashboard, MessageSquareText, Users } from "lucide-react";
import { cn } from "@/lib/format";

const items = [
  { href: "/painel", label: "Hoje", icon: CalendarCheck },
  { href: "/painel/pipeline", label: "Pipeline", icon: Columns3 },
  { href: "/painel/leads", label: "Leads", icon: Users },
  { href: "/painel/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/painel/modelos", label: "Modelos", icon: MessageSquareText },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/painel" ? pathname === "/painel" : pathname.startsWith(href);
}

export function SideNav() {
  return (
    <Suspense fallback={<SideNavList pathname="" />}>
      <SideNavWithPath />
    </Suspense>
  );
}

function SideNavWithPath() {
  return <SideNavList pathname={usePathname()} />;
}

function SideNavList({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Painel" className="flex flex-col gap-1">
      {items.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-10 items-center gap-3 rounded-lg px-3 text-sm",
              active ? "bg-subtle font-semibold text-ink" : "text-muted hover:bg-subtle hover:text-ink",
            )}
          >
            <Icon aria-hidden className={cn("size-4", active && "text-accent")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomNav() {
  return (
    <Suspense fallback={<BottomNavList pathname="" />}>
      <BottomNavWithPath />
    </Suspense>
  );
}

function BottomNavWithPath() {
  return <BottomNavList pathname={usePathname()} />;
}

function BottomNavList({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Painel"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn("flex h-16 flex-col items-center justify-center gap-1 text-xs", active ? "font-semibold text-ink" : "text-muted")}
          >
            <Icon aria-hidden className={cn("size-5", active && "text-accent")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
