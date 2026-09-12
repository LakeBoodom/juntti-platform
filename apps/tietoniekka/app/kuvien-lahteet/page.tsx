import type { Metadata } from "next";
import Link from "next/link";
import { KUVALAHTEET, commonsUrl, type Kuvalahde } from "@/lib/kuvalahteet";

export const metadata: Metadata = {
  title: "Kuvien lähteet",
  description:
    "Tietoniekassa käytettyjen vapaasti lisensoitujen valokuvien tekijät, lisenssit ja lähteet.",
  robots: { index: true, follow: true },
};

const PAIVITETTY = "12.9.2026";

export default function KuvienLahteetPage() {
  const musiikki = KUVALAHTEET.filter((k) => k.kokoelma === "musiikki");
  const kaupungit = KUVALAHTEET.filter((k) => k.kokoelma === "kaupungit");

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
          </a>
          . Jokaisen kuvan lisenssi on tarkistettu kuvan omalta Commons-sivulta. Kuvia on rajattu
          korttimittaan (640×360) ja skaalattu; muuta muokkausta ei ole tehty. CC BY-SA -lisensoitujen
          kuvien rajatut versiot ovat saatavilla samalla lisenssillä kuin alkuperäiset.
        </p>

        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, margin: "0 0 28px" }}>
          Muut sivuston kuvat ovat Tietoniekan omia kuvituksia. Sivu päivitetty {PAIVITETTY}.
        </p>

        <h2 style={{ fontSize: 22, margin: "0 0 14px" }}>Musiikki-kokoelma</h2>
        <Lista rivit={musiikki} />

        <h2 style={{ fontSize: 22, margin: "34px 0 14px" }}>Kaupungit-kokoelma</h2>
        <Lista rivit={kaupungit} />

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
          key={k.kokoelma + "-" + k.slug}
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
            <a href={commonsUrl(k.tiedosto)} target="_blank" rel="noopener noreferrer" style={linkki}>
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
            {k.vuosi ? ` · ${k.vuosi}` : ""} · rajattu
          </div>
        </li>
      ))}
    </ul>
  );
}

const linkki: React.CSSProperties = { color: "#C68BFF", textDecoration: "underline" };
