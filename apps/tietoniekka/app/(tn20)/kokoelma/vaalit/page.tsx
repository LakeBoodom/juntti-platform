// VAALIT JA POLITIIKKA -hub (Claude Design 5.10.2026 + katselmus, toteutusbrief "hubin uusi järjestys" 5.10.).
// Järjestys: hero + vaalilaskuri → Eduskuntavaalit-visat → Pelit (päivän peli, Laita järjestykseen,
// vaalipiirikartta) → Suomen politiikan historia → Vallan kasvot (puoluejohtajat, pääministerit, presidentit)
// → johdanto. Periaate: eduskuntavaalien kokoelma, ei Tunnetut henkilöt -sivun jatko-osa.
// Pelirivit ja niiden mode-chipit renderöidään vain lib/pelirekisteri.ts:n perusteella — kun peli julkaistaan, rivi ilmestyy ilman hubin muutosta.
// Kaikki luvut kannasta (lib/vaalit/data.ts). ISR 1 h (vaalilaskuri päivittyy päivittäin).
// Staattinen segmentti ohittaa dynaamisen [collection]-reitin.
import "./vaalit.css";
import type { Metadata } from "next";
import Crumbs from "@/components/tn20/Crumbs";
import { KokoelmaLd } from "@/components/tn20/KokoelmaLd";
import { jakoMeta } from "@/lib/jakoMeta";
import { tanaan } from "@/lib/henkilo";
import { helsinginPaiva } from "@/lib/aika";
import { kokoelmanPelit, type KokoelmaPeli } from "@/lib/pelirekisteri";
import { haeVaalitHub, pisteetPolkuna, puolikaari, VAALIEN_VAIHEET, VAALIPAIVA, type VaalitVisa } from "@/lib/vaalit/data";
import VaalipiiriKartta from "./VaalipiiriKartta";

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

const KOTI_TYYLI: Record<string, { accent: string; bg: string }> = {
  historia: { accent: "#C98A5E", bg: "repeating-linear-gradient(135deg, rgba(201,138,94,.16) 0 2px, transparent 2px 11px), #1F1810" },
  kulttuuri: { accent: "#FFD166", bg: "repeating-linear-gradient(90deg, rgba(255,209,102,.14) 0 9px, rgba(255,209,102,.04) 9px 18px), #1F1A0E" },
};
const OMA_TYYLI = { accent: "#B4A5FF", bg: "radial-gradient(90% 80% at 50% 100%, rgba(180,165,255,.2), transparent 70%), #1A1724" };

/** CD:n siemenellä poimitut 8 paikkaa puolikaaresta (pakkakortin motiivi). */
function siemenPisteet(n: number, k: number, seed: number): Set<number> {
  const out = new Set<number>();
  let s = seed * 9301 + 49297;
  while (out.size < k) {
    s = (s * 9301 + 49297) % 233280;
    out.add(Math.floor((s / 233280) * n));
  }
  return out;
}

const pisinSana = (t: string) => Math.max(...t.split(/[\s–-]+/).map((w) => w.length), 8);

function paiviaVaaleihin(): { ennen: boolean; paivia: number } {
  const t = tanaan();
  const nyt = Date.UTC(t.y, t.m - 1, t.d);
  const vaalit = Date.UTC(VAALIPAIVA.y, VAALIPAIVA.m - 1, VAALIPAIVA.d);
  return { ennen: nyt <= vaalit, paivia: Math.max(0, Math.round((vaalit - nyt) / 86400000)) };
}

const fiPvm = (iso: string | null) => {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${+m[3]}.${+m[2]}.${m[1]}` : null;
};

function VisaKortti({ v, puoli }: { v: VaalitVisa; puoli: string }) {
  const tyyli = v.kotiKey ? KOTI_TYYLI[v.kotiKey] ?? KOTI_TYYLI.historia : OMA_TYYLI;
  return (
    <a className="vl-kortti" href={v.href} style={{ ["--vl-acc" as string]: tyyli.accent }}>
      <span className="vl-kortti-kuva" style={{ background: tyyli.bg }}>
        {v.koti ? (
          <span className="vl-koti">
            <span aria-hidden="true" />
            {v.koti}
          </span>
        ) : (
          <svg viewBox="0 0 200 104" aria-hidden="true">
            <path d={puoli} stroke="#6A5DB0" strokeWidth={5.2} strokeLinecap="round" fill="none" />
          </svg>
        )}
      </span>
      <span className="vl-kortti-teksti">
        <span className="vl-kortti-otsikko" style={{ ["--vl-lw" as string]: pisinSana(v.otsikko) }}>
          {v.otsikko}
        </span>
        <span className="vl-kortti-meta">{v.koti ? `Visa · ${v.koti}-kokoelmasta` : v.meta}</span>
      </span>
    </a>
  );
}

export default async function VaalitHub() {
  const d = await haeVaalitHub();
  const { ennen, paivia } = paiviaVaaleihin();
  const hemi = puolikaari(200);
  const puoli = pisteetPolkuna(hemi);
  const paivanPelit = kokoelmanPelit("vaalit", "paivan-peli");
  const pakat = kokoelmanPelit("vaalit", "jarjesta");
  const peleja = paivanPelit.length + pakat.length;
  const visoja = d.omatVisat.length + d.ristiinVisat.length;
  const vaalipiireja = d.vaalipiirit.length;
  const pelitOsio = peleja > 0 || vaalipiireja > 0;

  const modet = [
    ...(d.omatVisat.length ? [{ nimi: "Eduskuntavaalit", meta: `${d.omatVisat.length} visaa`, href: "#visat" }] : []),
    ...(peleja ? [{ nimi: "Pelit", meta: `${peleja} ${peleja === 1 ? "peli" : "peliä"}`, href: "#pelit" }] : []),
    ...(vaalipiireja ? [{ nimi: "Vaalipiirit", meta: String(vaalipiireja), href: "#vaalipiirit" }] : []),
    ...(d.ristiinVisat.length ? [{ nimi: "Politiikan historia", meta: `${d.ristiinVisat.length} visaa`, href: "#historia" }] : []),
    ...(d.kasvot.length ? [{ nimi: "Vallan kasvot", meta: "", href: "#kasvot" }] : []),
  ];

  const pakkaKortti = (p: KokoelmaPeli, i: number) => {
    const valitut = siemenPisteet(200, 8, i * 4 + 3);
    return (
      <a key={p.href} className="vl-kortti" href={p.href} style={{ ["--vl-acc" as string]: "#B4A5FF" }}>
        <span className="vl-kortti-kuva" style={{ background: "radial-gradient(90% 80% at 50% 100%, rgba(180,165,255,.16), transparent 70%)" }}>
          <svg viewBox="0 0 200 104" aria-hidden="true">
            <path d={puoli} stroke="#352F4C" strokeWidth={5.2} strokeLinecap="round" fill="none" />
            <path d={pisteetPolkuna(hemi.filter((_, j) => valitut.has(j)))} stroke="#D6CEFF" strokeWidth={5.2} strokeLinecap="round" fill="none" />
          </svg>
          <span className="vl-tagi">Pakka</span>
        </span>
        <span className="vl-kortti-teksti">
          <span className="vl-kortti-otsikko" style={{ ["--vl-lw" as string]: pisinSana(p.otsikko) }}>
            {p.otsikko}
          </span>
          <span className="vl-kortti-meta">{p.meta}</span>
        </span>
      </a>
    );
  };

  return (
    <main className="vl">
      <KokoelmaLd avain="vaalit" nimi="Vaalit ja politiikka" polku={POLKU} />
      <Crumbs items={[{ label: "Kokoelmat", href: "/kokoelmat" }, { label: "Vaalit ja politiikka" }]} />

      <section className="vl-hero" aria-labelledby="vl-h1">
        <div className="vl-hero-kuva">
          <picture>
            <source media="(max-width: 759px)" srcSet="/20/vaalit/hero-900.webp" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/20/vaalit/hero.webp" alt="Eduskuntatalon pylväikkö ja portaat viistosti kuvattuna" fetchPriority="high" />
          </picture>
          <span className="vl-hero-varjo" aria-hidden="true" />
          <span className="vl-hero-ala" aria-hidden="true" />
        </div>
        <div className="vl-hero-sisa">
          <div className="vl-hero-teksti">
            <h1 id="vl-h1" className="vl-h1">
              Vaalit ja <span>politiikka</span>
            </h1>
            <p className="vl-lead">
              Tunnetko eduskunnan? {d.kansanedustajia || 200} kansanedustajaa, {vaalipiireja || 13} vaalipiiriä ja Suomen politiikan pitkä linja
              {peleja ? " — peleinä ja visoina." : " — visoina ja kartalla."}
            </p>
            <ul className="vl-chipit">
              {d.kansanedustajia > 0 && <li>{d.kansanedustajia} kansanedustajaa</li>}
              {vaalipiireja > 0 && <li>{vaalipiireja} vaalipiiriä</li>}
              {visoja > 0 && <li>{visoja} visaa</li>}
              {peleja > 0 && <li>{peleja} {peleja === 1 ? "peli" : "peliä"}</li>}
            </ul>
          </div>

          <div className="vl-laskuri">
            <div className="vl-laskuri-ylä">
              <span>Eduskuntavaalit</span>
              <span>
                {VAALIPAIVA.d}.{VAALIPAIVA.m}.{VAALIPAIVA.y}
              </span>
            </div>
            {ennen ? (
              <div className="vl-laskuri-luku">
                <span>{paivia}</span>
                <span>{paivia === 1 ? "päivä vaaleihin" : "päivää vaaleihin"}</span>
              </div>
            ) : (
              <div className="vl-laskuri-jalkeen">
                <span>Uusi eduskunta on valittu — tunnetko sen?</span>
              </div>
            )}
            <ol className="vl-vaiheet" aria-label="Vaalien vaiheet">
              {VAALIEN_VAIHEET.map((v) => (
                <li key={v.nimi} className={ennen ? "" : "on"}>
                  <span className="vl-vaihe-palkki" />
                  <span className="vl-vaihe-nimi" lang="fi">
                    {v.nimi}
                  </span>
                  <span className="vl-vaihe-aika">{v.milloin}</span>
                </li>
              ))}
            </ol>
            {!ennen && paivanPelit[0] && (
              <a className="vl-cta vl-cta--leveä" href={paivanPelit[0].href}>
                Pelaa uutta {paivanPelit[0].otsikko}a
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="vl-runko">
        {modet.length > 1 && (
          <nav className="vl-modet" aria-label="Kokoelman sisältö">
            {modet.map((m) => (
              <a key={m.href} href={m.href}>
                {m.nimi}
                {m.meta && <span>{m.meta}</span>}
              </a>
            ))}
          </nav>
        )}

        {d.omatVisat.length > 0 && (
          <section id="visat" aria-labelledby="vl-visat-h">
            <div className="vl-osio-head">
              <h2 id="vl-visat-h" className="vl-h2">Eduskuntavaalit</h2>
              <p>Vaalit, eduskunta ja hallitukset visoina.</p>
            </div>
            <div className="vl-rivi vl-rivi--ruudukko vl-rivi--isot">
              {d.omatVisat.map((v) => (
                <VisaKortti key={v.href} v={v} puoli={puoli} />
              ))}
            </div>
          </section>
        )}

        {pelitOsio && (
          <section id="pelit" aria-labelledby="vl-pelit-h" className="vl-pelit">
            <div className="vl-osio-head">
              <h2 id="vl-pelit-h" className="vl-h2">Pelit</h2>
            </div>
            {paivanPelit.map((p) => (
              <a key={p.href} className="vl-paivan-kortti" href={p.href}>
                <span className="vl-tagi vl-tagi--vahva">Päivän peli{p.numero ? ` · #${p.numero(helsinginPaiva().iso)}` : ""}</span>
                <span className="vl-paivan-otsikko">{p.otsikko}</span>
                <span className="vl-kortti-meta">{p.meta}</span>
                <span className="vl-cta">Pelaa</span>
              </a>
            ))}
            {pakat.length > 0 && (
              <div id="jarjestys" className="vl-alaosio">
                <div className="vl-ryhma-head">
                  <h3>Laita järjestykseen</h3>
                  <span>Kahdeksan nimeä, yksi oikea järjestys.</span>
                </div>
                <div className="vl-rivi">{pakat.map(pakkaKortti)}</div>
              </div>
            )}
            {vaalipiireja > 0 && (
              <div id="vaalipiirit" className="vl-alaosio">
                <div className="vl-ryhma-head">
                  <h3>{vaalipiireja} vaalipiiriä</h3>
                  <span>Eduskunnan 200 paikkaa jaetaan vaalipiirien kesken Suomen kansalaisten määrän mukaan. Ahvenanmaa valitsee aina yhden edustajan.</span>
                </div>
                <VaalipiiriKartta rivit={d.vaalipiirit} />
              </div>
            )}
          </section>
        )}

        {d.ristiinVisat.length > 0 && (
          <section id="historia" aria-labelledby="vl-hist-h">
            <div className="vl-osio-head">
              <h2 id="vl-hist-h" className="vl-h2">Suomen politiikan historia</h2>
              <p>Mukana myös Historia- ja Kulttuuri-kokoelmista.</p>
            </div>
            <div className="vl-rivi vl-rivi--ruudukko">
              {d.ristiinVisat.map((v) => (
                <VisaKortti key={v.href} v={v} puoli={puoli} />
              ))}
            </div>
          </section>
        )}

        {d.kasvot.length > 0 && (
          <section id="kasvot" aria-labelledby="vl-kasvot-h">
            <div className="vl-osio-head">
              <h2 id="vl-kasvot-h" className="vl-h2">Vallan kasvot</h2>
            </div>
            {d.kasvot.map((r) => (
              <div key={r.avain} className="vl-alaosio">
                <div className="vl-ryhma-head">
                  <h3>{r.otsikko}</h3>
                  <span>{r.kasvot.length}</span>
                </div>
                <ul className="vl-kasvot">
                  {r.kasvot.map((k) => (
                    <li key={k.href}>
                      <a className="vl-kasvo" href={k.href}>
                        <span className="vl-kasvo-kuva">
                          {k.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={k.image_url} alt="" loading="lazy" />
                          ) : (
                            <span aria-hidden="true">
                              {k.name
                                .split(/\s+/)
                                .map((w) => w[0])
                                .join("")
                                .slice(0, 2)}
                            </span>
                          )}
                        </span>
                        <span className="vl-kasvo-teksti">
                          <span className="vl-kasvo-nimi">{k.name}</span>
                          {k.ala && <span className="vl-kasvo-ala">{k.ala}</span>}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <a className="vl-kaikki" href="/henkilot/poliitikot">
              Lisää poliitikkoja Tunnetut henkilöt -kokoelmassa →
            </a>
          </section>
        )}

        <section className="vl-johdanto" aria-labelledby="vl-joh-h">
          <h2 id="vl-joh-h" className="vl-h2">Tietoa kokoelmasta</h2>
          <p>
            Vaalit ja politiikka kokoaa Tietoniekan eduskuntaan ja Suomen poliittiseen historiaan liittyvät visat
            {peleja ? " ja pelit" : ""} yhteen paikkaan.{peleja ? " Pelit käyttävät istuvan eduskunnan kansanedustajia." : ""}
          </p>
          <p>
            Kokoelmassa on {d.omatVisat.length ? "visoja eduskuntavaaleista ja " : ""}visoja Suomen politiikan historiasta. Osa visoista kuuluu myös
            Historia- tai Kulttuuri-kokoelmaan, ja kortti kertoo sen.{d.kasvot.length ? " Puoluejohtajilla, pääministereillä ja presidenteillä on omat henkilösivunsa." : ""}
          </p>
          <p>
            Kansanedustajien tiedot tulevat eduskunnan avoimesta datasta ja vaalipiirien rajat Tilastokeskukselta. Kun eduskuntavaalit
            on käyty {VAALIPAIVA.d}.{VAALIPAIVA.m}.{VAALIPAIVA.y}, tiedot päivitetään uuden eduskunnan kokoonpanoon.
          </p>
          <p>Tietoniekka ei ota kantaa puolueisiin eikä ehdokkaisiin. Kysymykset koskevat tosiasioita: kuka, missä, milloin ja kuinka kauan.</p>
          <p className="vl-lahteet">
            {fiPvm(d.tilanne) ? `Kansanedustajatiedot: eduskunnan avoin data, tilanne ${fiPvm(d.tilanne)}. ` : ""}
            Vaalipiirien rajat: Tilastokeskus, CC BY 4.0. Kuva: Eduskuntatalo, Leonhard Lenz / Wikimedia Commons, CC0 (muokattu).
          </p>
        </section>
      </div>
    </main>
  );
}
