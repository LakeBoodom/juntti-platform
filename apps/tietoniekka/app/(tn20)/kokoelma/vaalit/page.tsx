// VAALIT JA POLITIIKKA -hub v1 (Claude Design 5.10.2026 + katselmus kierros 1, Cowork 5.10.).
// v1 = vain olemassa oleva sisältö: hero + vaalilaskuri, Poliitikot henkilöinä, Visat, vaalipiirikartta,
// johdanto. Pelirivit (päivän peli, Laita järjestykseen, Kumpi?) ja niiden mode-chipit renderöidään vain
// lib/pelirekisteri.ts:n perusteella — kun peli julkaistaan, rivi ilmestyy ilman hubin muutosta.
// Kaikki luvut kannasta (lib/vaalit/data.ts). ISR 1 h (vaalilaskuri päivittyy päivittäin).
// Staattinen segmentti ohittaa dynaamisen [collection]-reitin.
import "./vaalit.css";
import type { Metadata } from "next";
import Crumbs from "@/components/tn20/Crumbs";
import { KokoelmaLd } from "@/components/tn20/KokoelmaLd";
import { jakoMeta } from "@/lib/jakoMeta";
import { tanaan } from "@/lib/henkilo";
import { kokoelmanPelit, type KokoelmaPeli } from "@/lib/pelirekisteri";
import { haeVaalitHub, pisteetPolkuna, puolikaari, VAALIEN_VAIHEET, VAALIPAIVA, type VaalitVisa } from "@/lib/vaalit/data";
import VaalipiiriKartta from "./VaalipiiriKartta";

export const revalidate = 3600;

const POLKU = "/kokoelma/vaalit";
const OTSIKKO = "Vaalit ja politiikka – tietovisat ja pelit eduskunnasta | Tietoniekka";
const KUVAUS =
  "Tunnetko eduskunnan? Kansanedustajat, 13 vaalipiiriä, poliitikot henkilöinä ja Suomen politiikan historia visoina. Laskuri eduskuntavaaleihin 18.4.2027.";

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
        <span className="vl-kortti-otsikko">{v.otsikko}</span>
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
  const kumpi = kokoelmanPelit("vaalit", "kumpi");
  const peleja = paivanPelit.length + pakat.length + kumpi.length;
  const visoja = d.omatVisat.length + d.ristiinVisat.length;
  const vaalipiireja = d.vaalipiirit.length;

  const modet = [
    ...(paivanPelit.length ? [{ nimi: paivanPelit[0].otsikko, meta: "päivittäin", href: "#paivan-peli" }] : []),
    ...(pakat.length ? [{ nimi: "Laita järjestykseen", meta: `${pakat.length} ${pakat.length === 1 ? "pakka" : "pakkaa"}`, href: "#jarjestys" }] : []),
    ...(kumpi.length ? [{ nimi: "Kumpi?", meta: `${kumpi.length} ${kumpi.length === 1 ? "pakka" : "pakkaa"}`, href: "#kumpi" }] : []),
    ...(d.poliitikkoja ? [{ nimi: "Poliitikot", meta: String(d.poliitikkoja), href: "#poliitikot" }] : []),
    ...(visoja ? [{ nimi: "Visat", meta: `${visoja} visaa`, href: "#visat" }] : []),
    ...(vaalipiireja ? [{ nimi: "Vaalipiirit", meta: String(vaalipiireja), href: "#vaalipiirit" }] : []),
  ];

  const pakkaKortti = (p: KokoelmaPeli, i: number) => {
    const valitut = p.korosta === 0 || p.korosta === undefined ? siemenPisteet(200, 8, i * 4 + 3) : new Set(Array.from({ length: p.korosta }, (_, j) => j));
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
          <span className="vl-kortti-otsikko">{p.otsikko}</span>
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
              {d.poliitikkoja > 0 && <li>{d.poliitikkoja} henkilövisaa</li>}
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
          </div>
        </div>
      </section>

      <div className="vl-runko">
        {paivanPelit.length > 0 && (
          <section id="paivan-peli" className="vl-paivan">
            {paivanPelit.map((p) => (
              <a key={p.href} className="vl-paivan-kortti" href={p.href}>
                <span className="vl-tagi vl-tagi--vahva">Päivän peli</span>
                <span className="vl-paivan-otsikko">{p.otsikko}</span>
                <span className="vl-kortti-meta">{p.meta}</span>
                <span className="vl-cta">Pelaa</span>
              </a>
            ))}
          </section>
        )}

        {modet.length > 1 && (
          <nav className="vl-modet" aria-label="Kokoelman sisältö">
            {modet.map((m) => (
              <a key={m.href} href={m.href}>
                {m.nimi}
                <span>{m.meta}</span>
              </a>
            ))}
          </nav>
        )}

        {pakat.length > 0 && (
          <section id="jarjestys" aria-labelledby="vl-jarj-h">
            <div className="vl-osio-head">
              <h2 id="vl-jarj-h" className="vl-h2">Laita järjestykseen</h2>
              <p>Kahdeksan nimeä, yksi oikea järjestys.</p>
            </div>
            <div className="vl-rivi">{pakat.map(pakkaKortti)}</div>
          </section>
        )}

        {kumpi.length > 0 && (
          <section id="kumpi" aria-labelledby="vl-kumpi-h">
            <div className="vl-osio-head">
              <h2 id="vl-kumpi-h" className="vl-h2">Kumpi?</h2>
              <p>Kaksi vaihtoehtoa, nopea päätös.</p>
            </div>
            <div className="vl-rivi">
              {kumpi.map((p) => (
                <a key={p.href} className="vl-kumpi" href={p.href}>
                  <span className="vl-kumpi-ab" aria-hidden="true">
                    <span>A</span>vai<span>B</span>
                  </span>
                  <span className="vl-kortti-teksti">
                    <span className="vl-kortti-otsikko">{p.otsikko}</span>
                    <span className="vl-kortti-meta">{p.meta}</span>
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}

        {d.poliitikot.length > 0 && (
          <section id="poliitikot" aria-labelledby="vl-pol-h">
            <div className="vl-osio-head vl-osio-head--linkki">
              <div>
                <h2 id="vl-pol-h" className="vl-h2">Poliitikot henkilöinä</h2>
                <p>{d.poliitikkoja} poliitikkoa — jokaisella oma sivu ja henkilövisa.</p>
              </div>
              <a className="vl-kaikki" href="/henkilot/poliitikot">
                Kaikki {d.poliitikkoja} poliitikkoa →
              </a>
            </div>
            <div className="vl-rivi vl-rivi--henkilot">
              {d.poliitikot.map((p) => (
                <a key={p.href} className="vl-henkilo" href={p.href}>
                  <span className="vl-henkilo-kuva">
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt="" loading="lazy" />
                    ) : (
                      <span className="vl-henkilo-ini" aria-hidden="true">
                        {p.name
                          .split(/\s+/)
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                    )}
                    <span className="vl-duotone" aria-hidden="true" />
                  </span>
                  <span className="vl-henkilo-nimi">{p.name}</span>
                  {p.role && <span className="vl-henkilo-rooli">{p.role}</span>}
                </a>
              ))}
            </div>
          </section>
        )}

        {visoja > 0 && (
          <section id="visat" aria-labelledby="vl-visat-h">
            <div className="vl-osio-head">
              <h2 id="vl-visat-h" className="vl-h2">Visat</h2>
            </div>
            {d.omatVisat.length > 0 && (
              <div className="vl-visaryhma">
                <div className="vl-ryhma-head">
                  <h3>Eduskuntavaalit</h3>
                  <span>Kokoelman omat visat</span>
                </div>
                <div className="vl-rivi vl-rivi--ruudukko">
                  {d.omatVisat.map((v) => (
                    <VisaKortti key={v.href} v={v} puoli={puoli} />
                  ))}
                </div>
              </div>
            )}
            {d.ristiinVisat.length > 0 && (
              <div className="vl-visaryhma">
                <div className="vl-ryhma-head">
                  <h3>Suomen politiikan historia</h3>
                  <span>Mukana myös toisista kokoelmista</span>
                </div>
                <div className="vl-rivi vl-rivi--ruudukko">
                  {d.ristiinVisat.map((v) => (
                    <VisaKortti key={v.href} v={v} puoli={puoli} />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {vaalipiireja > 0 && (
          <section id="vaalipiirit" aria-labelledby="vl-vp-h">
            <div className="vl-osio-head">
              <h2 id="vl-vp-h" className="vl-h2">{vaalipiireja} vaalipiiriä</h2>
              <p>Eduskunnan 200 paikkaa jaetaan vaalipiirien kesken Suomen kansalaisten määrän mukaan. Ahvenanmaa valitsee aina yhden edustajan.</p>
            </div>
            <VaalipiiriKartta rivit={d.vaalipiirit} />
          </section>
        )}

        <section className="vl-johdanto" aria-labelledby="vl-joh-h">
          <h2 id="vl-joh-h" className="vl-h2">Tietoa kokoelmasta</h2>
          <p>
            Vaalit ja politiikka kokoaa Tietoniekan eduskuntaan ja Suomen poliittiseen historiaan liittyvät visat yhteen paikkaan.
            {peleja > 0 ? " Pelit käyttävät istuvan eduskunnan kansanedustajia." : ""}
          </p>
          <p>
            Kokoelmassa on {d.poliitikkoja} henkilövisaa poliitikoista ja valtionpäämiehistä
            {d.omatVisat.length ? ", visoja eduskuntavaaleista" : ""} sekä visoja Suomen politiikan historiasta. Osa visoista kuuluu myös
            Historia- tai Kulttuuri-kokoelmaan, ja kortti kertoo sen.
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
