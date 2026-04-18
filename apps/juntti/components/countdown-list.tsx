import type { CountdownLite } from "@/lib/queries";

function daysLabel(n: number) {
  if (n === 0) return "Tänään";
  if (n === 1) return "Huomenna";
  return `${n} pv`;
}

export function CountdownList({ items }: { items: CountdownLite[] }) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
        Tulossa
      </h2>
      <ul className="divide-y divide-ink/5 rounded-2xl border border-ink/5 bg-white">
        {items.map((c) => (
          <li key={c.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-ink-muted">
                {c.day}.{c.month}.
              </div>
            </div>
            <div className="text-sm font-semibold text-brand">
              {daysLabel(c.days_until)}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
