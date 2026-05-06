"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("Tietoniekka error:", error);
  }, [error]);

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
            fontSize: "clamp(72px, 16vw, 140px)",
            color: "var(--color-brand-gold, #E8A320)",
            lineHeight: 0.9,
            letterSpacing: "-0.02em",
          }}
        >
          Hupsis.
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display, system-ui)",
            fontWeight: 800,
            fontSize: "clamp(24px, 4vw, 36px)",
            color: "white",
            marginTop: 16,
            textTransform: "uppercase",
            letterSpacing: "-0.01em",
          }}
        >
          Visa kompastui kynnykseen
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body, system-ui)",
            fontSize: 17,
            color: "rgba(255,255,255,0.7)",
            marginTop: 12,
            lineHeight: 1.5,
          }}
        >
          Jokin meni vikaan. Yritä uudelleen, tai mene takaisin etusivulle.
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 32,
          }}
        >
          <button
            onClick={() => reset()}
            className="btn btn-primary btn-large"
            type="button"
          >
            YRITÄ UUDELLEEN
          </button>
          <Link
            href="/"
            className="btn btn-secondary btn-large"
            style={{ display: "inline-block" }}
          >
            ← ETUSIVULLE
          </Link>
        </div>
      </div>
    </main>
  );
}
