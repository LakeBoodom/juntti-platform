import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Tietoniekka — testaa tietosi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          background:
            "linear-gradient(135deg, #0f1520 0%, #14202f 70%, #0f1520 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span
            style={{
              fontSize: 160,
              fontWeight: 900,
              color: "#E8A320",
              letterSpacing: "-3px",
              lineHeight: 1,
            }}
          >
            TIETO
          </span>
          <span
            style={{
              fontSize: 160,
              fontWeight: 900,
              color: "white",
              letterSpacing: "-3px",
              lineHeight: 1,
            }}
          >
            NIEKKA
          </span>
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 52,
            fontWeight: 700,
            color: "rgba(255,255,255,0.92)",
          }}
        >
          Päivittäin vaihtuva visa.
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 40,
            fontWeight: 600,
            color: "#E8A320",
          }}
        >
          Julkkisten synttärit. Aina ilmainen.
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 80,
            fontSize: 26,
            fontWeight: 700,
            color: "rgba(255,255,255,0.55)",
            letterSpacing: "2px",
          }}
        >
          tietoniekka.fi
        </div>
      </div>
    ),
    { ...size },
  );
}
