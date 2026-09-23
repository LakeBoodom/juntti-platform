"use client";

// Juontajakuvat (Laura ja Mikko) Instagram-pohjiin 4n–4r: kirjasto asennoittain.
// Pohja käyttää aktiivista rajattua kuvaa asentonsa mukaan; useamman kuvan kesken
// valinta vaihtelee päivittäin. Uudet ympäristökuvat lisätään tästä.

import { useRef, useState, useTransition } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Juontajakuva } from "@/lib/ig/juontajat";
import { asetaJuontajakuvaAktiivinen, lataaJuontajakuva } from "./actions";
import { Kytkin } from "./omat";

const ASENNOT: Record<string, string> = {
  haastaa: "Haastaa / osoittaa (4n)",
  yllattyy: "Yllättyy (4p)",
  miettii: "Miettii (4q)",
  eri_mielta: "Eri mieltä, molemmat (4o)",
  onnittelee: "Onnittelee, molemmat (4r)",
  innostunut: "Innostunut",
  neutraali: "Neutraali",
};
const KUKA: Record<string, string> = { laura: "Laura", mikko: "Mikko", molemmat: "Molemmat" };
const kentta = "h-8 rounded-md border border-input bg-background px-2 text-sm";

export function Juontajakuvat({ kuvat }: { kuvat: Juontajakuva[] }) {
  const [kuka, setKuka] = useState("mikko");
  const [asento, setAsento] = useState("haastaa");
  const [tausta, setTausta] = useState("rajattu");
  const [kuvaus, setKuvaus] = useState("");
  const [viesti, setViesti] = useState<{ ok: boolean; teksti: string } | null>(null);
  const [pending, start] = useTransition();
  const tiedosto = useRef<HTMLInputElement>(null);

  return (
    <details className="rounded-md border p-4">
      <summary className="cursor-pointer text-sm font-semibold">Juontajakuvat ({kuvat.filter((k) => k.aktiivinen).length} aktiivista)</summary>
      <div className="mt-3 space-y-4">
        <div className="flex flex-wrap gap-3">
          {kuvat.map((k) => (
            <div key={k.id} className={`flex w-[132px] flex-col gap-1 rounded border p-2 text-xs ${k.aktiivinen ? "" : "opacity-50"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={k.url} alt={k.kuvaus ?? ""} loading="lazy" className="aspect-[4/5] w-full rounded bg-[repeating-conic-gradient(#ddd_0%_25%,#fff_0%_50%)] bg-[length:16px_16px] object-contain" />
              <div className="font-medium">{KUKA[k.kuka]} · {ASENNOT[k.asento]?.replace(/ \(.*\)/, "") ?? k.asento}</div>
              <div className="text-muted-foreground">{k.tausta === "ymparisto" ? "Ympäristö" : "Rajattu"}{k.korkeus ? ` · ${k.leveys}×${k.korkeus}` : ""}</div>
              <label className="flex items-center gap-1.5 text-muted-foreground">
                <Kytkin nimi="Käytössä" paalla={k.aktiivinen} disabled={pending} onChange={(v) => start(async () => { await asetaJuontajakuvaAktiivinen(k.id, v); })} />
                käytössä
              </label>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <select value={kuka} onChange={(e) => setKuka(e.target.value)} className={kentta}>
            {Object.entries(KUKA).map(([v, n]) => <option key={v} value={v}>{n}</option>)}
          </select>
          <select value={asento} onChange={(e) => setAsento(e.target.value)} className={kentta}>
            {Object.entries(ASENNOT).map(([v, n]) => <option key={v} value={v}>{n}</option>)}
          </select>
          <select value={tausta} onChange={(e) => setTausta(e.target.value)} className={kentta}>
            <option value="rajattu">Rajattu (läpinäkyvä tausta)</option>
            <option value="ymparisto">Ympäristö (tausta mukana)</option>
          </select>
          <input value={kuvaus} onChange={(e) => setKuvaus(e.target.value)} placeholder="Kuvaus, esim. jääkiekkokatsomossa" className={`${kentta} min-w-[200px] flex-1`} />
          <Button size="sm" disabled={pending} onClick={() => tiedosto.current?.click()}>
            <Upload className="h-3.5 w-3.5" /> Lisää kuva
          </Button>
          <input
            ref={tiedosto}
            type="file"
            accept="image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              if (f.size > 4.4 * 1024 * 1024) { setViesti({ ok: false, teksti: "Tiedosto on yli 4,4 Mt — pienennä se ensin (esim. WebP-muotoon)." }); return; }
              setViesti({ ok: true, teksti: "Ladataan…" });
              start(async () => {
                const fd = new FormData();
                fd.append("file", f);
                fd.append("kuka", kuka);
                fd.append("asento", asento);
                fd.append("tausta", tausta);
                fd.append("kuvaus", kuvaus);
                const t = await lataaJuontajakuva(fd);
                setViesti(t.ok ? { ok: true, teksti: "Kuva lisätty." } : { ok: false, teksti: t.virhe });
                if (t.ok) setKuvaus("");
              });
            }}
          />
          {viesti && <span className={`text-xs ${viesti.ok ? "text-green-700" : "text-red-700"}`}>{viesti.teksti}</span>}
        </div>
        <p className="text-xs text-muted-foreground">
          Rajattu kuva: läpinäkyvä PNG tai WebP, vähintään 1 400 px korkea (mieluiten noin 1 800), hahmo kokonaan tai
          lantiosta ylöspäin. Pohjat 4n, 4o, 4p, 4q ja 4r käyttävät rajattuja kuvia asennon mukaan. Ympäristökuvat
          (taustoineen, 4:5, vähintään 2160 × 2700) tallentuvat kirjastoon tulevia pohjia varten.
        </p>
      </div>
    </details>
  );
}
