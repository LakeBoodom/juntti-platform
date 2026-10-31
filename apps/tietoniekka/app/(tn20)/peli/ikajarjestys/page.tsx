// IKÄJÄRJESTYS → JÄRJESTÄ (osa C, 31.10.2026): Ikäjärjestys on nyt Järjestä-hubin pakkoja.
// Vanhat osoitteet ohjataan pysyvästi (308): ?category= tai ?henkilot= (jaetut linkit, henkilösivun nosto,
// etusivun banneri ?autostart=1) suoraan oikeaan pakkaan parametreineen, pelkkä /peli/ikajarjestys hubin Henkilöt-osioon.

import { permanentRedirect } from "next/navigation";
import { HUB_HREF, ikaPakkaKategoriasta } from "@/lib/jarjesta/hub";

export default async function IkajarjestysOhjaus({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const arvo = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  if (!arvo("category") && !arvo("henkilot")) permanentRedirect(`${HUB_HREF}#henkilot`);
  const pakka = ikaPakkaKategoriasta(arvo("category"));
  const q = new URLSearchParams();
  for (const k of ["henkilot", "tulos", "autostart"]) {
    const v = arvo(k);
    if (v) q.set(k, v);
  }
  const haku = q.toString();
  permanentRedirect(haku ? `${pakka.href}?${haku}` : pakka.href);
}
