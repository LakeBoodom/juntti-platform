import { ImageResponse } from "next/og";

export const runtime = "edge";

const SIZE = { width: 1200, height: 630 };

// Kategoriakohtaiset aksenttivärit (sama paletti kuin kategoria-OG:ssä)
const ACCENT_BY_KAT: Record<string, string> = {
  urheilu: "#1e3a5f",
  maantieto: "#1a3a45",
  luonto: "#1f3d2e",
  historia: "#3d2418",
  "tv-sarjat": "#2d1b3d",
  elokuvat: "#3d1818",
  musiikki: "#3d1830",
  "ruoka-juoma": "#3d2818",
  "muoti-design": "#2d1f33",
};

/**
 * Dynaaminen OG-kuva yksittäiselle visalle.
 * Otsikko ja kategoria luetaan query-parametreista (generateMetadata välittää ne),
 * jolloin reitti ei tarvitse tietokantaa ja toimii edge-runtimessa.
 *   /peli/og?title=EPPU%20NORMAALI&kat=musiikki
 */
export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawTitle = searchParams.get("title") ?? "TIETOVISA";
  const title = rawTitle.length > 60 ? rawTitle.slice(0, 57) + "…" : rawTitle;
  const kat = searchParams.get("kat") ?? "";
  const accent = ACCENT_BY_KAT[kat] ?? "#0f1520";

  // Skaalaa fonttikokoa otsikon pituuden mukaan ettei pitkä nimi leikkaudu
  const titleSize = title.length > 34 ? 96 : title.length > 22 ? 124 : 156;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: `linear-gradient(135deg, ${accent} 0%, #0f1520 100%)`,
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#E8A320",
            letterSpacing: "4px",
            marginBottom: 24,
          }}
        >
          — TIETOVISA
        </div>
        <div
          style={{
            fontSize: titleSize,
            fontWeight: 900,
            color: "#E8A320",
            letterSpacing: "-2px",
            lineHeight: 0.98,
            display: "flex",
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 40,
            fontWeight: 600,
            color: "rgba(255,255,255,0.9)",
            display: "flex",
          }}
        >
          10 kysymystä — montako saat oikein?
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 80,
            fontSize: 36,
            fontWeight: 900,
            color: "white",
            letterSpacing: "1px",
            display: "flex",
          }}
        >
          <span style={{ color: "#E8A320" }}>TIETO</span>
          <span>NIEKKA</span>
        </div>
      </div>
    ),
    { ...SIZE },
  );
}
