// TIETONIEKKA 2.0 — 404 omassa layoutissa (QA-007, 29.8.2026).
// Pelisivun virhetilat (visaa ei löydy, ei kysymyksiä, tuntematon kortisto/
// mega) ja poistetut kokoelmasivut kutsuvat notFound() → tämä näkymä
// ylätunnisteen ja alatunnisteen välissä. Root-tason not-found linkkaa
// 1.0-etusivulle, tämä 2.0:n omiin polkuihin.
export default function NotFound20() {
  return (
    <main
      className="tn-shell"
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        paddingTop: "clamp(48px, 8cqw, 120px)",
        paddingBottom: "clamp(48px, 8cqw, 120px)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          fontFamily: "var(--tn-font-display)",
          fontWeight: 900,
          fontSize: "clamp(88px, 18cqw, 180px)",
          lineHeight: 0.9,
          letterSpacing: "-0.02em",
          color: "var(--tn-gold, #E8A320)",
        }}
      >
        404
      </div>
      <h1
        style={{
          margin: "18px 0 0",
          fontFamily: "var(--tn-font-display)",
          fontWeight: 900,
          fontSize: "clamp(24px, 3.2cqw, 40px)",
          lineHeight: 1.05,
          textTransform: "uppercase",
          letterSpacing: "-0.01em",
          color: "#F5F0E6",
          overflowWrap: "normal",
          wordBreak: "keep-all",
        }}
      >
        Tämä visa on hukassa
      </h1>
      <p style={{ margin: "14px 0 0", maxWidth: "44ch", fontSize: "clamp(14px, 1.3cqw, 17px)", lineHeight: 1.5, color: "#B9AF9B" }}>
        Etsimääsi visaa tai sivua ei löytynyt — se on ehkä poistettu tai osoite on vanhentunut.
        Laura ja Mikko eivät tähän osaa vastata, mutta kokoelmista löydät varmasti uuden.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 26 }}>
        <a href="/kokoelmat" style={{ minHeight: 48, padding: "0 22px", borderRadius: 999, background: "var(--tn-lime, #B6FF3C)", color: "#0F0D07", fontWeight: 900, textTransform: "uppercase", display: "inline-flex", alignItems: "center" }}>
          Selaa kokoelmia →
        </a>
        <a href="/" style={{ minHeight: 48, padding: "0 22px", borderRadius: 999, border: "1px solid #3A3122", color: "#F5F0E6", fontWeight: 700, display: "inline-flex", alignItems: "center" }}>
          Etusivulle
        </a>
      </div>
    </main>
  );
}
