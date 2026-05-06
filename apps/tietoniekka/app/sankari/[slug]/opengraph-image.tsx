import { ImageResponse } from "next/og";
import { getCelebrityBySlug } from "../../../lib/queries";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Tietoniekka — päivän sankari";

export default async function SankariOG({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cel = await getCelebrityBySlug(slug);
  const name = cel?.name ?? "Päivän sankari";
  const role = cel?.role ?? "Tietoniekka";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 0,
          background: "linear-gradient(135deg, #1a3a45 0%, #0f1520 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "80px",
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#E8A320",
              letterSpacing: "4px",
              marginBottom: 24,
              display: "flex",
            }}
          >
            — PÄIVÄN SANKARI
          </div>
          <div
            style={{
              fontSize: 116,
              fontWeight: 900,
              color: "white",
              letterSpacing: "-3px",
              lineHeight: 0.95,
              textTransform: "uppercase",
              display: "flex",
              flexWrap: "wrap",
              maxWidth: "100%",
            }}
          >
            {name}
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 44,
              fontWeight: 600,
              color: "#E8A320",
              display: "flex",
            }}
          >
            {role}
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 60,
              right: 80,
              fontSize: 32,
              fontWeight: 900,
              letterSpacing: "1px",
              display: "flex",
            }}
          >
            <span style={{ color: "#E8A320" }}>TIETO</span>
            <span>NIEKKA</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
