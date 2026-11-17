import { HENKILOKUVALAHTEET } from "@/lib/henkilokuvalahteet";
import { jakoMeta } from "@/lib/jakoMeta";
import type { Metadata } from "next";
import Link from "next/link";
import { KUVALAHTEET, commonsUrl, type Kuvalahde } from "@/lib/kuvalahteet";
import { JP_EURO } from "@/lib/jalkapallo";
import { AANI_RYHMAT } from "@/lib/aanivisat";
import { haeAaniLahteet, type AaniLahde } from "@/lib/aanivisat/data";
import { getSupabase } from "@/lib/supabase";
import { getSiteId } from "@/lib/queries";
import { KATEGORIAT } from "@/lib/kuvavisat2026";
import { LASTEN_IAT } from "@/lib/lapset/data";
import { kuvavisanLahde } from "@/lib/lahdesivu";

// KUVIEN JA ÄÄNIEN LÄHTEET (kuvalähdebrief, Heikki 17.11.2026): tämä sivu on sivuston AINOA kuvakohtainen lähdemerkintä.
// Jokaisen sivun alatunniste linkittää tänne. Näkymissä ei ole merkintöjä (poikkeukset: jakokortit ja visapakettien
// tuloste). Siksi sivun pitää kattaa jokainen näkyvä vapaasti lisensoitu kuva ja äänite: rekisterit (lib/kuvalahteet.ts,
// lib/henkilokuvalahteet.ts) ja kanta (kuvavisas, questions.image_credit + vastausten kuvat + eläinäänet, aanivisat).
// Kattavuuden tarkistus: scripts/kuvalahteet-kattavuus.ts.
// Äänivisojen tekijätiedot tulevat kannasta (uudet äänet näkyvät tunnin sisällä).
export const revalidate = 3600;

const OTSIKKO = "Kuvien ja äänien lähteet";
const KUVAUS = "Tietoniekassa käytettyjen vapaasti lisensoitujen valokuvien ja äänitteiden tekijät, lisenssit ja lähteet.";

export const metadata: Metadata = {
  title: OTSIKKO,
  description: KUVAUS,
  robots: { index: true, follow: true },
  alternates: { canonical: "/kuvien-lahteet" },
  ...jakoMeta({
    title: OTSIKKO,
    description: KUVAUS,
    url: "/kuvien-lahteet",
    kuva: "/og/sivu/kuvien-lahteet",
  }),
};

const PAIVITETTY = "17.11.2026";

export default async function KuvienLahteetPage() {
  const [aanet, kuvavisat, visojenKuvat] = await Promise.all([haeAaniLahteet(), haeKuvavisaLahteet(), haeVisojenKuvat()]);
  const musiikki = KUVALAHTEET.filter((k) => k.kokoelma === "musiikki");
  const kaupungit = KUVALAHTEET.filter((k) => k.kokoelma === "kaupungit");
  const jaakiekko = KUVALAHTEET.filter((k) => k.kokoelma === "jaakiekko");
  const vaalit = KUVALAHTEET.filter((k) => k.kokoelma === "vaalit");
  const historia = KUVALAHTEET.filter((k) => k.kokoelma === "historia");
  const maantieto = KUVALAHTEET.filter((k) => k.kokoelma === "maantieto");
  const luonto = KUVALAHTEET.filter((k) => k.kokoelma === "luonto");
  const kulttuuri = KUVALAHTEET.filter((k) => k.kokoelma === "kulttuuri");
  const urheilu = KUVALAHTEET.filter((k) => k.kokoelma === "urheilulajit");
  const ikajarjestys = KUVALAHTEET.filter((k) => k.kokoelma === "ikajarjestys");
  const etusivu = KUVALAHTEET.filter((k) => k.kokoelma === "etusivu");
  const henkilovisat = KUVALAHTEET.filter((k) => k.kokoelma === "henkilot");
  const euroIdt = new Set(JP_EURO.map((c) => c.id));
  const jalkapallo = KUVALAHTEET.filter((k) => k.kokoelma === "jalkapallo" && !euroIdt.has(k.slug));
  const jalkapalloEuro = KUVALAHTEET.filter((k) => k.kokoelma === "jalkapallo" && euroIdt.has(k.slug));

  const kuvavisaOsiot = KATEGORIAT.flatMap((k) => {
    const rivit = kuvavisat.filter((r) => r.tyyppi === k.type);
    return rivit.length ? [{ id: `kuvavisa-${k.type}`, otsikko: `Kuvavisa: ${k.otsikko}`, sisalto: <KuvavisaLahteet avain={k.type} rivit={rivit} /> }] : [];
  });
  const aaniOsiot = AANI_RYHMAT.flatMap((r) => {
    const rivit = aanet.filter((a) => a.ryhma === r.key);
    return rivit.length ? [{ id: `aanivisa-${r.key}`, otsikko: `Äänivisa: ${r.otsikko}`, sisalto: <Aanivisa rivit={rivit} /> }] : [];
  });
  const osiot: { id: string; otsikko: string; sisalto: React.ReactNode }[] = [
    { id: "musiikki", otsikko: "Musiikki-kokoelma", sisalto: <Lista rivit={musiikki} /> },
    { id: "kaupungit", otsikko: "Kaupungit-kokoelma", sisalto: <Lista rivit={kaupungit} /> },
    { id: "jaakiekko", otsikko: "Jääkiekko-kokoelma", sisalto: <Lista rivit={jaakiekko} /> },
    { id: "vaalit", otsikko: "Vaalit ja politiikka -kokoelma", sisalto: (
      <>
        <Lista rivit={vaalit} />
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, margin: "14px 0 0" }}>
          Vaalipiirikartan rajat (Vaalipiiriketju): Tilastokeskus, vaalipiirit 1:4,5 milj., CC BY 4.0 (yksinkertaistettu).
        </p>
      </>
    ) },
    { id: "historia", otsikko: "Historia-kokoelma", sisalto: <Lista rivit={historia} /> },
    { id: "maantieto", otsikko: "Maantieto-kokoelma", sisalto: <Lista rivit={maantieto} /> },
    { id: "luonto", otsikko: "Luonto-kokoelma", sisalto: <Lista rivit={luonto} /> },
    { id: "kulttuuri", otsikko: "Kulttuuri-kokoelma", sisalto: <Lista rivit={kulttuuri} /> },
    { id: "urheilu", otsikko: "Urheilu-kokoelma", sisalto: <Lista rivit={urheilu} /> },
    { id: "jalkapallo", otsikko: "Jalkapallo: Valioliiga, Mestarien liiga ja maajoukkueet", sisalto: <Lista rivit={jalkapallo} /> },
    { id: "jalkapallo-euro", otsikko: "Jalkapallo: Euroopan suurseurat", sisalto: <Lista rivit={jalkapalloEuro} /> },
    { id: "etusivu", otsikko: "Etusivu: Pelaa aiheittain", sisalto: <Lista rivit={etusivu} /> },
    { id: "jarjesta", otsikko: "Järjestä ja Kuka on vanhin?", sisalto: <Lista rivit={ikajarjestys} /> },
    { id: "henkilovisat", otsikko: "Henkilövisojen yläkuvat", sisalto: <Lista rivit={henkilovisat} /> },
    { id: "henkilokuvat", otsikko: "Henkilökuvat (henkilösivut, Tunnetut henkilöt, Päivän sankari, Järjestä)", sisalto: <Lista rivit={HENKILOKUVALAHTEET} /> },
    ...kuvavisaOsiot,
    ...(visojenKuvat.length
      ? [{ id: "lasten-visat", otsikko: "Lasten visat ja visapaketit: kuvat ja eläinäänet", sisalto: <VisojenKuvat ryhmat={visojenKuvat} /> }]
      : []),
    ...aaniOsiot,
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--color-surface-dark, #0f1520)",
        color: "white",
        padding: "var(--space-xl, 40px) var(--space-md, 16px)",
      }}
    >
      <article
        style={{
          maxWidth: 860,
          margin: "0 auto",
          fontFamily: "var(--font-body, system-ui)",
          lineHeight: 1.65,
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-block",
            color: "rgba(255,255,255,0.6)",
            fontSize: 14,
            textDecoration: "none",
            marginBottom: 24,
          }}
        >
          ← Etusivulle
        </Link>

        <h1 style={{ fontSize: "clamp(28px, 6vw, 40px)", lineHeight: 1.1, margin: "0 0 12px" }}>
          {OTSIKKO}
        </h1>

        <p style={{ color: "rgba(255,255,255,0.72)", margin: "0 0 28px" }}>
          Osa Tietoniekan kuvista on vapaasti lisensoituja valokuvia, jotka on löydetty{" "}
          <a href="https://openverse.org" target="_blank" rel="noopener noreferrer" style={linkki}>
            Openversen
          </a>{" "}
          kautta ja haettu{" "}
          <a
            href="https://commons.wikimedia.org"
            target="_blank"
            rel="noopener noreferrer"
            style={linkki}
          >
            Wikimedia Commonsista
          </a>{" "}
          (yksittäisiä kuvia myös{" "}
          <a href="https://www.finna.fi" target="_blank" rel="noopener noreferrer" style={linkki}>
            Finnasta
          </a>
          ). Jokaisen kuvan lisenssi on tarkistettu kuvan omalta lähdesivulta. Kuvia on rajattu
          korttimittaan (640×360) ja skaalattu; muu muokkaus on merkitty kuvan kohdalle. CC BY-SA -lisensoitujen
          kuvien muokatut versiot ovat saatavilla samalla lisenssillä kuin alkuperäiset. Äänivisojen ja lasten visojen
          eläinäänet ovat{" "}
          <a href="https://www.inaturalist.org" target="_blank" rel="noopener noreferrer" style={linkki}>
            iNaturalistin
          </a>{" "}
          havainnoista; niiden tekijät ja lisenssit ovat alla.
        </p>

        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, margin: "0 0 28px" }}>
          Muut sivuston kuvat ovat Tietoniekan omia kuvituksia. Osa niistä on tehty tekoälyllä, esimerkiksi Mestis-seurojen
          ja muiden seuravisojen kuvat. Sivu päivitetty {PAIVITETTY}.
        </p>

        <nav aria-label="Sivun osiot" style={{ margin: "0 0 30px" }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexWrap: "wrap", gap: "4px 18px", fontSize: 14 }}>
            {osiot.map((o) => (
              <li key={o.id}>
                <a href={`#${o.id}`} style={{ ...linkki, display: "inline-block", padding: "6px 0" }}>{o.otsikko}</a>
              </li>
            ))}
          </ul>
        </nav>

        {osiot.map((o, i) => (
          <section key={o.id} aria-labelledby={o.id}>
            <h2 id={o.id} style={{ fontSize: 22, margin: i === 0 ? "0 0 14px" : "34px 0 14px", scrollMarginTop: 16 }}>{o.otsikko}</h2>
            {o.sisalto}
          </section>
        ))}
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, marginTop: 28 }}>
          Huomasitko virheen kuvan tai äänitteen tekijä- tai lisenssitiedossa? Kerro siitä, niin korjaamme tai
          poistamme kuvan.
        </p>
      </article>
    </main>
  );
}

function Lista({ rivit }: { rivit: Kuvalahde[] }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 14 }}>
      {rivit.map((k) => (
        <li
          key={k.kokoelma + "-" + k.slug + "-" + k.tiedosto}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            padding: "12px 14px",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{k.kuvaus}</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.72)" }}>
            Kuva:{" "}
            <a href={k.lahdeUrl ?? commonsUrl(k.tiedosto)} target="_blank" rel="noopener noreferrer" style={linkki}>
              {k.tiedosto.replace(/\.[a-z]+$/i, "")}
            </a>{" "}
            · {k.tekija} ·{" "}
            {k.lisenssiUrl ? (
              <a href={k.lisenssiUrl} target="_blank" rel="noopener noreferrer" style={linkki}>
                {k.lisenssi}
              </a>
            ) : (
              k.lisenssi
            )}
            {k.vuosi ? ` · ${k.vuosi}` : ""} · {k.muokkaus ?? "rajattu"}
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Äänivisan osio: paljastuskuvat (Wikimedia Commons) ja äänitteet (iNaturalist). */
function Aanivisa({ rivit }: { rivit: AaniLahde[] }) {
  const kuvalliset = rivit.filter((a) => a.kuva);
  return (
    <>
      <h3 style={{ fontSize: 17, margin: "0 0 12px" }}>Kuvat</h3>
      <ul style={lista}>
        {kuvalliset.map((a) => (
          <li key={"kuva-" + a.laji} style={rivi}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              {a.laji}
              {a.tieteellinen && <i style={{ fontWeight: 400, color: "rgba(255,255,255,0.6)" }}> ({a.tieteellinen})</i>}
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.72)" }}>
              Kuva:{" "}
              <a href={a.kuva!.lahde} target="_blank" rel="noopener noreferrer" style={linkki}>
                {commonsNimi(a.kuva!.lahde)}
              </a>{" "}
              · {a.kuva!.tekija} · {a.kuva!.lisenssi} · rajattu
            </div>
          </li>
        ))}
      </ul>

      <h3 style={{ fontSize: 17, margin: "26px 0 6px" }}>Äänet</h3>
      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, margin: "0 0 14px" }}>
        Äänitteet ovat{" "}
        <a href="https://www.inaturalist.org" target="_blank" rel="noopener noreferrer" style={linkki}>
          iNaturalistin
        </a>{" "}
        havainnoista. Niistä on leikattu lyhyt jakso, joka soi visassa kahdesti; sonogrammikuvat on piirretty äänitteistä.
      </p>
      <ul style={lista}>
        {rivit.map((a) => (
          <li key={"aani-" + a.laji} style={rivi}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{a.laji}</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.72)" }}>
              Ääni:{" "}
              <a href={a.aani.lahde} target="_blank" rel="noopener noreferrer" style={linkki}>
                {havaintoNimi(a.aani.lahde)}
              </a>{" "}
              · {a.aani.tekija} · {a.aani.lisenssi} · lyhennetty
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/* Kuvavisat (9.10.2026; kaikki tyypit 17.11.2026): tekijä ja lisenssi kuvavisas-taulusta. source_credit muodossa
   "Tekijä / Wikimedia Commons, Lisenssi", license_note "Lisenssi, https://commons…/File:…" ja valinnaisesti
   muokkaukset sulkeissa lopussa, esim. "(rajattu, kirkastettu)" – oletus "rajattu".
   Rivit, joilla on vielä yleinen merkintä ilman tekijää, jätetään pois; niiden merkintä näkyy siirtymäajan pelissä
   (lib/lahdesivu.ts) ja ne ovat kattavuusraportissa. */
type KuvavisaLahde = { tyyppi: string; laji: string; tekija: string; lisenssi: string; lahde: string | null; muokkaus: string };

async function haeKuvavisaLahteet(): Promise<KuvavisaLahde[]> {
  const sb = getSupabase();
  const siteId = await getSiteId();
  if (!sb || !siteId) return [];
  const { data, error } = await sb
    .from("kuvavisas")
    .select("type, correct_option, source_credit, license_note")
    .eq("site_id", siteId)
    .eq("active", true)
    .order("correct_option")
    .range(0, 4999);
  if (error) return [];
  return (data ?? []).flatMap((r) => {
    const l = kuvavisanLahde(r.source_credit);
    if (!l) return [];
    const lahde = (r.license_note ?? "").match(/https:\/\/commons\.wikimedia\.org\/wiki\/File:\S+/)?.[0] ?? null;
    const muokkaus = (r.license_note ?? "").match(/\(([^)]+)\)\s*$/)?.[1] ?? "rajattu";
    return [{ tyyppi: r.type, laji: r.correct_option, tekija: l.tekija, lisenssi: l.lisenssi, lahde, muokkaus }];
  });
}

function KuvavisaLahteet({ avain, rivit }: { avain: string; rivit: KuvavisaLahde[] }) {
  return (
    <ul style={lista}>
      {rivit.map((k, i) => (
        <li key={avain + "-" + k.laji + "-" + i} style={rivi}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{k.laji}</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.72)" }}>
            Kuva:{" "}
            {k.lahde ? (
              <a href={k.lahde} target="_blank" rel="noopener noreferrer" style={linkki}>
                {commonsNimi(k.lahde)}
              </a>
            ) : (
              "Wikimedia Commons"
            )}{" "}
            · {k.tekija} · {k.lisenssi} · {k.muokkaus}
          </div>
        </li>
      ))}
    </ul>
  );
}

/* Visojen kysymys- ja vastauskuvat sekä eläinäänet (lasten visat ja niistä kootut visapaketit, 17.11.2026):
   questions.image_credit ("Tekijä / Wikimedia Commons, Lisenssi") + image_license_note, vastausten image_credit ja
   animal_sound (tekija, lisenssi, lahde_url). Omat kuvitukset (ei image_creditiä) eivät ole listalla. */
type VisanLahde = { kohde: string; laji: "Kuva" | "Ääni"; tekija: string; lisenssi: string; lahde: string | null };
type VisanLahteet = { visa: string; rivit: VisanLahde[] };

type KysymysRivi = {
  sort_order: number;
  answers: unknown;
  image_credit: string | null;
  image_license_note: string | null;
  animal_sound: unknown;
  quizzes: { title: string; display_title: string | null } | null;
};

async function haeVisojenKuvat(): Promise<VisanLahteet[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("questions")
    .select("sort_order, answers, image_credit, image_license_note, animal_sound, quizzes!inner(title, display_title, status, platform, target_age)")
    .eq("quizzes.status", "published")
    .in("quizzes.platform", ["tietoniekka", "both"])
    .in("quizzes.target_age", [...LASTEN_IAT])
    .order("sort_order")
    .range(0, 4999);
  if (error) return [];
  const ryhmat = new Map<string, VisanLahde[]>();
  const lisaa = (visa: string, r: VisanLahde) => {
    const l = ryhmat.get(visa) ?? [];
    if (!l.some((x) => x.laji === r.laji && x.tekija === r.tekija && x.kohde === r.kohde)) l.push(r);
    ryhmat.set(visa, l);
  };
  for (const q of (data ?? []) as unknown as KysymysRivi[]) {
    const visa = q.quizzes?.display_title || q.quizzes?.title || "Visa";
    const vastaukset = (Array.isArray(q.answers) ? q.answers : []) as Array<Record<string, unknown>>;
    const oikea = vastaukset.find((a) => a.is_correct === true);
    const kys = kuvavisanLahde(q.image_credit);
    if (kys) {
      const lahde = (q.image_license_note ?? "").match(/https:\/\/\S+/)?.[0] ?? null;
      lisaa(visa, { kohde: typeof oikea?.text === "string" ? oikea.text : "Kysymyksen kuva", laji: "Kuva", ...kys, lahde });
    }
    for (const a of vastaukset) {
      const l = kuvavisanLahde(typeof a.image_credit === "string" ? a.image_credit : null);
      if (l) lisaa(visa, { kohde: typeof a.text === "string" ? a.text : "Vastauksen kuva", laji: "Kuva", ...l, lahde: null });
    }
    const e = (q.animal_sound && typeof q.animal_sound === "object" ? q.animal_sound : null) as Record<string, unknown> | null;
    if (e && typeof e.tekija === "string" && e.tekija) {
      lisaa(visa, {
        kohde: typeof e.laji === "string" && e.laji ? e.laji : "Eläinääni",
        laji: "Ääni",
        tekija: `${e.tekija} / iNaturalist`,
        lisenssi: typeof e.lisenssi === "string" ? e.lisenssi : "",
        lahde: typeof e.lahde_url === "string" ? e.lahde_url : null,
      });
    }
  }
  return [...ryhmat].map(([visa, rivit]) => ({ visa, rivit })).sort((a, b) => a.visa.localeCompare(b.visa, "fi"));
}

function VisojenKuvat({ ryhmat }: { ryhmat: VisanLahteet[] }) {
  return (
    <>
      {ryhmat.map((g, gi) => (
        <div key={g.visa}>
          <h3 style={{ fontSize: 17, margin: gi === 0 ? "0 0 12px" : "26px 0 12px" }}>{g.visa}</h3>
          <ul style={lista}>
            {g.rivit.map((r) => (
              <li key={r.laji + r.kohde + r.tekija} style={rivi}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{r.kohde}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.72)" }}>
                  {r.laji}:{" "}
                  {r.lahde ? (
                    <a href={r.lahde} target="_blank" rel="noopener noreferrer" style={linkki}>
                      {r.laji === "Ääni" ? havaintoNimi(r.lahde) : commonsNimi(r.lahde)}
                    </a>
                  ) : r.laji === "Ääni" ? (
                    "iNaturalist"
                  ) : (
                    "Wikimedia Commons"
                  )}{" "}
                  · {r.tekija}
                  {r.lisenssi ? ` · ${r.lisenssi}` : ""}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

const rivi: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 14px",
};
const lista: React.CSSProperties = { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 14 };

/** Commons-sivun osoitteesta tiedoston nimi ilman päätettä. */
function commonsNimi(url: string): string {
  const m = url.match(/\/wiki\/File:(.+)$/);
  if (!m) return "Wikimedia Commons";
  try {
    return decodeURIComponent(m[1]).replace(/_/g, " ").replace(/\.[a-z]+$/i, "");
  } catch {
    return "Wikimedia Commons";
  }
}

function havaintoNimi(url: string): string {
  const m = url.match(/inaturalist\.org\/observations\/(\d+)/);
  return m ? `iNaturalist-havainto ${m[1]}` : "Äänitiedosto";
}

const linkki: React.CSSProperties = { color: "#C68BFF", textDecoration: "underline" };
