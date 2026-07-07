// AI-avusteinen some-copy some-postauksiin (FB/IG/LinkedIn).
//
// Äänensävy on lukittu brändipäätös (näkyy jo etusivun hero-tekstissä:
// "Naapurisi sai 7/10 — kyllä kai sinä hänet voitat?") — noudata sitä KAIKISSA
// tyyleissä alla, ei vain naapuri_hookissa.
//
// Neljä koukkumekanismia (2026-07-07 päätös): naapurihaaste ei yksin riitä
// pysäyttämään scrollausta feedissä joka kerta, joten rinnalle tuli kolme
// muuta. Kaikki tuotetaan saman kutsun kautta, Heikki valitsee/editoi
// parhaan admin-puolella (kalenteri + somepostaukset).

import { getAnthropic, MODEL } from "./client";
import type { Answer } from "./types";

export type SocialCopyStat = {
  totalPlays: number;
  allCorrectPct: number; // 0-100, rounded — vain oikeasta datasta, EI koskaan keksitty
};

export type SocialCopyStyle =
  | "naapuri_hook"
  | "stat_hook"
  | "question_reveal"
  | "challenge_hook";

export type SocialCopyVariant = {
  style: SocialCopyStyle;
  text: string;
};

export type SocialCopyInput =
  | {
      sourceType: "quiz";
      title: string;
      category: string;
      // Koko kysymyssetti mahdollistaa question_reveal-tyylin (malli valitsee
      // kiinnostavimman). Pelkkä exampleQuestion riittää muille tyyleille.
      questions?: { question_text: string; answers: Answer[] }[];
      exampleQuestion?: string;
      // Vain jos oikeaa pelidataa on tarpeeksi (≥20 pelikertaa) — muuten ei
      // stat_hookia lainkaan, ei koskaan keksitty prosenttiluku.
      stat?: SocialCopyStat;
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
  variants: SocialCopyVariant[];
};

const VOICE_RULES = `**Äänensävy (noudata TARKASTI kaikissa neljässä tyylissä alla):**
- Kuiva, hieman ironinen huumori — ei koskaan ylitsepursuavaa innostusta.
- Puhuttele lukijaa aina epämuodollisesti ("sinä", "sun") — ei koskaan "te"-muotoa.
- Aloita heti koukulla — ei tervehdyksellä ("Hei!", "Tsemppiä!") eikä ilmoitusluontoisella toteamuksella.
- Ei hashtageja, ei emoji-tulvaa (korkeintaan yksi jos se todella sopii).
- Vältä täysin näitä geneerisiä fraaseja ja niiden kaltaisia: "Testaa tietosi tänään!", "Pelaa nyt!", "Mahtavaa että pelaat!", "Heitä noppaa ja voita!", "Tervetuloa mukaan!".
- CTA (jos tarvitaan) on iskevä käskymuoto, esim. "OTETAAN SELVÄÄ", "PISTÄ TULEEN" — ei koskaan "Aloita visa" tms. toimistokieltä.
- Korkeintaan 300 merkkiä per versio.`;

const STYLE_GUIDE = `**Neljä koukkumekanismia — tuota jokaisesta yksi versio, PAITSI stat_hook ja question_reveal jos niille ei ole dataa:**

1. **naapuri_hook** — "naapurihaaste"-kehys: vertaa naapuriin, kavereihin tai koko kansaan. Esim. "Naapurisi sai 4/5 — kyllä kai sinä hänet voitat?". Tuotetaan aina.
2. **stat_hook** — käytä VAIN jos käyttäjä antaa oikean pelidatan (montako pelaajaa, kuinka moni sai kaikki oikein). Esim. "Vain 23 % pelaajista sai kaikki 10 oikein — oletko sinä se harva?". Älä koskaan keksi lukua — jos dataa ei anneta, älä tuota tätä varianttia.
3. **question_reveal** — vain kun kysymyksiä on annettu: poimi YKSI kiinnostavin/vaikein ja näytä se suoraan postauksessa vastausvaihtoehtoineen, ilman oikeaa vastausta. Sanamuoto TÄSMÄLLEEN kuin annetussa datassa. Muuten älä tuota tätä varianttia.
4. **challenge_hook** — lyhyt, energinen väite/haaste aiheeseen sidottuna (ei geneerinen), esim. "Vain oikeat [aihe]-fanit tietävät tämän.". Tuotetaan aina.

Julkkis-, tapahtuma- ja yleis-postauksille (ei kysymyksiä eikä pelidataa) tuota vain naapuri_hook ja challenge_hook.`;

function buildUserPrompt(input: SocialCopyInput): string {
  switch (input.sourceType) {
    case "quiz": {
      const questionsBlock = input.questions?.length
        ? `\n\nVisan kysymykset (valitse question_reveal-varianttiin näistä yksi kiinnostavin — [OIKEA]-merkintä on vain sinua varten, älä paljasta sitä postauksessa):\n${input.questions
            .map((q, i) => {
              const answers = q.answers
                .map(
                  (a, j) =>
                    `${String.fromCharCode(65 + j)}) ${a.text}${a.is_correct ? " [OIKEA]" : ""}`,
                )
                .join("\n   ");
              return `${i + 1}. ${q.question_text}\n   ${answers}`;
            })
            .join("\n\n")}`
        : input.exampleQuestion
          ? `\nEsimerkkikysymys visasta: "${input.exampleQuestion}" (ei riitä question_reveal-varianttiin, koska vastausvaihtoehtoja ei ole annettu — jätä se pois)`
          : "";
      const statBlock = input.stat
        ? `\n\nOIKEA PELIDATA (käytä stat_hookiin, älä liioittele): ${input.stat.totalPlays} pelikertaa, joista ${input.stat.allCorrectPct} % sai kaikki oikein.`
        : `\n\nPelidataa ei ole (alle 20 pelikertaa) — ÄLÄ tuota stat_hook-varianttia.`;

      return `Kirjoita some-postauksen koukkuvaihtoehdot visasta.
Visan otsikko: ${input.title}
Kategoria: ${input.category}${questionsBlock}${statBlock}

${STYLE_GUIDE}

${VOICE_RULES}

Palauta 2-4 varianttia \`submit_social_copy\`-työkalulla (naapuri_hook + challenge_hook aina, stat_hook/question_reveal vain jos dataa annettu).`;
    }
    case "celebrity": {
      const bio = input.bioShort ? `\nLyhyt kuvaus: ${input.bioShort}` : "";
      const deceasedNote = input.isDeceased
        ? "\nHuom: henkilö on kuollut — älä puhu iästä tai onnittele syntymäpäivästä elävänä, vaan viittaa syntymäpäivään historiallisena merkkipäivänä."
        : "\nHenkilö on elossa ja tänään hänen syntymäpäivänsä.";
      return `Kirjoita some-postauksen koukkuvaihtoehdot päivän synttärisankarista.
Nimi: ${input.name}
Rooli/ammatti: ${input.role}${bio}${deceasedNote}

Tuota vain naapuri_hook ja challenge_hook -tyylit (ei kysymyksiä eikä pelidataa saatavilla).

${VOICE_RULES}

Palauta 2 varianttia \`submit_social_copy\`-työkalulla.`;
    }
    case "countdown": {
      const emoji = input.emoji ? ` (${input.emoji})` : "";
      return `Kirjoita some-postauksen koukkuvaihtoehdot ajankohtaisesta teemasta/tapahtumasta: ${input.name}${emoji}.

Tuota vain naapuri_hook ja challenge_hook -tyylit (ei kysymyksiä eikä pelidataa saatavilla).

${VOICE_RULES}

Palauta 2 varianttia \`submit_social_copy\`-työkalulla.`;
    }
    case "general": {
      return `Heikki (sivuston perustaja) kirjoitti tämän raakamuistiinpanon some-postausta varten:
"${input.brief}"

Muotoile tästä naapuri_hook- ja challenge_hook-tyyliset versiot, säilyttäen muistiinpanon ydinajatus.

${VOICE_RULES}

Palauta 2 varianttia \`submit_social_copy\`-työkalulla.`;
    }
  }
}

const socialCopyToolSchema = {
  name: "submit_social_copy",
  description: "Palauttaa 2-4 valmista some-postauksen koukkutekstiä.",
  input_schema: {
    type: "object" as const,
    required: ["variants"],
    properties: {
      variants: {
        type: "array",
        minItems: 2,
        maxItems: 4,
        items: {
          type: "object",
          required: ["style", "text"],
          properties: {
            style: {
              type: "string",
              enum: ["naapuri_hook", "stat_hook", "question_reveal", "challenge_hook"],
            },
            text: { type: "string" },
          },
        },
      },
    },
  },
};

const VALID_STYLES: SocialCopyStyle[] = [
  "naapuri_hook",
  "stat_hook",
  "question_reveal",
  "challenge_hook",
];

export async function generateSocialCopy(
  input: SocialCopyInput,
): Promise<GeneratedSocialCopy> {
  const anthropic = getAnthropic();

  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: "Olet Tietoniekka.fi-tietovisasivuston somekirjoittaja. Kirjoitat lyhyitä Facebook/Instagram-postaustekstejä suomeksi. Palauta vastaus AINOASTAAN annetulla työkalulla (tool use), ei muuta tekstiä.",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: [socialCopyToolSchema as any],
    tool_choice: { type: "tool", name: "submit_social_copy" },
    messages: [{ role: "user", content: buildUserPrompt(input) }],
  });

  const toolUse = resp.content.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (b: any) => b.type === "tool_use",
  ) as
    | { type: "tool_use"; name: string; input: { variants?: SocialCopyVariant[] } }
    | undefined;

  if (!toolUse) {
    throw new Error(
      "Claude ei palauttanut tool_use-vastausta some-copylle — tarkista prompti/malli",
    );
  }

  const raw: any = toolUse.input ?? {};
  const variants: SocialCopyVariant[] = Array.isArray(raw.variants)
    ? raw.variants
        .filter((v: any) => v && typeof v.text === "string" && v.text.trim())
        .map((v: any) => ({
          style: (VALID_STYLES.includes(v.style) ? v.style : "challenge_hook") as SocialCopyStyle,
          text: v.text.trim(),
        }))
    : [];

  // Puolustuslinja: älä koskaan näytä stat_hookia jos emme antaneet oikeaa
  // dataa, ja question_reveal jos emme antaneet kysymyksiä — vaikka malli
  // tottelisi huonosti promptia.
  const hasStat = input.sourceType === "quiz" && !!input.stat;
  const hasQuestions = input.sourceType === "quiz" && !!input.questions?.length;
  const filtered = variants.filter((v) => {
    if (v.style === "stat_hook") return hasStat;
    if (v.style === "question_reveal") return hasQuestions;
    return true;
  });

  if (filtered.length === 0) {
    throw new Error("Claude palautti tyhjän some-copyn. Yritä uudelleen.");
  }

  return { variants: filtered };
}
