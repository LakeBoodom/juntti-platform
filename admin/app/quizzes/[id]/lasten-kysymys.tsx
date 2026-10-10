"use client";

// LASTEN KYSYMYS -editori (vaihe 6, TOTEUTUSBRIEF_LASTEN_VISAT.md §8, 10.10.2026).
// Kysymystyyppi, vihjeet molemmilta juontajilta, kysymyskuva, vastausten kuvat ja eläinääni.
// Juontajaklipit (questions.audio) kuunnellaan play-napeista; niiden tiedostoja ei muokata täällä.
// Jos kysymyksen, vihjeen tai Tiesitkö-tekstin muuttaa, editori varoittaa: "Teksti ei enää vastaa
// äänitettyä klippiä." (vertailu audio.teksti_<klippi>-kenttään, johon tuonti tallensi äänitetyn tekstin).
// Vastauksia 3 (lasten visoissa), tallennus sallii 2–4.
import { useEffect, useRef, useState, useTransition } from "react";
import { AlertTriangle, Check, ChevronDown, ChevronUp, Pencil, Play, Square, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  KLIPIT, KYSYMYSTYYPIT, mediaUrl, onKysymysTyyppi, vaatiiElainaanen, vaatiiVastauskuvat, type KysymysTyyppi,
} from "@/lib/lapset";
import { reorderQuestion, updateLastenKysymys, type ElainaaniSyote, type LastenVastausSyote } from "./actions";

export type LastenKysymysData = {
  question_type: string;
  question_text: string;
  explanation: string | null;
  vihje_laura: string | null;
  vihje_mikko: string | null;
  answers: Array<{ text?: string; is_correct?: boolean; image_url?: string; image_credit?: string }>;
  image_url: string | null;
  image_credit: string | null;
  image_license_note: string | null;
  image_position: string | null;
  audio: Record<string, unknown> | null;
  animal_sound: Record<string, unknown> | null;
};

type Kentat = {
  question_text: string; explanation: string; vihje_laura: string; vihje_mikko: string;
};

const s = (v: unknown) => (typeof v === "string" ? v : "");
const norm = (t: string) => t.replace(/\s+/g, " ").trim();
const valinta =
  "h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function alkuVastaukset(a: LastenKysymysData["answers"]): LastenVastausSyote[] {
  return (a.length ? a : [{}, {}, {}]).map((x) => ({
    text: x.text ?? "", is_correct: x.is_correct === true, image_url: x.image_url ?? "", image_credit: x.image_credit ?? "",
  }));
}
function alkuAani(e: Record<string, unknown> | null): ElainaaniSyote {
  return {
    url: s(e?.url), laji: s(e?.laji), tieteellinen: s(e?.tieteellinen), tekija: s(e?.tekija),
    lisenssi: s(e?.lisenssi), lahde: s(e?.lahde), lahde_url: s(e?.lahde_url),
  };
}

/** Klipit, joiden äänitetty teksti poikkeaa nykyisestä tekstistä. */
function poikkeavat(audio: Record<string, unknown> | null, k: Kentat) {
  if (!audio) return [];
  return KLIPIT.filter((c) => {
    const url = s(audio[c.avain]);
    const aanitetty = s(audio[`teksti_${c.avain}`]);
    return url && aanitetty && norm(aanitetty) !== norm(k[c.kentta]);
  });
}

export function LastenKysymys({
  id, quizId, sortOrder, isFirst, isLast, mediaPohja, initial,
}: {
  id: string; quizId: string; sortOrder: number; isFirst: boolean; isLast: boolean; mediaPohja: string; initial: LastenKysymysData;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [tyyppi, setTyyppi] = useState<KysymysTyyppi>(onKysymysTyyppi(initial.question_type) ? initial.question_type : "teksti");
  const [k, setK] = useState<Kentat>({
    question_text: initial.question_text, explanation: initial.explanation ?? "",
    vihje_laura: initial.vihje_laura ?? "", vihje_mikko: initial.vihje_mikko ?? "",
  });
  const [vastaukset, setVastaukset] = useState<LastenVastausSyote[]>(() => alkuVastaukset(initial.answers));
  const [kuva, setKuva] = useState({
    image_url: initial.image_url ?? "", image_credit: initial.image_credit ?? "",
    image_license_note: initial.image_license_note ?? "", image_position: initial.image_position ?? "",
  });
  const [aani, setAani] = useState<ElainaaniSyote>(() => alkuAani(initial.animal_sound));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [moving, startMove] = useTransition();

  /* Yksi audio-elementti kortille: uusi klippi katkaisee edellisen, sama nappi pysäyttää. */
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [soi, setSoi] = useState<string | null>(null);
  useEffect(() => () => audioRef.current?.pause(), []);
  function soita(avain: string, polku: string | null | undefined) {
    const url = mediaUrl(mediaPohja, polku);
    if (!url) return;
    const a = audioRef.current ?? (audioRef.current = new Audio());
    if (soi === avain && !a.paused) { a.pause(); setSoi(null); return; }
    a.onended = () => setSoi(null);
    a.onerror = () => { setSoi(null); setError(`Äänitiedostoa ei löytynyt: ${url}`); };
    a.src = url;
    void a.play().then(() => setSoi(avain)).catch(() => setSoi(null));
  }

  const muuttuneet = poikkeavat(initial.audio, k);

  function asetaVastaus(i: number, patch: Partial<LastenVastausSyote>) {
    setVastaukset((prev) => prev.map((a, idx) => (idx === i ? { ...a, ...patch } : patch.is_correct ? { ...a, is_correct: false } : a)));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await updateLastenKysymys(id, { question_type: tyyppi, ...k, answers: vastaukset, ...kuva, animal_sound: aani });
      if (!res.ok) setError(res.error);
      else { setEditing(false); router.refresh(); }
    });
  }

  function cancel() {
    setEditing(false);
    setTyyppi(onKysymysTyyppi(initial.question_type) ? initial.question_type : "teksti");
    setK({ question_text: initial.question_text, explanation: initial.explanation ?? "", vihje_laura: initial.vihje_laura ?? "", vihje_mikko: initial.vihje_mikko ?? "" });
    setVastaukset(alkuVastaukset(initial.answers));
    setKuva({ image_url: initial.image_url ?? "", image_credit: initial.image_credit ?? "", image_license_note: initial.image_license_note ?? "", image_position: initial.image_position ?? "" });
    setAani(alkuAani(initial.animal_sound));
    setError(null);
  }

  function move(direction: "up" | "down") {
    setError(null);
    startMove(async () => {
      const res = await reorderQuestion(quizId, id, direction);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  const tyyppiNimi = KYSYMYSTYYPIT.find((t) => t.value === tyyppi)?.label ?? tyyppi;

  const varoitus = muuttuneet.length > 0 && (
    <div className="flex gap-2 rounded-md border border-amber-500/40 bg-amber-50/60 p-2 text-xs text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <div>
        <strong>Teksti ei enää vastaa äänitettyä klippiä.</strong> Muuttunut: {muuttuneet.map((m) => m.label).join(", ")}.
        Pelissä kupla näyttää uuden tekstin, mutta juontaja lukee vanhan. Äänitä klippi uudelleen tai palauta teksti.
        {muuttuneet.map((m) => (
          <div key={m.avain} className="mt-1 opacity-80">
            Äänitetty ({m.label}): “{s(initial.audio?.[`teksti_${m.avain}`])}”
          </div>
        ))}
      </div>
    </div>
  );

  const soittonappi = (avain: string, label: string, polku: string | null | undefined) =>
    polku ? (
      <button
        key={avain}
        type="button"
        onClick={() => soita(avain, polku)}
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs hover:bg-muted ${soi === avain ? "border-foreground bg-muted" : ""}`}
        title={mediaUrl(mediaPohja, polku) ?? undefined}
      >
        {soi === avain ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />} {label}
      </button>
    ) : null;

  const pikkukuva = (polku: string | null | undefined, alt: string) => {
    const url = mediaUrl(mediaPohja, polku);
    /* eslint-disable-next-line @next/next/no-img-element */
    return url ? <img src={url} alt={alt} className="h-12 w-12 shrink-0 rounded object-cover" loading="lazy" /> : null;
  };

  if (!editing) {
    return (
      <div className="space-y-3 rounded-md border p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <div className="flex flex-col">
              <Button variant="ghost" size="sm" className="h-6 px-1" onClick={() => move("up")} disabled={isFirst || moving} aria-label="Siirrä ylös" title="Siirrä ylös">
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 px-1" onClick={() => move("down")} disabled={isLast || moving} aria-label="Siirrä alas" title="Siirrä alas">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Kysymys {sortOrder + 1} · {tyyppiNimi}</div>
              <div className="font-medium">{k.question_text}</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)} aria-label="Muokkaa">
            <Pencil /> Muokkaa
          </Button>
        </div>

        {varoitus}

        <div className="flex flex-wrap gap-1.5">
          {KLIPIT.map((c) => soittonappi(c.avain, c.label, s(initial.audio?.[c.avain]) || null))}
          {soittonappi("elainaani", `Eläinääni${aani.laji ? `: ${aani.laji}` : ""}`, aani.url || null)}
        </div>

        {kuva.image_url && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {pikkukuva(kuva.image_url, "Kysymyskuva")}
            <span>{kuva.image_credit || "Oma kuvitus"}{kuva.image_position ? ` · rajaus ${kuva.image_position}` : ""}</span>
          </div>
        )}

        <ul className="space-y-1 text-sm">
          {vastaukset.map((a, i) => (
            <li
              key={i}
              className={`flex items-center gap-2 rounded-md px-2 py-1 ${a.is_correct ? "bg-green-50 text-green-900 dark:bg-green-950/30 dark:text-green-100" : ""}`}
            >
              {a.is_correct ? <Check className="h-3.5 w-3.5 shrink-0 text-green-700" /> : <span className="inline-block h-3.5 w-3.5 shrink-0" />}
              {pikkukuva(a.image_url, a.text)}
              <span>{a.text}</span>
              {a.image_credit && <span className="text-xs text-muted-foreground">· {a.image_credit}</span>}
            </li>
          ))}
        </ul>

        <div className="space-y-1 text-xs text-muted-foreground">
          {k.vihje_laura && <p><strong>Lauran vihje:</strong> {k.vihje_laura}</p>}
          {k.vihje_mikko && <p><strong>Mikon vihje:</strong> {k.vihje_mikko}</p>}
          {k.explanation && <p><strong>Tiesitkö:</strong> {k.explanation}</p>}
          {aani.url && <p><strong>Eläinääni:</strong> {aani.laji || "—"} · {aani.tekija} / {aani.lahde}, {aani.lisenssi}</p>}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  const naytaAani = vaatiiElainaanen(tyyppi) || !!aani.url;
  return (
    <div className="space-y-4 rounded-md border bg-muted/30 p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">Muokataan kysymystä {sortOrder + 1}</div>
        <div className="inline-flex gap-2">
          <Button variant="ghost" size="sm" onClick={cancel}>
            <X /> Peruuta
          </Button>
          <Button size="sm" onClick={save} disabled={pending}>
            {pending ? "Tallennetaan…" : "Tallenna"}
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`tyyppi-${id}`}>Kysymystyyppi</Label>
        <select id={`tyyppi-${id}`} value={tyyppi} onChange={(e) => setTyyppi(e.target.value as KysymysTyyppi)} className={valinta}>
          {KYSYMYSTYYPIT.map((t) => (
            <option key={t.value} value={t.value}>{t.label} – {t.kuvaus}</option>
          ))}
        </select>
      </div>

      {varoitus}

      <div className="space-y-1.5">
        <Label>Kysymys</Label>
        <Input value={k.question_text} onChange={(e) => setK({ ...k, question_text: e.target.value })} />
      </div>

      <div className="space-y-2">
        <Label>Vastaukset (valitse oikea){vaatiiVastauskuvat(tyyppi) ? " – jokaiselle kuva" : ""}</Label>
        {vastaukset.map((a, i) => (
          <div key={i} className="space-y-1.5 rounded-md border bg-background p-2">
            <div className="flex items-center gap-2">
              <input type="radio" name={`oikea-${id}`} checked={a.is_correct} onChange={() => asetaVastaus(i, { is_correct: true })} className="h-4 w-4" aria-label={`Vastaus ${i + 1} on oikea`} />
              <Input value={a.text} onChange={(e) => asetaVastaus(i, { text: e.target.value })} placeholder={`Vastaus ${i + 1}`} />
              {pikkukuva(a.image_url, a.text)}
            </div>
            {(vaatiiVastauskuvat(tyyppi) || a.image_url) && (
              <div className="grid grid-cols-2 gap-2 pl-6">
                <Input value={a.image_url} onChange={(e) => asetaVastaus(i, { image_url: e.target.value })} placeholder="Kuva: /20/lapset/kuva.webp" className="text-xs" />
                <Input value={a.image_credit} onChange={(e) => asetaVastaus(i, { image_credit: e.target.value })} placeholder="Tekijä / lähde, lisenssi (tyhjä = oma kuvitus)" className="text-xs" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Lauran vihje</Label>
          <Textarea rows={2} value={k.vihje_laura} onChange={(e) => setK({ ...k, vihje_laura: e.target.value })} className="min-h-[60px]" />
        </div>
        <div className="space-y-1.5">
          <Label>Mikon vihje</Label>
          <Textarea rows={2} value={k.vihje_mikko} onChange={(e) => setK({ ...k, vihje_mikko: e.target.value })} className="min-h-[60px]" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Tiesitkö</Label>
        <Textarea rows={2} value={k.explanation} onChange={(e) => setK({ ...k, explanation: e.target.value })} className="min-h-[60px]" />
      </div>

      <fieldset className="space-y-2 rounded-md border bg-background p-3">
        <legend className="px-1 text-xs font-medium text-muted-foreground">Kysymyskuva{tyyppi === "kuva" ? " (pakollinen)" : " (valinnainen)"}</legend>
        <div className="flex items-center gap-2">
          <Input value={kuva.image_url} onChange={(e) => setKuva({ ...kuva, image_url: e.target.value })} placeholder="/20/lapset/kuva.webp" />
          {pikkukuva(kuva.image_url, "Kysymyskuva")}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input value={kuva.image_credit} onChange={(e) => setKuva({ ...kuva, image_credit: e.target.value })} placeholder="Tekijä / Wikimedia Commons, CC BY 4.0" className="text-xs" />
          <Input value={kuva.image_position} onChange={(e) => setKuva({ ...kuva, image_position: e.target.value })} placeholder="Rajaus, esim. center 20%" className="text-xs" />
        </div>
        <Input value={kuva.image_license_note} onChange={(e) => setKuva({ ...kuva, image_license_note: e.target.value })} placeholder="Lisenssi ja lähdesivu, esim. CC BY 4.0, https://commons.wikimedia.org/wiki/File:…" className="text-xs" />
      </fieldset>

      {naytaAani && (
        <fieldset className="space-y-2 rounded-md border bg-background p-3">
          <legend className="px-1 text-xs font-medium text-muted-foreground">Eläinääni{vaatiiElainaanen(tyyppi) ? " (pakollinen)" : ""}</legend>
          <div className="flex items-center gap-2">
            <Input value={aani.url} onChange={(e) => setAani({ ...aani, url: e.target.value })} placeholder="/aanet/lapset/elainaanet/elainaani-kaki.mp3" />
            {soittonappi("elainaani-muokkaus", "Kuuntele", aani.url || null)}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input value={aani.laji} onChange={(e) => setAani({ ...aani, laji: e.target.value })} placeholder="Laji, esim. käki" className="text-xs" />
            <Input value={aani.tieteellinen} onChange={(e) => setAani({ ...aani, tieteellinen: e.target.value })} placeholder="Tieteellinen nimi" className="text-xs" />
            <Input value={aani.tekija} onChange={(e) => setAani({ ...aani, tekija: e.target.value })} placeholder="Tekijä" className="text-xs" />
            <Input value={aani.lisenssi} onChange={(e) => setAani({ ...aani, lisenssi: e.target.value })} placeholder="Lisenssi, esim. CC BY 4.0" className="text-xs" />
            <Input value={aani.lahde} onChange={(e) => setAani({ ...aani, lahde: e.target.value })} placeholder="Lähde, esim. iNaturalist (GBIF)" className="text-xs" />
            <Input value={aani.lahde_url} onChange={(e) => setAani({ ...aani, lahde_url: e.target.value })} placeholder="Lähteen osoite (https://…)" className="text-xs" />
          </div>
          <p className="text-xs text-muted-foreground">
            Uudella äänitiedostolla soittopalkin aaltomuoto puuttuu, kunnes se lasketaan uudelleen (peli toimii ilman sitä).
          </p>
        </fieldset>
      )}

      {KLIPIT.some((c) => s(initial.audio?.[c.avain])) && (
        <div className="space-y-1.5">
          <Label>Juontajaklipit (kuuntele)</Label>
          <div className="flex flex-wrap gap-1.5">
            {KLIPIT.map((c) => soittonappi(`m-${c.avain}`, c.label, s(initial.audio?.[c.avain]) || null))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
