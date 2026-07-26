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
  lat: number | string | null;
  lon: number | string | null;
  name_partitive: string | null;
  fact_attributes?: Attr[];
};

/** Sama etäisyyslaskenta kuin pelissä (lib/duel.ts, haversineKm). */
function haversineKm(a: Row, b: Row) {
  const rad = (x: number) => (x * Math.PI) / 180;
  const la1 = rad(Number(a.lat));
  const la2 = rad(Number(b.lat));
  const h =
    Math.sin((la2 - la1) / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(rad(Number(b.lon) - Number(a.lon)) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

const hasCoords = (e: Row) => e.lat !== null && e.lon !== null;

/** Sama vaikeustasologiikka kuin pelissä. */
function difficulty(def: Def, a: number, b: number) {
  const gap = gapOf(def, a, b);
  if (def.easy_gap !== null && gap >= def.easy_gap) return { t: "Helppo", c: "text-emerald-600" };
  if (def.mid_gap !== null && gap >= def.mid_gap) return { t: "Keski", c: "text-amber-600" };
  return { t: "Vaikea", c: "text-red-600" };
}

function gapOf(def: Def, a: number, b: number) {
  if (def.compare_mode === "distance") return Math.abs(a - b) / Math.max(a, b, 1);
  return def.attr_key === "birth"
    ? Math.abs(a - b) / (365.25 * 86400)
    : def.attr_key === "year"
      ? Math.abs(a - b)
      : Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b), 1);
}

export function Preview({ defs, entities }: { defs: Def[]; entities: Row[] }) {
  const [seed, setSeed] = useState(0);

  const duel = useMemo(() => {
    const usable = defs.filter((d) => d.enabled);
    for (let i = 0; i < 200; i++) {
      const def = usable[Math.floor(Math.random() * usable.length)];
      if (!def) return null;
      const isDist = def.compare_mode === "distance";
      const pool = entities.filter(
        (e) =>
          e.status === "published" &&
          e.kind === def.kind &&
          (isDist
            ? hasCoords(e)
            : (e.fact_attributes ?? []).some((x) => x.attr_key === def.attr_key)),
      );
      if (pool.length < (isDist ? 3 : 2)) continue;

      // Etäisyyskysymyksessä vertailupiste arvotaan samasta joukosta.
      const ref = isDist ? pool[Math.floor(Math.random() * pool.length)] : null;
      const cands = ref ? pool.filter((e) => e.id !== ref.id) : pool;
      const a = cands[Math.floor(Math.random() * cands.length)];
      const b = cands[Math.floor(Math.random() * cands.length)];
      if (!a || !b || a.id === b.id) continue;

      const na = ref ? haversineKm(ref, a) : (a.fact_attributes ?? []).find((x) => x.attr_key === def.attr_key)!.num_value;
      const nb = ref ? haversineKm(ref, b) : (b.fact_attributes ?? []).find((x) => x.attr_key === def.attr_key)!.num_value;
      if (na === nb) continue;
      const va: Attr = ref
        ? { attr_key: def.attr_key, num_value: na, display_value: `${Math.round(na)} km` }
        : (a.fact_attributes ?? []).find((x) => x.attr_key === def.attr_key)!;
      const vb: Attr = ref
        ? { attr_key: def.attr_key, num_value: nb, display_value: `${Math.round(nb)} km` }
        : (b.fact_attributes ?? []).find((x) => x.attr_key === def.attr_key)!;

      // Samat rajat kuin pelissä: liian suurta eikä liian pientä eroa ei näytetä
      if (def.compare_mode !== "flag") {
        const g = gapOf(def, na, nb);
        if (def.max_gap !== null && g > def.max_gap) continue;
        if (def.min_gap !== null && g < def.min_gap) continue;
      }
      const aWins = def.winner === "low" ? na < nb : na > nb;
      const question = def.question_text.replaceAll(
        "{ref}",
        ref ? (ref.name_partitive ?? ref.name) : "",
      );
      return { def, a, b, va, vb, aWins, question, diff: difficulty(def, na, nb) };
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
          <div className="text-2xl font-semibold uppercase">{duel.question}</div>
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
