// Tulosnäkymän "Seuraava visa" -kortin kuva (Tulosnäkymä ja jakaminen, vaihe B, 22.10.2026): sama kevyt korttikuva
// kuin kokoelmasivulla. Kysytään kokoelmien korttikuva-asetuksilta järjestyksessä; ensimmäinen, joka tunnistaa visan,
// voittaa. Muuten visan oma herokuva (quiz_cards.hero_image) kohdepisteineen, ja jos kuvaa ei ole, null → kuviopohja.
import type { Kokoelma } from "./tyypit";
import { TV } from "./tv";
import { ELOKUVAT } from "./elokuvat";
import { MUSIIKKI } from "./musiikki";
import { MATKAKOHTEET } from "./matkakohteet";
import { KULTTUURI } from "./kulttuuri";
import { URHEILU } from "./urheilu";
import { JAAKIEKKO } from "./jaakiekko";
import { JALKAPALLO } from "./jalkapallo";
import { TIEDE } from "./tiede";
import { HISTORIA } from "./historia";
import { KAUPUNGIT_KOKOELMA } from "./kaupungit";
import { LUONTO } from "./luonto";

const KONFIGIT: Kokoelma[] = [TV, ELOKUVAT, MUSIIKKI, MATKAKOHTEET, KULTTUURI, URHEILU, JAAKIEKKO, JALKAPALLO, TIEDE, HISTORIA, KAUPUNGIT_KOKOELMA, LUONTO];

export function visanKorttikuva(r: {
  slug: string | null;
  hero_image?: string | null;
  hero_focal_x?: number | string | null;
  hero_focal_y?: number | string | null;
}): { kuva: string | null; kuvaPos?: string } {
  if (r.slug) {
    for (const k of KONFIGIT) {
      const kuva = k.korttikuva?.(r.slug);
      if (kuva) return { kuva, kuvaPos: k.korttikuvaPos?.(r.slug) };
    }
  }
  if (!r.hero_image) return { kuva: null };
  return {
    kuva: r.hero_image,
    kuvaPos: r.hero_focal_x != null ? `${Math.round(Number(r.hero_focal_x) * 100)}% ${Math.round(Number(r.hero_focal_y ?? 0.5) * 100)}%` : undefined,
  };
}
