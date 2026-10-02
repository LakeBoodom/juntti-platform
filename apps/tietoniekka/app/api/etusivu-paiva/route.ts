// SEO-erä A4 (2.10.2026): etusivu on ISR 300 s, mutta Päivän visa ja Päivän sankari vaihtuvat
// keskiyöllä. Jos selain saa keskiyön jälkeen eilisen välimuistiversion, PaivaVahti kutsuu tätä:
// palvelin mitätöi etusivun välimuistin, ja selain lataa sivun kerran uudelleen.
// Väärinkäytön esto: mitätöinti vain kun pyydetty päivä on todella vanhentunut, ja vain
// ensimmäisen tunnin aikana Helsingin keskiyön jälkeen.
import { revalidatePath } from "next/cache";
import { helsinginPaiva } from "@/lib/aika";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { pvm } = (await req.json().catch(() => ({}))) as { pvm?: string };
  const nyt = helsinginPaiva();
  const tunti = Number(new Intl.DateTimeFormat("fi-FI", { hour: "numeric", hour12: false, timeZone: "Europe/Helsinki" }).format(new Date()));
  if (typeof pvm === "string" && /^\d{4}-\d{2}-\d{2}$/.test(pvm) && pvm < nyt.iso && tunti < 1) {
    revalidatePath("/");
    return new Response(null, { status: 204 });
  }
  return new Response(null, { status: 202 });
}
