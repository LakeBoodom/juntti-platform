"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Bot, ExternalLink, Monitor, Save, Smartphone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  INTRO_OTSIKKO_MAX, INTRO_OTSIKKO_PEHMEA, INTRO_TEKSTI_MAX, INTRO_TEKSTI_PEHMEA, TOISTORAJA_PV,
  paivaEro, varoituksetValinnalle, type SaantoRivi, type VisaValinta,
} from "@/lib/paivan-visa-yhteiset";
import { poistaPaiva, tallennaPaiva } from "../actions";

type Tila = "nyt" | "A" | "B" | "C";

function Laskuri({ n, pehmea, max }: { n: number; pehmea: number; max: number }) {
  const vari = n > max ? "text-destructive" : n > pehmea ? "text-amber-600 font-medium" : "text-muted-foreground";
  return <span className={`text-xs tabular-nums ${vari}`}>{n}/{max}</span>;
}

export function PaivaEditori(props: {
  siteId: string;
  paiva: string;
  saanto: SaantoRivi | null;
  visat: VisaValinta[];
  paivatByVisa: Record<string, string[]>;
  edelliset: Array<{ iso: string; kokoelma: string | null }>;
  sankari: { name: string; quiz_id: string; death_date: string | null; ika: number } | null;
  tietoniekkaUrl: string;
}) {
  const router = useRouter();
  const s = props.saanto;
  const [quizId, setQuizId] = useState(s?.content_id ?? "");
  const [haku, setHaku] = useState("");
  const [otsikko, setOtsikko] = useState(s?.intro_headline ?? "");
  const [teksti, setTeksti] = useState(s?.intro_text ?? "");
  const [lahde, setLahde] = useState(s?.intro_source_url ?? "");
  const [muistiinpano, setMuistiinpano] = useState(s?.editorial_note ?? "");
  const [ruleId, setRuleId] = useState<string | null>(s?.id ?? null);
  const [autoFilled, setAutoFilled] = useState(Boolean(s?.auto_filled));
  const [virhe, setVirhe] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [tila, setTila] = useState<Tila>("nyt");
  const [versio, setVersio] = useState(0);
  const [pending, startTransition] = useTransition();

  const tallennettu = {
    quizId: s?.content_id ?? "", otsikko: s?.intro_headline ?? "", teksti: s?.intro_text ?? "",
    lahde: s?.intro_source_url ?? "", muistiinpano: s?.editorial_note ?? "",
  };
  const [pohja, setPohja] = useState(tallennettu);
  const muutettu =
    quizId !== pohja.quizId || otsikko !== pohja.otsikko || teksti !== pohja.teksti ||
    lahde !== pohja.lahde || muistiinpano !== pohja.muistiinpano;

  const visa = props.visat.find((v) => v.id === quizId) ?? null;
  const varoitukset = useMemo(() => {
    const toistot = visa
      ? (props.paivatByVisa[visa.id] ?? []).filter((d) => d !== props.paiva && Math.abs(paivaEro(props.paiva, d)) <= TOISTORAJA_PV)
      : [];
    return varoituksetValinnalle({
      iso: props.paiva, visa, sankariQuizId: props.sankari?.quiz_id ?? null, sankariNimi: props.sankari?.name ?? null,
      toistot, edelliset: props.edelliset,
    });
  }, [visa, props.paiva, props.paivatByVisa, props.sankari, props.edelliset]);

  const suodatetut = useMemo(() => {
    const h = haku.trim().toLowerCase();
    const l = props.visat.filter((v) => !h || v.title.toLowerCase().includes(h) || (v.kokoelma ?? "").includes(h));
    // Valittu visa pysyy listassa, vaikka haku ei osuisi siihen.
    if (visa && !l.includes(visa)) l.unshift(visa);
    return l.slice(0, 400);
  }, [haku, props.visat, visa]);

  const nykyinenTila: "A" | "B" | "C" = pohja.teksti ? (pohja.otsikko ? "A" : "C") : "B";

  function tallenna() {
    setVirhe(null); setOk(null);
    if (!quizId) { setVirhe("Valitse visa."); return; }
    startTransition(async () => {
      const res = await tallennaPaiva({
        siteId: props.siteId, paiva: props.paiva, quizId,
        introOtsikko: otsikko, introTeksti: teksti, lahdeUrl: lahde, muistiinpano,
      });
      if (!res.ok) { setVirhe(res.error); return; }
      setRuleId(res.ruleId);
      setAutoFilled(false);
      setPohja({ quizId, otsikko: otsikko.replace(/\s+/g, " ").trim(), teksti: teksti.replace(/\s+/g, " ").trim(), lahde: lahde.trim(), muistiinpano: muistiinpano.trim() });
      setOtsikko((o) => o.replace(/\s+/g, " ").trim());
      setTeksti((t) => t.replace(/\s+/g, " ").trim());
      setVersio((v) => v + 1);
      setOk("Tallennettu. Esikatselu päivitetty.");
      router.refresh();
    });
  }

  function poista() {
    if (!confirm("Poistetaanko päivän valinta? Automaatti valitsee päivälle uuden visan.")) return;
    startTransition(async () => {
      const res = await poistaPaiva(props.siteId, props.paiva);
      if (!res.ok) { setVirhe(res.error ?? "Poisto epäonnistui."); return; }
      router.push("/paivan-visa");
      router.refresh();
    });
  }

  /* Esikatselu: tallennettu rivi (intro mukana) tai tallentamaton visavalinta. */
  const esikatseluUrl = (() => {
    const q = new URLSearchParams();
    if (ruleId && !(quizId && quizId !== pohja.quizId)) q.set("rule", ruleId);
    else if (quizId) { q.set("quiz", quizId); q.set("paiva", props.paiva); }
    else return null;
    if (tila !== "nyt") q.set("tila", tila);
    q.set("v", String(versio));
    return `${props.tietoniekkaUrl}/esikatselu/paivan-visa?${q}`;
  })();

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      {/* ── Lomake ── */}
      <div className="space-y-5">
        {autoFilled && (
          <div className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <Bot className="mt-0.5 h-4 w-4 shrink-0" />
            <span><strong>Automaattivalinta — ei toimitettu.</strong> Tallennus merkitsee päivän toimitetuksi.</span>
          </div>
        )}
        {props.sankari && (
          <p className="text-sm text-muted-foreground">
            Päivän sankari: <strong>{props.sankari.name}</strong>{" "}
            ({props.sankari.death_date ? `muistopäivä, ${props.sankari.ika} v syntymästä` : `täyttää ${props.sankari.ika}`})
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="pv-haku">Visa</Label>
          <Input id="pv-haku" placeholder="Hae nimellä tai kokoelmalla…" value={haku} onChange={(e) => setHaku(e.target.value)} />
          <select
            className="h-48 w-full rounded-md border bg-transparent p-1 text-sm"
            size={8}
            value={quizId}
            onChange={(e) => setQuizId(e.target.value)}
            aria-label="Valitse visa"
          >
            {suodatetut.map((v) => (
              <option key={v.id} value={v.id}>
                {v.status === "published" ? "" : "[luonnos] "}{v.title}{v.kokoelma ? ` — ${v.kokoelma}` : ""}{v.kuva ? "" : " (ei kuvaa)"}
              </option>
            ))}
          </select>
          {visa && <p className="text-xs text-muted-foreground">Valittu: <strong>{visa.title}</strong> · {visa.kokoelma ?? "—"}</p>}
        </div>

        {varoitukset.length > 0 && (
          <ul className="space-y-1 rounded-md border border-amber-200 bg-amber-50 p-3">
            {varoitukset.map((v, i) => (
              <li key={i} className="flex gap-2 text-sm text-amber-900">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {v.teksti}
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="pv-otsikko">Intron otsikko</Label>
            <Laskuri n={otsikko.length} pehmea={INTRO_OTSIKKO_PEHMEA} max={INTRO_OTSIKKO_MAX} />
          </div>
          <Input
            id="pv-otsikko"
            value={otsikko}
            maxLength={INTRO_OTSIKKO_MAX}
            placeholder="Esim. Stadin derby palaa 12 vuoden tauon jälkeen"
            onChange={(e) => setOtsikko(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Uutiskoukku. Mahtuu yhdelle riville työpöydällä noin {INTRO_OTSIKKO_PEHMEA} merkkiin asti.</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="pv-teksti">Intron teksti</Label>
            <Laskuri n={teksti.length} pehmea={INTRO_TEKSTI_PEHMEA} max={INTRO_TEKSTI_MAX} />
          </div>
          <Textarea
            id="pv-teksti"
            rows={4}
            value={teksti}
            maxLength={INTRO_TEKSTI_MAX}
            placeholder="1–2 virkettä: miksi juuri tänään."
            onChange={(e) => setTeksti(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Otsikko + teksti = tila A · pelkkä teksti = tila C · tyhjä = visan oma kuvaus (tila B). Pelkkää tekstiä, ei muotoiluja.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pv-lahde">Lähde-URL <span className="font-normal text-muted-foreground">(ei näy käyttäjälle)</span></Label>
          <Input id="pv-lahde" type="url" value={lahde} placeholder="https://…" onChange={(e) => setLahde(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pv-muistiinpano">Toimituksen muistiinpano <span className="font-normal text-muted-foreground">(ei näy käyttäjälle)</span></Label>
          <Textarea id="pv-muistiinpano" rows={2} value={muistiinpano} onChange={(e) => setMuistiinpano(e.target.value)} />
        </div>

        {virhe && <p className="text-sm text-destructive">{virhe}</p>}
        {ok && !muutettu && <p className="text-sm text-green-700">{ok}</p>}

        <div className="flex flex-wrap gap-2">
          <Button onClick={tallenna} disabled={pending || !quizId || (!muutettu && !autoFilled)}>
            <Save className="h-4 w-4" />
            {pending ? "Tallennetaan…" : autoFilled && !muutettu ? "Hyväksy ja merkitse toimitetuksi" : "Tallenna"}
          </Button>
          {ruleId && (
            <Button variant="outline" onClick={poista} disabled={pending}>
              <Trash2 className="h-4 w-4" /> Poista valinta
            </Button>
          )}
        </div>
      </div>

      {/* ── Esikatselu ── */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Esikatselu</span>
          {(["nyt", "A", "B", "C"] as Tila[]).map((t) => (
            <button
              key={t}
              onClick={() => setTila(t)}
              className={
                tila === t
                  ? "rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-background"
                  : "rounded-md border px-2.5 py-1 text-xs hover:bg-muted"
              }
            >
              {t === "nyt" ? `Tallennettu (tila ${nykyinenTila})` : `Tila ${t}`}
            </button>
          ))}
          {esikatseluUrl && (
            <a href={esikatseluUrl} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline">
              Avaa <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        {muutettu && (
          <p className="text-xs text-amber-700">Tallentamattomia muutoksia — esikatselu näyttää tallennetun version{quizId !== pohja.quizId ? " (valittu visa ilman introa)" : ""}.</p>
        )}
        {tila === "A" && !(pohja.otsikko && pohja.teksti) && (
          <p className="text-xs text-muted-foreground">Tila A vaatii tallennetun otsikon ja tekstin — näytetään todellinen tila.</p>
        )}
        {tila === "C" && !pohja.teksti && (
          <p className="text-xs text-muted-foreground">Tila C vaatii tallennetun tekstin — näytetään todellinen tila.</p>
        )}

        {esikatseluUrl ? (
          <div className="flex flex-wrap items-start gap-4">
            <figure className="space-y-1">
              <figcaption className="flex items-center gap-1 text-xs text-muted-foreground"><Monitor className="h-3.5 w-3.5" /> Työpöytä (1280 px, 50 %)</figcaption>
              <div className="overflow-hidden rounded-md border" style={{ width: 640, height: 380 }}>
                <iframe
                  key={`d-${esikatseluUrl}`}
                  src={esikatseluUrl}
                  title="Esikatselu työpöytä"
                  style={{ width: 1280, height: 760, border: 0, transform: "scale(0.5)", transformOrigin: "0 0" }}
                />
              </div>
            </figure>
            <figure className="space-y-1">
              <figcaption className="flex items-center gap-1 text-xs text-muted-foreground"><Smartphone className="h-3.5 w-3.5" /> Mobiili (390 px, 75 %)</figcaption>
              <div className="overflow-hidden rounded-md border" style={{ width: 293, height: 690 }}>
                <iframe
                  key={`m-${esikatseluUrl}`}
                  src={esikatseluUrl}
                  title="Esikatselu mobiili"
                  style={{ width: 390, height: 920, border: 0, transform: "scale(0.75)", transformOrigin: "0 0" }}
                />
              </div>
            </figure>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Valitse visa nähdäksesi esikatselun.</p>
        )}
      </div>
    </div>
  );
}
