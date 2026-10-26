import Link from "next/link";

export function Logo() {
  return (
    <Link href="/painel" className="flex items-center gap-2 font-semibold tracking-tight text-ink">
      <span aria-hidden className="flex size-8 items-center justify-center rounded-md bg-ink text-sm text-canvas">
        G
      </span>
      Givance Leads
    </Link>
  );
}
