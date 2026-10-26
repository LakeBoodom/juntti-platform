// SEO-erä A4 (2.10.2026): etusivu on ISR 300 s, mutta Päivän visa ja Päivän sankari vaihtuvat
// keskiyöllä. Jos selain saa keskiyön jälkeen eilisen välimuistiversion, PaivaVahti kutsuu tätä:
// palvelin mitätöi etusivun välimuistin, ja selain lataa sivun kerran uudelleen.
// Väärinkäytön esto: mitätöinti vain kun pyydetty päivä on todella vanhentunut (sivun päivä < Helsingin tänään).
// C11 (26.10.2026): tunnin aikaraja poistettu — jos ensimmäinen kävijä tuli vasta aamulla, eilinen sivu jäi
// voimaan ("Tänään 25.10." näkyi 26.10.). Tuore sivu kantaa tämän päivän, joten pyyntö ei toistu.
import { revalidatePath } from "next/cache";
import { helsinginPaiva } from "@/lib/aika";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { pvm } = (await req.json().catch(() => ({}))) as { pvm?: string };
  const nyt = helsinginPaiva();
  if (typeof pvm === "string" && /^\d{4}-\d{2}-\d{2}$/.test(pvm) && pvm < nyt.iso) {
    revalidatePath("/");
    return new Response(null, { status: 204 });
  }
  return new Response(null, { status: 202 });
}
