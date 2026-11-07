// LYHYT KAUPUNKIOSOITE /<slug> → /kaupunki/<slug> (brief 7.11.2026 §4). Pysyvä ohjaus (308, hakukoneille sama kuin 301)
// vain kaupungeille, joiden sivu on julkaistu; muut yksiosaiset osoitteet → 404 kuten ennen.
// Reittijärjestys: Next valitsee kiinteät reitit (/visa, /peli, /henkilot, /kaupunki, /h/<koodi> …) aina ennen tätä
// dynaamista segmenttiä, joten kaupunki-slug ei voi ohittaa sivuston omaa reittiä. Kysely ohitetaan, jos polku ei
// näytä kaupunki-slugilta (favicon.ico, .php-skannaukset). Kysely- ja jakoparametrit (?j=) siirtyvät mukana.
import { notFound, permanentRedirect } from "next/navigation";
import { lyhyenOsoitteenKohde } from "@/lib/kaupunkisivu";

type Props = {
  params: Promise<{ lyhyt: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LyhytOsoite({ params, searchParams }: Props) {
  const { lyhyt } = await params;
  const kohde = await lyhyenOsoitteenKohde(decodeURIComponent(lyhyt).toLowerCase());
  if (!kohde) notFound();
  const sp = await searchParams;
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (typeof v === "string") q.set(k, v);
  permanentRedirect(q.size ? `${kohde}?${q}` : kohde);
}
