import { SIVUSTO_KUVAUS } from "@/lib/paaviesti";
import type { MetadataRoute } from "next";

/** PWA-manifest (brief osio 2) — pohja tulevalle Capacitor/appivaiheelle. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tietoniekka",
    short_name: "Tietoniekka",
    description: SIVUSTO_KUVAUS,
    start_url: "/",
    display: "standalone",
    background_color: "#0f1520",
    theme_color: "#0f1520",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
