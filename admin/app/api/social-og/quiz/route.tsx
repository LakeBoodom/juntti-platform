import { ImageResponse } from "next/og";

export const runtime = "edge";

const SQUARE = { width: 1080, height: 1080 };
const PORTRAIT = { width: 1080, height: 1350 };

// Sama paletti kuin apps/tietoniekka/app/peli/og/route.tsx — pidä synkassa.
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
 * Some-jaon kuva: "Päivän visa -teaseri".
 *   /api/social-og/quiz?title=...&category=musiikki&question=...&size=square|portrait&templateImage=...
 */
export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawTitle = searchParams.get("title") ?? "TIETOVISA";
  const title = rawTitle.length > 70 ? rawTitle.slice(0, 67) + "…" : rawTitle;
  const category = searchParams.get("category") ?? "";
  const question = searchParams.get("question") ?? "";
  const sizeParam = searchParams.get("size") === "portrait" ? "portrait" : "square";
  const templateImage = searchParams.get("templateImage");
  const size = sizeParam === "portrait" ? PORTRAIT : SQUARE;
  const accent = ACCENT_BY_KAT[category] ?? "#0f1520";

  const titleSize = title.length > 34 ? 88 : title.length > 22 ? 112 : 140;
  const padding = sizeParam === "portrait" ? "120px 90px" : "90px";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          padding,
          background: templateImage
            ? "#0f1520"
            : `linear-gradient(135deg, ${accent} 0%, #0f1520 100%)`,
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {templateImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={templateImage}
            alt=""
            width={size.width}
            height={size.height}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
        {templateImage && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              background: `linear-gradient(180deg, rgba(15,21,32,0.55) 0%, rgba(15,21,32,0.85) 100%)`,
            }}
          />
        )}

        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "#E8A320",
            letterSpacing: "4px",
            marginBottom: 20,
            display: "flex",
            zIndex: 1,
          }}
        >
          — PÄIVÄN VISA
        </div>
        <div
          style={{
            fontSize: titleSize,
            fontWeight: 900,
            color: "#E8A320",
            letterSpacing: "-2px",
            lineHeight: 1.0,
            display: "flex",
            zIndex: 1,
          }}
        >
          {(category || title).toUpperCase()}
        </div>
        {question ? (
          <div
            style={{
              marginTop: 32,
              fontSize: 38,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.25,
              display: "flex",
              zIndex: 1,
              maxWidth: "92%",
            }}
          >
            {question.length > 140 ? question.slice(0, 137) + "…" : question}
          </div>
        ) : (
          <div
            style={{
              marginTop: 32,
              fontSize: 42,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.2,
              display: "flex",
              zIndex: 1,
              maxWidth: "92%",
            }}
          >
            {title}
          </div>
        )}

        <div
          style={{
            position: "absolute",
            bottom: 70,
            left: sizeParam === "portrait" ? 90 : 90,
            fontSize: 34,
            fontWeight: 700,
            color: "white",
            display: "flex",
            zIndex: 1,
          }}
        >
          Pelaa → tietoniekka.fi
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 70,
            right: 90,
            fontSize: 32,
            fontWeight: 900,
            color: "white",
            letterSpacing: "1px",
            display: "flex",
            zIndex: 1,
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
