import { brand } from "@/config/brand";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "#0b0b0f",
        color: "#f5f5f5",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", margin: 0 }}>
        {brand.name}
      </h1>
      <p style={{ maxWidth: "40rem", opacity: 0.75, marginTop: "1rem" }}>
        Rakennetaan parhaillaan. Palaa kohta.
      </p>
      <p style={{ fontSize: "0.75rem", opacity: 0.4, marginTop: "3rem" }}>
        {brand.key} · v0.1
      </p>
    </main>
  );
}
