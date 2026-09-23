// Instagram-kuvatekstit (oletus; toimitus voi muokata adminissa) ja V-B:n haasteluonnos.
//
// Kuvatekstissä linkit eivät ole klikattavia, joten ohjataan bioon. Ei emojeja
// eikä hashtag-tulvaa: muutama tunniste riittää ja pysyy samana, jotta A/B-testin
// ainoa muuttuja on kuva.

import { getAnthropic, MODEL } from "@juntti/ai";
import { getSupabaseAdmin } from "@juntti/db";
import type { SynttariData, VisaData } from "./data";
import type { Kentat, Pohja } from "./pohjat";

const KOKOELMA_TAGI: Record<string, string> = {
  Urheilu: "#urheilu",
  Jääkiekko: "#jääkiekko",
  Luonto: "#luonto",
  "Tiede & teknologia": "#tiede",
  Maantieto: "#maantieto",
  "TV & suoratoisto": "#tvsarjat",
  Musiikki: "#musiikki",
  Elokuvat: "#elokuvat",
  "Tunnetut henkilöt": "#julkkikset",
  Historia: "#historia",
  Kulttuuri: "#kulttuuri",
  "Suomen kaupungit": "#suomi",
};

const PERUSTAGIT = "#tietoniekka #tietovisa";

const piste = (s: string) => (/[.!?…]$/.test(s) ? s : `${s}.`);

export function visaKuvateksti(v: VisaData): string {
  const rivit: string[] = [];
  if (v.introOtsikko) rivit.push(piste(v.introOtsikko));
  if (v.introTeksti) rivit.push(v.introTeksti);
  if (!v.introOtsikko && !v.introTeksti) rivit.push(`Päivän visa: ${v.nimi}.`);
  rivit.push("");
  rivit.push(`Pelaa päivän visa — linkki biossa. ${v.kysymyksia} kysymystä, ei kirjautumista.`);
  rivit.push("");
  rivit.push([PERUSTAGIT, "#päivänvisa", KOKOELMA_TAGI[v.kokoelma]].filter(Boolean).join(" "));
  return rivit.join("\n");
}

export function synttariKuvateksti(s: SynttariData, pohja: Pohja, k: Kentat): string {
  const rivit: string[] = [];
  if (s.muisto) {
    const vuodet = s.syntymavuosi && s.kuolinvuosi ? ` (${s.syntymavuosi}–${s.kuolinvuosi})` : "";
    rivit.push(`${s.nimi}${vuodet} olisi täyttänyt tänään ${s.ika} vuotta.`);
  } else {
    rivit.push(`${s.nimi} täyttää tänään ${s.ika} vuotta. Onnea!`);
  }
  rivit.push("");
  rivit.push("Kuinka hyvin tunnet hänet? Testaa tietosi — linkki biossa.");
  // CC BY-SA -kuvat vaativat kuvaajan ja lisenssin: vain kun kuvassa on henkilökuva.
  if (pohja === "S-A" && k.kuvaaja?.trim()) {
    rivit.push("");
    rivit.push(`Kuva: ${k.kuvaaja.trim()}`);
  }
  rivit.push("");
  rivit.push(`${PERUSTAGIT} #päivänsynttärit`);
  return rivit.join("\n");
}

/**
 * V-B:n haaste tekoälyllä. Designin sääntö: faktaväitteetön haaste — ei väitettä,
 * jota aineistossa ei ole, eikä vihjettä vastauksiin. Toimitus hyväksyy aina.
 */
export async function luonnosteleHaaste(v: VisaData): Promise<string | null> {
  const { data } = await getSupabaseAdmin()
    .from("questions")
    .select("question_text")
    .eq("quiz_id", v.quizId)
    .limit(4);
  const kysymykset = ((data ?? []) as unknown as Array<{ question_text: string }>).map((q) => `- ${q.question_text}`).join("\n");

  const ohje = `Kirjoitat Tietoniekka.fi:n Instagram-julkaisuun yhden lyhyen HAASTEEN suomeksi.
Haaste kutsuu lukijan vastaamaan kommentteihin ennen kuin hän pelaa visan.

Säännöt:
- Enintään 60 merkkiä. Yksi lause, päättyy kysymys- tai huutomerkkiin tai pisteeseen.
- Ei faktaväitteitä, lukuja tai nimiä, joita alla ei mainita. Ei vihjeitä vastauksiin.
- Puhuttele lukijaa (sinä-muoto). Leikkisä mutta ei imelä. Ei emojeja eikä hashtageja.
- Esimerkkejä tyylistä: "Montako suomalaista F1-kuljettajaa muistat ulkoa?",
  "Väitätkö tosifaniksi? Todista se."

Visa: ${v.nimi} (${v.kokoelma})
${v.introOtsikko ? `Päivän tapahtuma: ${v.introOtsikko}` : ""}
Esimerkkikysymyksiä visasta (älä paljasta näiden vastauksia):
${kysymykset || "- (ei saatavilla)"}

Vastaa pelkällä haasteella, ilman lainausmerkkejä.`;

  try {
    const r = await getAnthropic().messages.create({
      model: MODEL,
      max_tokens: 120,
      messages: [{ role: "user", content: ohje }],
    });
    const teksti = r.content
      .filter((c) => c.type === "text")
      .map((c) => (c as { text: string }).text)
      .join("")
      .trim()
      .replace(/^["“”']+|["“”']+$/g, "");
    return teksti && teksti.length <= 80 ? teksti : null;
  } catch {
    return null;
  }
}
