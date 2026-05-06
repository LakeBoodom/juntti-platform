import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-xl, 40px)",
        textAlign: "center",
        background: "var(--color-surface-dark, #0f1520)",
      }}
    >
      <div style={{ maxWidth: 600 }}>
        <div
          style={{
            fontFamily: "var(--font-display, system-ui)",
            fontWeight: 900,
            fontSize: "clamp(96px, 22vw, 200px)",
            color: "var(--color-brand-gold, #E8A320)",
            lineHeight: 0.9,
            letterSpacing: "-0.02em",
          }}
        >
          404
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display, system-ui)",
            fontWeight: 800,
            fontSize: "clamp(28px, 5vw, 44px)",
            color: "white",
            marginTop: 16,
            textTransform: "uppercase",
            letterSpacing: "-0.01em",
          }}
        >
          Tämä visa on hukassa
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body, system-ui)",
            fontSize: 18,
            color: "rgba(255,255,255,0.7)",
            marginTop: 12,
            lineHeight: 1.5,
          }}
        >
          Etsitty sivu on joko poistunut tai sitä ei ole koskaan ollutkaan.
          Veikko ei tähän osaa vastata.
        </p>
        <Link
          href="/"
          className="btn btn-primary btn-large"
          style={{
            display: "inline-block",
            marginTop: 32,
          }}
        >
          ← TAKAISIN ETUSIVULLE
        </Link>
      </div>
    </main>
  );
}
