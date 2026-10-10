// LASTEN VISOJEN IKÄMERKKI muualla sivustolla (brief §7, design-päätökset 9.10.2026): 🧸 4–7 / 🚀 8–12.
// Tummalla pinnalla cream-pilleri, lasten pinnoilla navy + kulta. Sama muoto ja emoji kaikkialla.
// Ei renderöi mitään aikuisten visoille (target_age muu kuin 4-7 / 8-12).
import { IKA_LYHYT } from "@/lib/lapset/juontajat";

export function IkaMerkki({ ika, pinta = "tumma", kulma = false }: { ika: string | null | undefined; pinta?: "tumma" | "lapset"; kulma?: boolean }) {
  if (ika !== "4-7" && ika !== "8-12") return null;
  return (
    <span className={kulma ? "tn-ikamerkki tn-ikamerkki--kulma" : "tn-ikamerkki"} data-pinta={pinta} data-ika={ika} title={ika === "4-7" ? "Lasten visa: pienet 4–7" : "Lasten visa: isommat 8–12"}>
      {IKA_LYHYT[ika]}
    </span>
  );
}
