import { jakoMeta } from "@/lib/jakoMeta";
import type { Metadata } from "next";
import Link from "next/link";
import { KUVALAHTEET, commonsUrl, type Kuvalahde } from "@/lib/kuvalahteet";
import { AANI_RYHMAT } from "@/lib/aanivisat";
import { haeAaniLahteet, type AaniLahde } from "@/lib/aanivisat/data";
import { getSupabase } from "@/lib/supabase";
import { getSiteId } from "@/lib/queries";

// Äänivisojen tekijätiedot tulevat kannasta (uudet äänet näkyvät tunnin sisällä).
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Kuvien lähteet",
  description:
    "Tietoniekassa käytettyjen vapaasti lisensoitujen valokuvien tekijät, lisenssit ja lähteet.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/kuvien-lahteet" },
  ...jakoMeta({
    title: "Kuvien lähteet",
    description: "Tietoniekassa käytettyjen vapaasti lisensoitujen valokuvien tekijät, lisenssit ja lähteet.",
    url: "/kuvien-lahteet",
    kuva: "/og/sivu/kuvien-lahteet",
  }),
};

const PAIVITETTY = "9.10.2026";

export default async function KuvienLahteetPage() {
  const [aanet, linnut, elaimet] = await Promise.all([
    haeAaniLahteet(),
    haeKuvavisaLahteet("linnut"),
    haeKuvavisaLahteet("elaimet"),
  ]);
  const musiikki = KUVALAHTEET.filter((k) => k.kokoelma === "musiikki");
  const kaupungit = KUVALAHTEET.filter((k) => k.kokoelma === "kaupungit");
  const jaakiekko = KUVALAHTEET.filter((k) => k.kokoelma === "jaakiekko");
  const vaalit = KUVALAHTEET.filter((k) => k.kokoelma === "vaalit");
  const historia = KUVALAHTEET.filter((k) => k.kokoelma === "historia");
  const maantieto = KUVALAHTEET.filter((k) => k.kokoelma === "maantieto");
  const luonto = KUVALAHTEET.filter((k) => k.kokoelma === "luonto");

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
          Kuvien lähteet
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
          kuvien muokatut versiot ovat saatavilla samalla lisenssillä kuin alkuperäiset.
        </p>

        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, margin: "0 0 28px" }}>
          Muut sivuston kuvat ovat Tietoniekan omia kuvituksia. Sivu päivitetty {PAIVITETTY}.
        </p>

        <h2 style={{ fontSize: 22, margin: "0 0 14px" }}>Musiikki-kokoelma</h2>
        <Lista rivit={musiikki} />

        <h2 style={{ fontSize: 22, margin: "34px 0 14px" }}>Kaupungit-kokoelma</h2>
        <Lista rivit={kaupungit} />

        <h2 style={{ fontSize: 22, margin: "34px 0 14px" }}>Jääkiekko-kokoelma</h2>
        <Lista rivit={jaakiekko} />

        <h2 style={{ fontSize: 22, margin: "34px 0 14px" }}>Vaalit ja politiikka -kokoelma</h2>
        <Lista rivit={vaalit} />
        <h2 style={{ fontSize: 22, margin: "34px 0 14px" }}>Historia-kokoelma</h2>
        <Lista rivit={historia} />
        <h2 style={{ fontSize: 22, margin: "34px 0 14px" }}>Maantieto-kokoelma</h2>
        <Lista rivit={maantieto} />
        <h2 style={{ fontSize: 22, margin: "34px 0 14px" }}>Luonto-kokoelma</h2>
        <Lista rivit={luonto} />
        {linnut.length > 0 && <KuvavisaLahteet otsikko="Lintujen kuvavisa" avain="lintu" rivit={linnut} />}
        {elaimet.length > 0 && <KuvavisaLahteet otsikko="Eläinten kuvavisa" avain="elain" rivit={elaimet} />}
        {AANI_RYHMAT.map((r) => {
          const rivit = aanet.filter((a) => a.ryhma === r.key);
          if (!rivit.length) return null;
          return <Aanivisa key={r.key} otsikko={r.otsikko} rivit={rivit} />;
        })}
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, margin: "10px 0 0" }}>
          Vaalipiirikartan rajat: Tilastokeskus, vaalipiirit 1:4,5 milj., CC BY 4.0 (yksinkertaistettu).
        </p>

        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, marginTop: 28 }}>
          Huomasitko virheen kuvan tekijä- tai lisenssitiedossa? Kerro siitä, niin korjaamme tai
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
function Aanivisa({ otsikko, rivit }: { otsikko: string; rivit: AaniLahde[] }) {
  const kuvalliset = rivit.filter((a) => a.kuva);
  const rivi: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 14px",
  };
  const lista: React.CSSProperties = { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 14 };
  return (
    <>
      <h2 style={{ fontSize: 22, margin: "34px 0 14px" }}>Äänivisa: {otsikko} – kuvat</h2>
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

      <h2 style={{ fontSize: 22, margin: "34px 0 6px" }}>Äänivisa: {otsikko} – äänet</h2>
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

/* Kuvavisat (linnut ja eläimet, 9.10.2026): tekijä ja lisenssi kuvavisas-taulusta. source_credit muodossa
   "Tekijä / Wikimedia Commons, Lisenssi", license_note "Lisenssi, https://commons…/File:…" ja valinnaisesti
   muokkaukset sulkeissa lopussa, esim. "(rajattu, kirkastettu)" – oletus "rajattu".
   Rivit, joilla on vielä yleinen merkintä ilman tekijää, jätetään pois. */
type KuvavisaLahde = { laji: string; tekija: string; lisenssi: string; lahde: string | null; muokkaus: string };

async function haeKuvavisaLahteet(tyyppi: "linnut" | "elaimet"): Promise<KuvavisaLahde[]> {
  const sb = getSupabase();
  const siteId = await getSiteId();
  if (!sb || !siteId) return [];
  const { data, error } = await sb
    .from("kuvavisas")
    .select("correct_option, source_credit, license_note")
    .eq("site_id", siteId)
    .eq("type", tyyppi)
    .eq("active", true)
    .order("correct_option");
  if (error) return [];
  return (data ?? []).flatMap((r) => {
    const m = (r.source_credit ?? "").match(/^(.+?) \/ Wikimedia Commons, (.+)$/);
    if (!m) return [];
    const lahde = (r.license_note ?? "").match(/https:\/\/commons\.wikimedia\.org\/wiki\/File:\S+/)?.[0] ?? null;
    const muokkaus = (r.license_note ?? "").match(/\(([^)]+)\)\s*$/)?.[1] ?? "rajattu";
    return [{ laji: r.correct_option, tekija: m[1], lisenssi: m[2], lahde, muokkaus }];
  });
}

function KuvavisaLahteet({ otsikko, avain, rivit }: { otsikko: string; avain: string; rivit: KuvavisaLahde[] }) {
  return (
    <>
      <h2 style={{ fontSize: 22, margin: "34px 0 14px" }}>{otsikko}</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 14 }}>
        {rivit.map((k) => (
          <li
            key={avain + "-" + k.laji}
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 14px" }}
          >
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
    </>
  );
}

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
