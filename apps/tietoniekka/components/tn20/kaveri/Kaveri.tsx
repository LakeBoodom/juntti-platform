// HAASTETUN POLKU (Jakotekstit v4 §5, vaihe 3, 7.11.2026): yhteiset palat pelimuodoille.
//   KaveriRivi      aloitusnäkymän ylin rivi: "Kaverisi sai 3/5." + mitä tehdään (lib/kaveri.ts haasterivi)
//   KaveriVertailu  tulosnäkymän vertailu: Sinä | Kaverisi ja tuomio otsikkona (kuten tietovisan TulosNakyma)
// Värit pelikehyksen iholta (--pk-*), joten sama komponentti toimii tummalla, kermalla ja violetilla pohjalla.
import { TUOMIOT, tuomio, type KaverinTulos, type OmaTulos } from "@/lib/kaveri";
import "@/app/(tn20)/kaveri.css";

export function KaveriRivi({ kaveri, className }: { kaveri: Pick<KaverinTulos, "otsikko" | "rivi">; className?: string }) {
  return (
    <p className={`kv-rivi${className ? ` ${className}` : ""}`}>
      <b>{kaveri.otsikko}</b>
      <span>{kaveri.rivi}</span>
    </p>
  );
}

/** Vertailu ja tuomio; otsikkotaso h1 (tulosnäkymän pääotsikko) tai h2. */
export function KaveriVertailu({ oma, kaveri, id, taso = "h1" }: { oma: OmaTulos; kaveri: KaverinTulos; id?: string; taso?: "h1" | "h2" }) {
  const t = tuomio(oma.arvo, kaveri.arvo);
  const Otsikko = taso;
  return (
    <div className="kv-vertailu">
      <div className="kv-vs" aria-hidden="true">
        <div>
          <span className="kv-pikku">Sinä</span>
          <span className="kv-luku">{oma.luku}</span>
        </div>
        <div className="kv-kaveri">
          <span className="kv-pikku">Kaverisi</span>
          <span className="kv-luku kv-luku--pieni">{kaveri.luku}</span>
        </div>
      </div>
      <span className="kv-sr">Sinä {oma.luku}, kaverisi {kaveri.luku}.</span>
      <Otsikko id={id} className="kv-tuomio" data-tuomio={t}>{TUOMIOT[t]}</Otsikko>
    </div>
  );
}
