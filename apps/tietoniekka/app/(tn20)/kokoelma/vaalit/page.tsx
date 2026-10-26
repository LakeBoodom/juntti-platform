// VAALIT JA POLITIIKKA yhteisellä rungolla (TOTEUTUSBRIEF "Kokoelmasivun runko ja pelikehys", vaihe 3,
// 20.10.2026). Kohteet (visat, politiikan historia, vallan kasvot) tulevat lib/vaalit/data.ts:stä
// (lib/kokoelmat/vaalit.ts); V4 = Laita järjestykseen -kasvoketjubanneri (tyyppi 3), vaalilaskuri heron sisällä;
// Vaalipiiriketju ja Laita järjestykseen -pakat myös V6:ssa.
// Vanha sivukohtainen toteutus (CD 5.10.2026: vaalipiirikartta, pakkakortit, kasvoketjubanneri) poistettu.
// ISR 1 h (laskuri päivittyy päivittäin).
import "../../runko.css";
import "../../etusivun-bannerit.css";
import type { Metadata } from "next";
import { jakoMeta } from "@/lib/jakoMeta";
import KokoelmaRunko from "@/components/tn20/runko/KokoelmaRunko";
import Vaalilaskuri from "@/components/tn20/runko/Vaalilaskuri";
import PeliBanneri from "@/components/tn20/runko/PeliBanneri";
import { KasvoketjuBanneri } from "@/components/tn20/EtusivunBannerit";
import { JULKAISTUT, pakkaHref } from "@/lib/jarjesta/pakat";
import { haeRunkoData } from "@/lib/kokoelmat/data";
import { VAALIT, vaalitKohteet } from "@/lib/kokoelmat/vaalit";
import { haeVaalitHub } from "@/lib/vaalit/data";

export const revalidate = 3600;

const POLKU = "/kokoelma/vaalit";
const OTSIKKO = "Vaalit ja politiikka – tietovisat ja pelit eduskunnasta | Tietoniekka";
const KUVAUS =
  "Tunnetko eduskunnan? Eduskuntavaalit, 13 vaalipiiriä, puoluejohtajat, pääministerit ja presidentit sekä Suomen politiikan historia visoina. Laskuri eduskuntavaaleihin 18.4.2027.";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: OTSIKKO,
    description: KUVAUS,
    alternates: { canonical: POLKU },
    ...jakoMeta({ title: "Vaalit ja politiikka", description: KUVAUS, url: POLKU, kuva: "/og/kokoelma/vaalit" }),
  };
}

/** Laita järjestykseen -noston kasvoketju (Heikki 18.10.2026): neljä presidenttiä oikeassa järjestyksessä,
 *  omat kopiot public/20/vaalit/kasvot (krediitit lib/kuvalahteet.ts). */
const KETJU = [
  { id: "stahlberg", name: "K. J. Ståhlberg" },
  { id: "kekkonen", name: "Urho Kekkonen" },
  { id: "halonen", name: "Tarja Halonen" },
  { id: "stubb", name: "Alexander Stubb" },
].map((h) => ({ ...h, image: `/20/vaalit/kasvot/${h.id}.webp` }));

export default async function VaalitLanding() {
  const hub = await haeVaalitHub();
  const d = await haeRunkoData(VAALIT, vaalitKohteet(hub));
  if (!d) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  /* V4 tyyppi 3 (Heikki 20.10.2026): Laita järjestykseen -kasvoketjubanneri; laskuri heroon. */
  const pakat = JULKAISTUT.filter((p) => p.collection.slug === "vaalit");
  const aloitus = pakat.find((p) => p.slug === "presidentit") ?? pakat[0];
  const banneri = aloitus ? (
    <PeliBanneri nimi="Laita järjestykseen">
      <KasvoketjuBanneri
        id="vl-jarj-h"
        luokka="eb--jarj"
        otsikko={["Laita", "järjestykseen"]}
        subKapea={<>Kahdeksan nimeä, yksi oikea järjestys<span className="eb-vain-mob"> · 2&nbsp;min</span></>}
        subDesk={<>Kahdeksan nimeä, yksi oikea järjestys · 2&nbsp;min</>}
        href={pakkaHref(aloitus)}
        cta="Aloita presidenteistä"
        henkilot={KETJU}
        kierros={8}
        lisaa="nimeä"
        akseli={["Ensimmäinen", "Viimeisin"]}
      />
    </PeliBanneri>
  ) : undefined;
  return <KokoelmaRunko d={d} tunnusosa={banneri} heroLisa={<Vaalilaskuri />} />;
}
