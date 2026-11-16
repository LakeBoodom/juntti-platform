// Sivuston haku (Heikki 16.11.2026): hakuindeksi selaimelle JSONina. Staattinen reitti, joka päivittyy tunnin välein
// (ISR), joten haku ei kuormita palvelinta: selain hakee listan kerran, kun haku avataan, ja hakee siitä itse.
import { haeHakuindeksi } from "@/lib/haku";

export const revalidate = 3600;

export async function GET() {
  const kohteet = await haeHakuindeksi();
  return Response.json(kohteet, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400", "X-Robots-Tag": "noindex" },
  });
}
