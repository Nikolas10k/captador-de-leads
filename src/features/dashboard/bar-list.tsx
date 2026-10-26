/**
 * Barras horizontais de série única: rótulo + valor em texto (a "tabela" já está
 * visível), barra fina como reforço visual. Sem legenda: o título nomeia a série.
 */
export function BarList({
  items,
  format = (n) => String(n),
  detail,
}: {
  items: { key: string; label: string; value: number }[];
  format?: (n: number) => string;
  detail?: (item: { key: string; value: number }) => string | undefined;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => {
        const extra = detail?.(item);
        return (
          <li key={item.key} className="group flex flex-col gap-1" title={`${item.label}: ${format(item.value)}${extra ? ` (${extra})` : ""}`}>
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="truncate">{item.label}</span>
              <span className="shrink-0 tabular-nums">
                <span className="font-semibold">{format(item.value)}</span>
                {extra && <span className="text-muted"> · {extra}</span>}
              </span>
            </div>
            <div className="h-2 rounded-full bg-subtle" aria-hidden>
              <div
                className="h-full rounded-full bg-cold transition-colors group-hover:bg-ink"
                style={{ width: `${Math.max(item.value > 0 ? 2 : 0, (item.value / max) * 100)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
