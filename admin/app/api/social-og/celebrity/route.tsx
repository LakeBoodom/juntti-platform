import { ImageResponse } from "next/og";

export const runtime = "edge";

const SQUARE = { width: 1080, height: 1080 };
const PORTRAIT = { width: 1080, height: 1350 };

/**
 * Some-jaon kuva: "Päivän sankari -onnittelu".
 *   /api/social-og/celebrity?name=...&role=...&imageUrl=...&birthYear=...&isDeceased=0|1&size=square|portrait&templateImage=...
 */
export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") ?? "Julkkis";
  const role = searchParams.get("role") ?? "";
  const imageUrl = searchParams.get("imageUrl");
  const templateImage = searchParams.get("templateImage");
  const birthYear = searchParams.get("birthYear") ?? "";
  const isDeceased = searchParams.get("isDeceased") === "1";
  const sizeParam = searchParams.get("size") === "portrait" ? "portrait" : "square";
  const size = sizeParam === "portrait" ? PORTRAIT : SQUARE;

  const age = birthYear ? new Date().getFullYear() - Number(birthYear) : null;

  const backgroundImage = templateImage ?? imageUrl ?? null;
  const nameSize = name.length > 22 ? 64 : name.length > 14 ? 78 : 92;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          position: "relative",
          background: "#0f1520",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {backgroundImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={backgroundImage}
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
        {/* Tumma gradientti-overlay luettavuuden vuoksi (myös ilman kuvaa, tasainen navy) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            background: backgroundImage
              ? "linear-gradient(180deg, rgba(15,21,32,0.15) 0%, rgba(15,21,32,0.45) 45%, rgba(15,21,32,0.96) 100%)"
              : "linear-gradient(135deg, #1a2233 0%, #0f1520 100%)",
          }}
        />

        {/* Yläkulman badge */}
        <div
          style={{
            position: "absolute",
            top: 70,
            left: 90,
            display: "flex",
            alignItems: "center",
            background: "#E8A320",
            color: "#0f1520",
            fontSize: 30,
            fontWeight: 800,
            padding: "16px 30px",
            borderRadius: 999,
            letterSpacing: "1px",
          }}
        >
          {isDeceased
            ? `SYNTYNYT VUONNA ${birthYear || "?"}`
            : `🎂 TÄNÄÄN ${age ?? "?"} VUOTTA`}
        </div>

        {/* Alaosan teksti */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "0 90px 80px 90px",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: nameSize,
              fontWeight: 900,
              color: "white",
              lineHeight: 1.05,
              display: "flex",
            }}
          >
            {name}
          </div>
          {role && (
            <div
              style={{
                marginTop: 14,
                fontSize: 34,
                fontWeight: 500,
                color: "rgba(230,230,230,0.85)",
                display: "flex",
              }}
            >
              {role}
            </div>
          )}
          <div
            style={{
              marginTop: 28,
              fontSize: 32,
              fontWeight: 700,
              color: "#E8A320",
              display: "flex",
            }}
          >
            Tunne julkkis — pelaa Tietoniekassa
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
