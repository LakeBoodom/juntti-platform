"use client";
// LASTEN VISAT — /lapset-sivun sisältö (design v0.2: 3a/3c mobiili, 3b/3d desktop).
//
// Ikävalinta ("Kuka pelaa?") suodattaa nostun, aiheet, kaikki visat ja Tulossa-kaistan. Se muistetaan
// laitteella (localStorage tn-lapset-ika) ja etusivun kaistan linkki tuo sen osoitteessa (?ika=4-7|8-12).
// Kaikki visat -sirut käyttävät samaa valintaa. Aihekortti suodattaa visalistan aiheeseen.
// Mobiili näyttää 8 visaa kerrallaan, desktop 15 (+ "Näytä lisää visoja").
import { useEffect, useMemo, useState } from "react";
import type { LastenIka, LastenListaKortti } from "@/lib/lapset/data";
import { IKA_LYHYT, IKA_VALINTA, LASTEN_AIHEET } from "@/lib/lapset/juontajat";
import type { TulossaKortti } from "@/lib/lapset/tulossa";

export type SivuAihe = { avain: string; nimi: string; emoji: string; aksentti: string; kuva: string | null; kuvaKohdistus: string | null; iat: LastenIka[] };
export type SivuNosto = { aihe: string; juhla: boolean; emoji: string; nimi: string; otsikko: string; kuvaus: string; kuva: string | null; aksentti: string };

const IKA_AVAIN = "tn-lapset-ika";
const IAT: LastenIka[] = ["4-7", "8-12"];
const onIka = (s: string | null): s is LastenIka => s === "4-7" || s === "8-12";
const visaHref = (slug: string) => `/visa/${encodeURIComponent(slug)}`;

function lueIka(): LastenIka | null {
  try {
    const url = new URLSearchParams(window.location.search).get("ika");
    if (onIka(url)) {
      window.localStorage.setItem(IKA_AVAIN, url);
      return url;
    }
    const tallennettu = window.localStorage.getItem(IKA_AVAIN);
    return onIka(tallennettu) ? tallennettu : null;
  } catch {
    return null;
  }
}

function tallennaIka(ika: LastenIka | null) {
  try {
    if (ika) window.localStorage.setItem(IKA_AVAIN, ika);
    else window.localStorage.removeItem(IKA_AVAIN);
  } catch {}
}

export default function LapsetSivu({
  visat, aiheet, nosto, tulossa, duo,
}: { visat: LastenListaKortti[]; aiheet: SivuAihe[]; nosto: SivuNosto | null; tulossa: TulossaKortti[]; duo: string }) {
  const [ika, setIka] = useState<LastenIka | null>(null);
  const [aihe, setAihe] = useState<string | null>(null);
  const [sivu, setSivu] = useState(8);
  const [kerralla, setKerralla] = useState(8);

  useEffect(() => {
    setIka(lueIka());
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setSivu(15);
      setKerralla(15);
    }
  }, []);

  const valitse = (uusi: LastenIka | null) => {
    setIka(uusi);
    tallennaIka(uusi);
    setSivu(kerralla);
  };
  const valitseAihe = (avain: string) => {
    setAihe(avain);
    setSivu(kerralla);
    document.getElementById("lps-kaikki")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const lista = useMemo(() => visat.filter((v) => (!ika || v.ika === ika) && (!aihe || v.aihe === aihe)), [visat, ika, aihe]);

  /* Nosto: ilman ikävalintaa uusin visa kummastakin ikäryhmästä, valinnalla enintään kaksi sen ikäryhmän visaa. */
  const nostoVisat = nosto
    ? ika
      ? visat.filter((v) => v.aihe === nosto.aihe && v.ika === ika).slice(0, 2)
      : IAT.flatMap((i) => visat.filter((v) => v.aihe === nosto.aihe && v.ika === i).slice(0, 1))
    : [];
  const tulossaNakyvat = tulossa.filter((t) => !ika || t.iat.includes(ika));

  const ikaKortti = (i: LastenIka) => {
    const t = IKA_VALINTA[i];
    const valittu = ika === i;
    return (
      <button
        key={i}
        type="button"
        className="lps-ika"
        data-ika={i}
        data-tila={valittu ? "valittu" : ika ? "muu" : "ei"}
        aria-pressed={valittu}
        onClick={() => valitse(valittu ? null : i)}
      >
        <span className="lps-ika-yla">
          <span className="lps-ika-emoji" aria-hidden>{t.emoji}</span>
          <span className="lps-ika-ympyra" aria-hidden>{valittu ? "✓" : ""}</span>
        </span>
        <span className="lps-ika-teksti">
          <span className="lps-ika-nimi">{t.nimi}</span>
          <span className="lps-ika-tapa">{t.tapa}</span>
        </span>
      </button>
    );
  };

  const kuvaTaiEmoji = (kuva: string | null, emoji: string, aksentti: string, kohdistus?: string | null) =>
    kuva ? (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={kuva} alt="" loading="lazy" style={kohdistus ? { objectPosition: kohdistus } : undefined} />
    ) : (
      <span className="lps-emoji-pohja" style={{ background: aksentti }} aria-hidden>{emoji}</span>
    );

  const visaRivi = (v: LastenListaKortti) => {
    const a = v.aihe ? LASTEN_AIHEET[v.aihe] : null;
    return (
      <a key={v.slug} className="lps-visa" href={visaHref(v.slug)}>
        <span className="lps-visa-kuva">
          {kuvaTaiEmoji(v.kuva, a?.emoji ?? "⭐", a?.aksentti ?? "#2F6B45")}
          <span className="lps-visa-merkit lps-visa-merkit--kuva">
            <span className="lps-merkki" data-ika={v.ika}>{IKA_LYHYT[v.ika]}</span>
            {v.aani && <span className="lps-merkki lps-merkki--aani">🔊 Äänikysymyksiä</span>}
          </span>
        </span>
        <span className="lps-visa-teksti">
          {a && <span className="lps-visa-aihe" style={v.aihe === "joulu" ? { color: a.aksentti } : undefined}>{a.nimi}</span>}
          <span className="lps-visa-nimi">{v.otsikko}</span>
          <span className="lps-visa-merkit">
            <span className="lps-merkki" data-ika={v.ika}>{IKA_LYHYT[v.ika]}</span>
            {v.aani && <span className="lps-merkki lps-merkki--aani">🔊 Äänikysymyksiä</span>}
          </span>
        </span>
      </a>
    );
  };

  return (
    <div className="lps-sivu">
      {/* ─── Hero ─── */}
      <section className="lps-hero" aria-labelledby="lps-h1">
        <div className="lps-hero-in">
          <div className="lps-hero-teksti">
            <h1 className="lps-h1" id="lps-h1">Lasten visat</h1>
            <span className="lps-pilleri">Tietoniekka lapsille</span>
            <p className="lps-lede">Pelatkaa yhdessä tai pelaa itse – Laura ja Mikko auttavat ja lukevat kysymykset ääneen.</p>
          </div>
          <div className="lps-duo" style={{ backgroundImage: `url(${duo})` }} role="img" aria-label="Laura ja Mikko" />
        </div>
      </section>

      {/* ─── Kuka pelaa? ─── */}
      <section className="lps-kuka" aria-labelledby="lps-kuka-h">
        <div className="lps-kuka-in">
          <div className="lps-kuka-yla">
            <h2 className="lps-kuka-h" id="lps-kuka-h">Kuka pelaa?</h2>
            <span className="lps-kuka-huom lps-vain-desktop">
              Valinta muistetaan tällä laitteella.
              {ika && <button type="button" className="lps-nayta-kaikki" onClick={() => valitse(null)}>Näytä kaikki</button>}
            </span>
          </div>
          <div className="lps-iat">{IAT.map(ikaKortti)}</div>
          <span className="lps-kuka-huom lps-vain-mobiili">
            Valinta muistetaan tällä laitteella.
            {ika && <button type="button" className="lps-nayta-kaikki" onClick={() => valitse(null)}>Näytä kaikki</button>}
          </span>
        </div>
      </section>

      <div className="lps-runko">
        {/* ─── Ajankohtainen nosto ─── */}
        {nosto && nostoVisat.length > 0 && (
          <section className="lps-nosto" aria-labelledby="lps-nosto-h">
            <div className="lps-nosto-kuva">{kuvaTaiEmoji(nosto.kuva, nosto.emoji, nosto.aksentti)}</div>
            <div className="lps-nosto-teksti">
              <span className="lps-nosto-merkki" style={{ color: nosto.aksentti, borderColor: nosto.aksentti }}>
                {nosto.emoji} {nosto.juhla ? "Nyt ajankohtainen" : "Uusimmat visat"}
              </span>
              <h2 className="lps-nosto-h" id="lps-nosto-h">{nosto.otsikko}</h2>
              {nosto.kuvaus && <p className="lps-nosto-p">{nosto.kuvaus}</p>}
              <div className="lps-nosto-visat">
                {nostoVisat.map((v) => (
                  <a key={v.slug} className="lps-nosto-visa" href={visaHref(v.slug)}>
                    <span className="lps-merkki lps-merkki--vaalea">{IKA_LYHYT[v.ika]}</span>
                    <span className="lps-nosto-visa-nimi">{v.otsikko}</span>
                    <span className="lps-nuoli" aria-hidden>→</span>
                  </a>
                ))}
              </div>
              <button type="button" className="lps-nosto-kaikki" onClick={() => valitseAihe(nosto.aihe)}>
                Kaikki {nosto.otsikko.replace(/^Lasten /, "")} →
              </button>
            </div>
          </section>
        )}

        {/* ─── Aiheet ─── */}
        <section className="lps-osio" aria-labelledby="lps-aiheet-h">
          <h2 className="lps-h2" id="lps-aiheet-h">Aiheet</h2>
          <div className="lps-aiheet">
            {aiheet.map((a) => {
              const tulossaAihe = !a.iat.length || (ika !== null && !a.iat.includes(ika));
              const sisalto = (
                <>
                  <span className="lps-aihe-kuva" data-himmea={tulossaAihe || undefined}>
                    {kuvaTaiEmoji(a.kuva, a.emoji, a.aksentti, a.kuvaKohdistus)}
                  </span>
                  {tulossaAihe && <span className="lps-aihe-tulossa">Tulossa</span>}
                  <span className="lps-aihe-nimi">{a.emoji} {a.nimi}</span>
                </>
              );
              return tulossaAihe ? (
                <div key={a.avain} className="lps-aihe" data-tulossa>{sisalto}</div>
              ) : (
                <button key={a.avain} type="button" className="lps-aihe" aria-pressed={aihe === a.avain} onClick={() => valitseAihe(a.avain)}>
                  {sisalto}
                </button>
              );
            })}
          </div>
        </section>

        {/* ─── Kaikki visat ─── */}
        <section className="lps-osio" id="lps-kaikki" aria-labelledby="lps-kaikki-h">
          <div className="lps-kaikki-yla">
            <h2 className="lps-h2" id="lps-kaikki-h">Kaikki visat</h2>
            <div className="lps-sirut" role="group" aria-label="Ikäryhmä">
              <button type="button" className="lps-siru" aria-pressed={!ika} onClick={() => valitse(null)}>Kaikki</button>
              {IAT.map((i) => (
                <button key={i} type="button" className="lps-siru" aria-pressed={ika === i} onClick={() => valitse(i)}>{IKA_LYHYT[i]}</button>
              ))}
            </div>
          </div>
          {aihe && (
            <button type="button" className="lps-aihesuodatin" onClick={() => setAihe(null)}>
              {LASTEN_AIHEET[aihe]?.emoji} {LASTEN_AIHEET[aihe]?.nimi ?? aihe} <span aria-hidden>✕</span>
              <span className="lps-sr">Poista aiherajaus</span>
            </button>
          )}
          {lista.length ? (
            <div className="lps-visat">{lista.slice(0, sivu).map(visaRivi)}</div>
          ) : (
            <p className="lps-tyhja">Tälle valinnalle ei ole vielä visoja.</p>
          )}
          {lista.length > sivu && (
            <button type="button" className="lps-lisaa" onClick={() => setSivu((s) => s + kerralla)}>Näytä lisää visoja</button>
          )}
        </section>

        {/* ─── Tulossa ─── */}
        {tulossaNakyvat.length > 0 && (
          <section className="lps-osio" aria-labelledby="lps-tulossa-h">
            <h2 className="lps-h2" id="lps-tulossa-h">Tulossa</h2>
            <div className="lps-tulossa">
              {tulossaNakyvat.map((t) => {
                const a = LASTEN_AIHEET[t.aihe];
                return (
                  <div key={t.avain} className="lps-tulossa-kortti">
                    <span className="lps-tulossa-kuva">{kuvaTaiEmoji(t.kuva, a?.emoji ?? "⭐", a?.aksentti ?? "#2F6B45", t.kuvaKohdistus)}</span>
                    <span className="lps-tulossa-teksti">
                      <span className="lps-tulossa-merkit">
                        <span className="lps-merkki lps-merkki--tulossa">Tulossa</span>
                        {t.iat.map((i) => <span key={i} className="lps-merkki" data-ika={i}>{IKA_LYHYT[i]}</span>)}
                      </span>
                      <span className="lps-tulossa-nimi">{t.otsikko}</span>
                      <span className="lps-tulossa-p">{t.kuvaus}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ─── Aikuisille ─── */}
        <section className="lps-aikuisille" aria-labelledby="lps-aik-h">
          <div className="lps-aik-otsikko">
            <span className="lps-aik-kicker">Aikuisille</span>
            <h2 className="lps-aik-h" id="lps-aik-h">Näin lasten visat toimivat</h2>
          </div>
          <div className="lps-aik-kohdat">
            <div className="lps-aik-kohta">
              <h3>Miten pelataan</h3>
              <p>Pienet pelaavat aikuisen kanssa: aikuinen auttaa, lapsi valitsee kuvan. Isommat pelaavat itse, ja apuna on kolme vihjettä.</p>
            </div>
            <div className="lps-aik-kohta">
              <h3>Ääni</h3>
              <p>Laura ja Mikko lukevat kysymykset ääneen. Ääni alkaa vasta Aloita-napista, ja kytkin on aina näkyvissä. Teksti näkyy aina myös kirjoitettuna.</p>
            </div>
            <div className="lps-aik-kohta">
              <h3>Ei kirjautumista</h3>
              <p>Ei tiliä eikä sähköpostia. Ikävalinta tallentuu vain tälle laitteelle.</p>
            </div>
            <div className="lps-aik-kohta">
              <h3>Ei mainoksia</h3>
              <p>Ei mainoksia eikä ostoksia.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
