import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f1520",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <span
          style={{
            color: "#E8A320",
            fontSize: 130,
            fontWeight: 900,
            letterSpacing: "-4px",
            lineHeight: 1,
          }}
        >
          T
        </span>
      </div>
    ),
    { ...size },
  );
}
