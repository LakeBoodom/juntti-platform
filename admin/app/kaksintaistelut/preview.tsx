"use client";

import { useMemo, useState } from "react";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Def } from "./entity-form";

type Attr = { attr_key: string; num_value: number; display_value: string | null };
type Row = {
  id: string;
  name: string;
  kind: string;
  status: string;
  image_url: string | null;
  duel_attributes?: Attr[];
};

/** Sama vaikeustasologiikka kuin pelissä. */
function difficulty(def: Def, a: number, b: number) {
  const gap =
    def.attr_key === "birth"
      ? Math.abs(a - b) / (365.25 * 86400)
      : def.attr_key === "year"
        ? Math.abs(a - b)
        : Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b), 1);
  if (def.easy_gap !== null && gap >= def.easy_gap) return { t: "Helppo", c: "text-emerald-600" };
  if (def.mid_gap !== null && gap >= def.mid_gap) return { t: "Keski", c: "text-amber-600" };
  return { t: "Vaikea", c: "text-red-600" };
}

export function Preview({ defs, entities }: { defs: Def[]; entities: Row[] }) {
  const [seed, setSeed] = useState(0);

  const duel = useMemo(() => {
    const usable = defs.filter((d) => d.enabled);
    for (let i = 0; i < 200; i++) {
      const def = usable[Math.floor(Math.random() * usable.length)];
      if (!def) return null;
      const pool = entities.filter(
        (e) =>
          e.status === "published" &&
          e.kind === def.kind &&
          (e.duel_attributes ?? []).some((a) => a.attr_key === def.attr_key),
      );
      if (pool.length < 2) continue;
      const a = pool[Math.floor(Math.random() * pool.length)];
      const b = pool[Math.floor(Math.random() * pool.length)];
      if (a.id === b.id) continue;
      const va = (a.duel_attributes ?? []).find((x) => x.attr_key === def.attr_key)!;
      const vb = (b.duel_attributes ?? []).find((x) => x.attr_key === def.attr_key)!;
      if (va.num_value === vb.num_value) continue;
      // Sama yläraja kuin pelissä: liian suurta eroa ei näytetä
      if (def.compare_mode !== "flag" && def.max_gap !== null) {
        const g =
          def.attr_key === "birth"
            ? Math.abs(va.num_value - vb.num_value) / (365.25 * 86400)
            : def.attr_key === "year"
              ? Math.abs(va.num_value - vb.num_value)
              : Math.abs(va.num_value - vb.num_value) /
                Math.max(Math.abs(va.num_value), Math.abs(vb.num_value), 1);
        if (g > def.max_gap) continue;
      }
      const aWins = def.winner === "low" ? va.num_value < vb.num_value : va.num_value > vb.num_value;
      return { def, a, b, va, vb, aWins, diff: difficulty(def, va.num_value, vb.num_value) };
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, defs, entities]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Esikatselu</h2>
          <p className="text-sm text-muted-foreground">
            Arpoo kysymyksen samalla logiikalla kuin peli — näet heti miltä data näyttää
            pelaajalle.
          </p>
        </div>
        <Button variant="outline" onClick={() => setSeed((s) => s + 1)}>
          <Shuffle /> Arvo uusi
        </Button>
      </div>

      {!duel ? (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          Ei tarpeeksi julkaistua dataa yhdenkään attribuutin kohdalla.
        </div>
      ) : (
        <div className="rounded-md border p-5 text-center">
          <div className="text-xs tracking-[0.3em] text-muted-foreground">
            {duel.def.subject_label}
          </div>
          <div className="text-2xl font-semibold uppercase">{duel.def.question_text}</div>
          <div className="mt-1 text-xs">
            <span className={duel.diff.c}>{duel.diff.t}</span>
            <span className="text-muted-foreground"> · {duel.def.attr_key}</span>
          </div>
          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            {[
              { e: duel.a, v: duel.va, win: duel.aWins },
              { e: duel.b, v: duel.vb, win: !duel.aWins },
            ].map(({ e, v, win }, i) => (
              <div
                key={e.id}
                className={`rounded-md border p-3 ${win ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20" : ""} ${i === 1 ? "order-3" : ""}`}
              >
                <div className="font-medium">{e.name}</div>
                <div className="text-sm text-muted-foreground">
                  {v.display_value ?? v.num_value}
                </div>
                {win && <div className="mt-1 text-xs text-emerald-600">oikea vastaus</div>}
              </div>
            ))}
            <div className="order-2 text-xs tracking-widest text-muted-foreground">VS</div>
          </div>
        </div>
      )}
    </section>
  );
}
