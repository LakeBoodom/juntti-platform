// Televisionäkymän palvelinosa: valitun tason kierrokset selaimen RuutuNakyma-komponentille (noindex).
import "@/app/(tn20)/visapaketit.css";
import { runkoCond } from "@/components/tn20/runko/runkoFontti";
import { hakuosa, sarjaNimi, tasonKierrokset, type Sivu, type Taso } from "@/lib/visapaketit";
import RuutuNakyma from "./RuutuNakyma";

export default function RuutuSivu({ sivu, taso, esikatselu }: { sivu: Sivu; taso: Taso; esikatselu: string | null }) {
  const p = sivu.vp.paketti;
  const otsikko = sivu.painokset && p.sarja ? sarjaNimi(p.sarja) : p.painos_nimi ? `${p.otsikko} · ${p.painos_nimi}` : p.otsikko;
  const haku = hakuosa(p.kohderyhma === "molemmat" && taso === "lapset" ? "lapset" : null, esikatselu);
  return (
    <div className={runkoCond.variable}>
      <RuutuNakyma
        packId={p.id}
        otsikko={otsikko}
        kierrokset={tasonKierrokset(sivu.vp, taso)}
        paluu={sivu.polku + haku}
        vetaja={`${sivu.polku}/vetaja${haku}`}
        mittaa={!sivu.vp.esikatselu}
      />
    </div>
  );
}
