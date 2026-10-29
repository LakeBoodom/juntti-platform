// Juontajan näkymän palvelinosa: valitun tason kierrokset selaimen VetajaNakyma-komponentille (noindex).
import "@/app/(tn20)/visapaketit.css";
import { runkoCond } from "@/components/tn20/runko/runkoFontti";
import { hakuosa, sarjaNimi, tasonKierrokset, type Sivu, type Taso } from "@/lib/visapaketit";
import VetajaNakyma from "./VetajaNakyma";

export default function VetajaSivu({ sivu, taso, esikatselu }: { sivu: Sivu; taso: Taso; esikatselu: string | null }) {
  const p = sivu.vp.paketti;
  const otsikko = sivu.painokset && p.sarja ? sarjaNimi(p.sarja) : p.painos_nimi ? `${p.otsikko} · ${p.painos_nimi}` : p.otsikko;
  const lapset = p.kohderyhma === "molemmat" && taso === "lapset";
  return (
    <div className={runkoCond.variable}>
      <VetajaNakyma
        packId={p.id}
        otsikko={otsikko}
        kierrokset={tasonKierrokset(sivu.vp, taso)}
        paluu={sivu.polku + hakuosa(lapset ? "lapset" : null, esikatselu)}
        avain={`tn_vp_vetaja:${p.slug}:${lapset ? "lapset" : "aikuiset"}`}
        mittaa={!sivu.vp.esikatselu}
      />
    </div>
  );
}
