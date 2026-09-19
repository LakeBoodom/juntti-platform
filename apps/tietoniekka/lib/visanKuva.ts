// VISAN OMA KUVA — yksi dispatcher visakohtaiselle kuvalle.
//
// 19.9.2026: etusivun Päivän visa -kortilla ja pelisivun herolla oli kummallakin
// oma, erilainen lista kokoelmista. Pelisivu kattoi vain kulttuurin, luonnon,
// urheilun (osittain) ja maantiedon, joten TV-, musiikki-, elokuva-,
// jalkapallo-, jääkiekko-, laji- ja kaupunkivisojen omat kuvat eivät näkyneet
// herossa, vaikka ne ovat palvelimella. Heikin linjaus: hero aktivoituu aina,
// kun visalla on oma kuvansa.
//
// Palauttaa VAIN visan oman kuvan (tiedosto nimetty visan slugin tai kaupungin
// mukaan). Kokoelman yleistä herokuvaa ei koskaan palauteta — se oli virhe,
// jossa golfvisa sai tennisvisan kuvan.

import { kulttuuriImg } from "@/lib/kulttuuri";
import { luontoImg } from "@/lib/luonto";
import { urheiluImg } from "@/lib/urheilu";
import { maantietoImg } from "@/lib/maantieto";
import { tvImg } from "@/lib/tv";
import { musiikkiImg } from "@/lib/musiikki";
import { elokuvatImg } from "@/lib/elokuvat";
import { jalkapalloQuizImg } from "@/lib/jalkapallo";
import { jaakiekkoQuizImg } from "@/lib/jaakiekko";
import { urheilulajitQuizImg } from "@/lib/urheilulajit";
import { KAUPUNGIT, kaupunkiImg } from "@/lib/kaupungit";

export function visanOmaKuva(
  collection: string | null | undefined,
  category: string | null | undefined,
  slug: string | null | undefined,
): string | null {
  if (!slug) return null;
  if (category === "kaupungit") {
    const k = KAUPUNGIT.find((c) => c.quizSlug === slug);
    return k ? kaupunkiImg(k.id) : null;
  }
  switch (collection) {
    case "kulttuuri": return kulttuuriImg(slug);
    case "luonto": return luontoImg(slug);
    case "urheilu": return urheiluImg(slug) ?? jalkapalloQuizImg(slug) ?? jaakiekkoQuizImg(slug) ?? urheilulajitQuizImg(slug);
    case "matkakohteet": return maantietoImg(slug);
    case "tv": return tvImg(slug);
    case "musiikki": return musiikkiImg(slug);
    case "elokuvat": return elokuvatImg(slug);
    default: return null;
  }
}
