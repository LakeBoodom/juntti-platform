// AI-avusteinen some-copy some-postauksiin (FB/IG/LinkedIn).
// Sävy on lukittu brändipäätös — ks. system-prompti alla. Ei geneeristä markkinointikieltä.

import { getAnthropic, MODEL } from "./client";

export type SocialCopyInput =
  | {
      sourceType: "quiz";
      title: string;
      category: string;
      exampleQuestion?: string;
    }
  | {
      sourceType: "celebrity";
      name: string;
      role: string;
      bioShort?: string;
      isDeceased: boolean;
    }
  | {
      sourceType: "countdown";
      name: string;
      emoji?: string;
    }
  | {
      sourceType: "general";
      brief: string;
    };

export type GeneratedSocialCopy = {
  copyText: string;
};

const SYSTEM_PROMPT = `Olet Tietoniekka.fi-tietovisasivuston somekirjoittaja. Kirjoitat lyhyitä Facebook/Instagram-postaustekstejä suomeksi.

**Äänensävy (noudata TARKASTI):**
- Kuiva, hieman ironinen huumori — ei koskaan ylitsepursuavaa innostusta.
- "Naapurihaaste"-kehys: vertaa naapuriin, kavereihin tai koko kansaan. Esim. "Naapurisi sai 4/5 — kyllä kai sinä hänet voitat?"
- Puhuttele lukijaa aina epämuodollisesti ("sinä", "sun") — ei koskaan "te"-muotoa.
- Lyhyt: 1–2 lausetta. Ei koskaan enempää kuin 3 lyhyttä lausetta.
- Aloita haasteella, väitteellä tai kysymyksellä — ei tervehdyksellä ("Hei!", "Tsemppiä!") eikä ilmoitusluontoisella toteamuksella.
- Ei hashtageja, ei emoji-tulvaa (korkeintaan yksi jos se todella sopii).
- Vältä täysin näitä geneerisiä fraaseja ja niiden kaltaisia: "Testaa tietosi tänään!", "Pelaa nyt!", "Mahtavaa että pelaat!", "Heitä noppaa ja voita!", "Tervetuloa mukaan!".
- CTA (jos tarvitaan) on iskevä käskymuoto, esim. "OTETAAN SELVÄÄ", "PISTÄ TULEEN" — ei koskaan "Aloita visa" tms. toimistokieltä.

**Hyviä esimerkkejä sävystä:**
- "Naapurisi sai 4/5 — kyllä kai sinä hänet voitat?"
- "Tuntuuko, että tänään kulkee?"
- "Kyllä kansa tietää, sanoi Veikko aikanaan. Olikohan oikeassa?"

**Huonoja esimerkkejä (ÄLÄ KIRJOITA NÄIN):**
- "Mahtavaa että pelaat!"
- "HEITÄ NOPPAA NYT JA VOITA!"
- "Testaa tietosi tänään!"

Kirjoitat aina suomeksi. Teksti sopii sellaisenaan sekä Facebookiin että Instagramiin — ei alusta-spesifejä viittauksia. Palauta vastaus AINOASTAAN annetulla työkalulla (tool use), ei muuta tekstiä.`;

function buildUserPrompt(input: SocialCopyInput): string {
  switch (input.sourceType) {
    case "quiz": {
      const q = input.exampleQuestion
        ? `\nEsimerkkikysymys visasta: "${input.exampleQuestion}"`
        : "";
      return `Kirjoita some-postaus päivän visasta.
Visan otsikko: ${input.title}
Kategoria: ${input.category}${q}

Kirjoita 1–2 lauseen naapurihaaste-tyylinen postausteksti, joka houkuttelee pelaamaan tämän päivän visan. Älä toista otsikkoa sanasta sanaan, viittaa aiheeseen omin sanoin.`;
    }
    case "celebrity": {
      const bio = input.bioShort ? `\nLyhyt kuvaus: ${input.bioShort}` : "";
      const deceasedNote = input.isDeceased
        ? "\nHuom: henkilö on kuollut — älä puhu iästä tai onnittele syntymäpäivästä elävänä, vaan viittaa syntymäpäivään historiallisena merkkipäivänä."
        : "\nHenkilö on elossa ja tänään hänen syntymäpäivänsä.";
      return `Kirjoita some-postaus päivän synttärisankarista.
Nimi: ${input.name}
Rooli/ammatti: ${input.role}${bio}${deceasedNote}

Kirjoita 1–2 lauseen postausteksti, joka herättää kiinnostuksen pelaamaan tähän henkilöön liittyvää tietovisaa Tietoniekassa. Naapurihaaste-sävy tai kysymysmuoto sopii hyvin.`;
    }
    case "countdown": {
      const emoji = input.emoji ? ` (${input.emoji})` : "";
      return `Kirjoita some-postaus ajankohtaisesta teemasta/tapahtumasta: ${input.name}${emoji}.

Kirjoita 1–2 lauseen postausteksti, joka houkuttelee pelaamaan tähän teemaan liittyvän tietovisan Tietoniekassa.`;
    }
    case "general": {
      return `Heikki (sivuston perustaja) kirjoitti tämän raakamuistiinpanon some-postausta varten:
"${input.brief}"

Muotoile tästä 1–2 lauseen postausteksti Tietoniekka-brändin äänensävyllä. Säilytä muistiinpanon ydinajatus, mutta kirjoita se uudelleen brändin tyyliin.`;
    }
  }
}

const socialCopyToolSchema = {
  name: "submit_social_copy",
  description:
    "Palauttaa valmiin some-postaustekstin. Kutsu tätä kun teksti on valmis.",
  input_schema: {
    type: "object" as const,
    required: ["copy_text"],
    properties: {
      copy_text: {
        type: "string",
        description:
          "1-3 lyhyttä lausetta suomeksi, Tietoniekan brändiäänellä. Ei hashtageja.",
      },
    },
  },
};

export async function generateSocialCopy(
  input: SocialCopyInput,
): Promise<GeneratedSocialCopy> {
  const anthropic = getAnthropic();

  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: [socialCopyToolSchema as any],
    tool_choice: { type: "tool", name: "submit_social_copy" },
    messages: [{ role: "user", content: buildUserPrompt(input) }],
  });

  const toolUse = resp.content.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (b: any) => b.type === "tool_use",
  ) as { type: "tool_use"; name: string; input: { copy_text?: string } } | undefined;

  if (!toolUse) {
    throw new Error(
      "Claude ei palauttanut tool_use-vastausta some-copylle — tarkista prompti/malli",
    );
  }

  const copyText =
    typeof toolUse.input?.copy_text === "string" && toolUse.input.copy_text.trim()
      ? toolUse.input.copy_text.trim()
      : "";

  if (!copyText) {
    throw new Error("Claude palautti tyhjän some-copyn. Yritä uudelleen.");
  }

  return { copyText };
}
