import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 12,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <span
          style={{
            color: "#E8A320",
            fontSize: 48,
            fontWeight: 900,
            letterSpacing: "-2px",
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
