"use client";

// Visan oma kuva (hero_image) — pelisivun hero ja etusivun Päivän visa lukevat
// kuvan vain tästä kentästä (19.9.2026). Kuvaton visa: vanha aloitusnäkymä
// eikä automaattitäyttö valitse sitä Päivän visaksi.

import { useState, useTransition } from "react";
import { ImageIcon, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateQuizHero } from "./actions";

export function HeroEditor({
  id,
  initial,
  tietoniekkaUrl,
}: {
  id: string;
  initial: { hero_image: string | null; hero_alt: string | null; hero_focal_x: number | null; hero_focal_y: number | null };
  tietoniekkaUrl: string;
}) {
  const [kuva, setKuva] = useState(initial.hero_image ?? "");
  const [alt, setAlt] = useState(initial.hero_alt ?? "");
  const [fx, setFx] = useState(initial.hero_focal_x != null ? String(initial.hero_focal_x) : "");
  const [fy, setFy] = useState(initial.hero_focal_y != null ? String(initial.hero_focal_y) : "");
  const [viesti, setViesti] = useState<{ ok: boolean; t: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const src = kuva.trim() ? (kuva.startsWith("/") ? `${tietoniekkaUrl}${kuva.trim()}` : kuva.trim()) : null;
  const pos = `${Math.round((Number(fx.replace(",", ".")) || 0.5) * 100)}% ${Math.round((Number(fy.replace(",", ".")) || 0.4) * 100)}%`;

  function tallenna() {
    setViesti(null);
    startTransition(async () => {
      const res = await updateQuizHero(id, { hero_image: kuva, hero_alt: alt, hero_focal_x: fx, hero_focal_y: fy });
      setViesti(res.ok ? { ok: true, t: "Tallennettu." } : { ok: false, t: res.error });
    });
  }

  return (
    <section className="space-y-3 rounded-md border p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold"><ImageIcon className="h-4 w-4" /> Visan kuva (hero ja Päivän visa)</h2>
      <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="hero-kuva">Kuvan polku</Label>
            <Input id="hero-kuva" value={kuva} placeholder="/20/tv/visan-slug.webp" onChange={(e) => setKuva(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="hero-alt">Vaihtoehtoinen teksti <span className="font-normal text-muted-foreground">(saavutettavuus)</span></Label>
            <Input id="hero-alt" value={alt} placeholder="Mitä kuvassa on" onChange={(e) => setAlt(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="hero-fx">Rajaus vaaka (0–1)</Label>
              <Input id="hero-fx" value={fx} placeholder="0.5" onChange={(e) => setFx(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="hero-fy">Rajaus pysty (0–1)</Label>
              <Input id="hero-fy" value={fy} placeholder="0.4" onChange={(e) => setFy(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-md border bg-muted" style={{ aspectRatio: "330 / 296" }}>
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className="h-full w-full object-cover" style={{ objectPosition: pos }} />
          ) : (
            <div className="flex h-full items-center justify-center p-3 text-center text-xs text-muted-foreground">Ei kuvaa</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={tallenna} disabled={pending}><Save className="h-3.5 w-3.5" /> {pending ? "Tallennetaan…" : "Tallenna kuva"}</Button>
        {viesti && <span className={`text-sm ${viesti.ok ? "text-green-700" : "text-destructive"}`}>{viesti.t}</span>}
      </div>
    </section>
  );
}
