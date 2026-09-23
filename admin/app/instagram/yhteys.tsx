"use client";

// Instagram-yhteys ja automaattinen julkaisu: tilin yhdistäminen, julkaisuajat ja
// automaattisen julkaisun kytkin. Token ei tule selaimeen — vain tilin nimi ja
// vanhenemispäivä.

import { useState, useTransition } from "react";
import { CheckCircle2, Link2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { katkaiseYhteys, tallennaAsetukset } from "./actions";
import { Kytkin } from "./omat";

export type YhteysTiedot = {
  kayttajanimi: string | null;
  vanhenee: string;
} | null;

const pvm = (iso: string) => new Intl.DateTimeFormat("fi-FI", { timeZone: "Europe/Helsinki", day: "numeric", month: "numeric", year: "numeric" }).format(new Date(iso));

export function YhteysPaneeli(p: {
  yhteys: YhteysTiedot;
  salaisuusOk: boolean;
  automaattinen: boolean;
  ajat: { visa_klo: string; synttarit_klo: string; omat_klo: string };
  ilmoitus: { ok: boolean; teksti: string } | null;
}) {
  const [ajat, setAjat] = useState({
    visa_klo: p.ajat.visa_klo.slice(0, 5),
    synttarit_klo: p.ajat.synttarit_klo.slice(0, 5),
    omat_klo: p.ajat.omat_klo.slice(0, 5),
  });
  const [viesti, setViesti] = useState(p.ilmoitus);
  const [pending, start] = useTransition();
  const muuttui =
    ajat.visa_klo !== p.ajat.visa_klo.slice(0, 5) ||
    ajat.synttarit_klo !== p.ajat.synttarit_klo.slice(0, 5) ||
    ajat.omat_klo !== p.ajat.omat_klo.slice(0, 5);

  return (
    <section className="space-y-3 rounded-md border p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-sm font-semibold">Instagram-yhteys</h2>
        {p.yhteys ? (
          <span className="inline-flex items-center gap-1 text-sm text-green-800">
            <CheckCircle2 className="h-4 w-4" /> Yhdistetty{p.yhteys.kayttajanimi ? `: @${p.yhteys.kayttajanimi}` : ""}
            <span className="text-xs text-muted-foreground">· yhteys voimassa {pvm(p.yhteys.vanhenee)} asti, uusiutuu automaattisesti</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <XCircle className="h-4 w-4" /> Ei yhdistetty
          </span>
        )}
      </div>

      {!p.salaisuusOk && (
        <p className="text-xs text-red-700">
          IG_APP_SECRET ei ole perillä. Tarkista Vercelistä (juntti-admin → Settings → Environment Variables), että muuttuja
          on Production-ympäristössä. Jos se on siellä Secret-tyyppisenä, tallenna se uudelleen Config-tyyppisenä ja julkaise uudelleen.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button asChild size="sm" variant={p.yhteys ? "outline" : "default"} disabled={!p.salaisuusOk}>
          <a href="/api/ig/yhdista">
            <Link2 className="h-3.5 w-3.5" /> {p.yhteys ? "Yhdistä uudelleen" : "Yhdistä Instagram"}
          </a>
        </Button>
        {p.yhteys && (
          <Button
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => {
              if (confirm("Katkaistaanko Instagram-yhteys? Automaattinen julkaisu pysähtyy.")) start(async () => { await katkaiseYhteys(); });
            }}
          >
            Katkaise yhteys
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-3 text-sm">
        <label className="flex items-center gap-2">
          <Kytkin
            nimi="Automaattinen julkaisu"
            paalla={p.automaattinen}
            disabled={pending || !p.yhteys}
            onChange={(v) =>
              start(async () => {
                const t = await tallennaAsetukset({ automaattinen: v });
                setViesti(t.ok ? { ok: true, teksti: v ? "Automaattinen julkaisu päällä." : "Automaattinen julkaisu pois." } : { ok: false, teksti: t.virhe });
              })
            }
          />
          Automaattinen julkaisu
        </label>
        {(
          [
            ["visa_klo", "Päivän visa"],
            ["synttarit_klo", "Synttärit"],
            ["omat_klo", "Omat"],
          ] as const
        ).map(([k, nimi]) => (
          <label key={k} className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">{nimi} klo</span>
            <input
              type="time"
              value={ajat[k]}
              onChange={(e) => setAjat((a) => ({ ...a, [k]: e.target.value }))}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            />
          </label>
        ))}
        {muuttui && (
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const t = await tallennaAsetukset(ajat);
                setViesti(t.ok ? { ok: true, teksti: "Julkaisuajat tallennettu." } : { ok: false, teksti: t.virhe });
              })
            }
          >
            Tallenna ajat
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Vain hyväksytyt julkaisut julkaistaan, oman päivänsä kellonaikana (tarkistus kymmenen minuutin välein). Hyväksymättä
        jäänyt julkaisu jää julkaisematta. Kortin Julkaise nyt -painike julkaisee heti.
      </p>
      {viesti && <div className={`text-xs ${viesti.ok ? "text-green-700" : "text-red-700"}`}>{viesti.teksti}</div>}
    </section>
  );
}
