import { ImageResponse } from "next/og";
import { CATEGORY_BY_SLUG } from "../../../lib/categories";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Tietoniekka — kategoria";

export default async function CategoryOG({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = CATEGORY_BY_SLUG[slug];
  const title = cat?.title ?? "TIETOVISA";
  const desc = cat?.description ?? "Pelaa Tietoniekkaa";

  const colorMap: Record<string, string> = {
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
  const accent = colorMap[slug] ?? "#0f1520";

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
          — KATEGORIA
        </div>
        <div
          style={{
            fontSize: 168,
            fontWeight: 900,
            color: "#E8A320",
            letterSpacing: "-3px",
            lineHeight: 0.95,
            display: "flex",
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 44,
            fontWeight: 600,
            color: "rgba(255,255,255,0.9)",
            display: "flex",
          }}
        >
          {desc}
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
    { ...size },
  );
}
