"use client";

import { MessageCircle } from "lucide-react";
import { givanceWaLink } from "@/lib/whatsapp";
import { track } from "@/features/tracking/events";

export function WhatsAppFloat() {
  return (
    <a
      href={givanceWaLink()}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track({ name: "whatsapp_click", placement: "flutuante" })}
      className="fixed right-4 bottom-4 z-40 inline-flex h-14 items-center gap-2 rounded-full bg-whatsapp px-5 font-semibold text-white shadow-[var(--shadow-soft)] hover:bg-whatsapp-strong sm:right-6 sm:bottom-6"
      aria-label="Falar com a Givance Tech no WhatsApp"
    >
      <MessageCircle aria-hidden className="size-6" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}

export function WhatsAppLink({
  placement,
  className,
  children,
}: {
  placement: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={givanceWaLink()}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track({ name: "whatsapp_click", placement })}
      className={className}
    >
      {children}
    </a>
  );
}
