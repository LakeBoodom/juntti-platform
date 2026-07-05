import { ImageResponse } from "next/og";

export const runtime = "edge";

const SQUARE = { width: 1080, height: 1080 };
const PORTRAIT = { width: 1080, height: 1350 };

/**
 * Some-jaon kuva countdown- ja yleisille (general) postauksille.
 * Sama layout-runko kuin quiz-teaserissa, mutta label/headline parametrisoitu
 * — ei erillistä kolmatta pohjaa spec:in mukaisesti.
 *   /api/social-og/generic?label=...&headline=...&size=square|portrait&templateImage=...
 */
export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const label = (searchParams.get("label") ?? "TIETONIEKKA").toUpperCase();
  const rawHeadline = searchParams.get("headline") ?? "Tietoniekka.fi";
  const headline = rawHeadline.length > 140 ? rawHeadline.slice(0, 137) + "…" : rawHeadline;
  const templateImage = searchParams.get("templateImage");
  const sizeParam = searchParams.get("size") === "portrait" ? "portrait" : "square";
  const size = sizeParam === "portrait" ? PORTRAIT : SQUARE;
  const padding = sizeParam === "portrait" ? "120px 90px" : "90px";

  const headlineSize = headline.length > 60 ? 60 : headline.length > 34 ? 84 : 112;

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
          background: templateImage ? "#0f1520" : "linear-gradient(135deg, #1a2233 0%, #0f1520 100%)",
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
              background: "linear-gradient(180deg, rgba(15,21,32,0.55) 0%, rgba(15,21,32,0.85) 100%)",
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
          — {label}
        </div>
        <div
          style={{
            fontSize: headlineSize,
            fontWeight: 900,
            color: "white",
            letterSpacing: "-1px",
            lineHeight: 1.1,
            display: "flex",
            zIndex: 1,
            maxWidth: "94%",
          }}
        >
          {headline}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 70,
            left: 90,
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
