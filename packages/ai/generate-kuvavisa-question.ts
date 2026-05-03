// AI-luotu yksittäinen kuvavisa-kysymys (kuva + 4 vastausta + fact).
// Käyttäjä antaa tyypin (liput/vaakunat/linnut/kasvit/elaimet) + kuvauksen siitä mitä kuvassa on.
// AI keksii uskottavat 3 väärää vastausta + fact-paneelin.

import { getAnthropic, MODEL } from "./client";

export type KuvavisaQuestionInput = {
  type: "liput" | "vaakunat" | "linnut" | "kasvit" | "elaimet";
  /** Mitä kuvassa on, esim. "Jamaikan lippu" tai "Tampereen tuomiokirkko" */
  subject: string;
  /** Vaikeustaso */
  difficulty: "helppo" | "keski" | "vaikea";
  /** Lähdemateriaali (esim. Wikipedia-artikkelin teksti) jolla rajataan AI:ta. */
  sourceContext?: string;
  sourceLabel?: string;
};

export type GeneratedKuvavisaQuestion = {
  question: string;
  options: [string, string, string, string];
  correct_option: string;
  fact: string;
};

const TYPE_GUIDE: Record<KuvavisaQuestionInput["type"], { question: string; distractor: string }> = {
  liput: {
    question: "Minkä maan lippu?",
    distractor: "Naapurimaita, samanvärisiä lippuja, samalta alueelta tai vastaavanlaisia lippuja sekoitusvaihtoehdoiksi.",
  },
  vaakunat: {
    question: "Minkä kunnan vaakuna?",
    distractor: "Samalla maakunnalla tai alueella sijaitsevia kuntia.",
  },
  linnut: {
    question: "Mikä lintu?",
    distractor: "Muita samannäköisiä tai samalla alueella eläviä lintuja.",
  },
  kasvit: {
    question: "Mikä kasvi?",
    distractor: "Muita samanvärisiä tai samalla alueella kasvavia kasveja.",
  },
  elaimet: {
    question: "Mikä eläin?",
    distractor: "Muita samansukuisia tai samalla alueella eläviä eläimiä.",
  },
};

export async function generateKuvavisaQuestion(
  input: KuvavisaQuestionInput,
): Promise<GeneratedKuvavisaQuestion> {
  const { question: defaultQ, distractor } = TYPE_GUIDE[input.type];

  const system = `Olet suomalainen tietovisa-asiantuntija. Kirjoitat kysymyksiä sujuvalla, luonnollisella suomen kielellä. Tarkkuus on ehdoton.

**Työjärjestys:**
1. Aiheena on ${input.type}-kuvavisa.
2. Käyttäjä kertoo mitä kuvassa on (oikea vastaus).
3. Kirjoita kysymys (yleensä "${defaultQ}") ja merkkaa oikea vastaus täsmälleen kuten käyttäjä antoi.
4. Keksi 3 uskottavaa väärää vastausta. ${distractor}
5. **Sekoita vastausten järjestys** — älä laita oikeaa aina samaan paikkaan.
6. Kirjoita 1–2 lauseen fact-teksti, joka antaa lisätietoa oikeasta vastauksesta. Ei johdantoja, ei metakommentteja.

**Lähdemateriaali ohittaa sisäisen tietosi:** Jos käyttäjän viestissä on LÄHDEMATERIAALI-osio, käytä SEN sisältöä faktojen pohjana. Älä sekoita sisäistä tietoasi lähteen kanssa. Jos sisäinen muistisi ja lähde ovat ristiriidassa, luota lähteeseen. Fact-teksti rakennetaan lähteestä.

Palauta vain submit_question-työkalulla.`;

  const sourceBlock = input.sourceContext
    ? `\n\n**LÄHDEMATERIAALI — käytä vain tätä faktojen pohjana. ÄLÄ keksi asioita joita tässä ei lue. Jos jotain ei lähteessä kerrota, älä esitä siitä kysymystä.**\n\nLähde: ${input.sourceLabel ?? "annettu teksti"}\n---\n${input.sourceContext.slice(0, 50000)}\n---\n`
    : "";

  const user = `Tyyppi: ${input.type}
Kuvassa: **${input.subject}** (tämä on oikea vastaus)
Vaikeustaso: ${input.difficulty}
${sourceBlock}
Luo kysymys, 4 vastausvaihtoehtoa (oikea + 3 väärää), ja fact.`;

  const tool = {
    name: "submit_question",
    description: "Palauttaa yhden kuvavisa-kysymyksen.",
    input_schema: {
      type: "object" as const,
      properties: {
        question: { type: "string", description: "Kysymys, esim. 'Minkä maan lippu?'" },
        options: {
          type: "array",
          items: { type: "string" },
          minItems: 4,
          maxItems: 4,
          description: "4 vastausvaihtoehtoa sekoitetussa järjestyksessä",
        },
        correct_option: {
          type: "string",
          description: "Yksi options-listan jäsen — oikea vastaus",
        },
        fact: {
          type: "string",
          description: "1–2 lauseen lisätieto oikeasta vastauksesta",
        },
      },
      required: ["question", "options", "correct_option", "fact"],
    },
  };

  const anthropic = getAnthropic();
  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system,
    tools: [tool],
    tool_choice: { type: "tool", name: "submit_question" },
    messages: [{ role: "user", content: user }],
  });

  const toolUse = resp.content.find((b) => b.type === "tool_use") as
    | { type: "tool_use"; name: string; input: GeneratedKuvavisaQuestion }
    | undefined;
  if (!toolUse) throw new Error("Claude ei palauttanut tool_use-blokkia");

  const out = toolUse.input;
  if (
    !out.question ||
    !Array.isArray(out.options) ||
    out.options.length !== 4 ||
    !out.options.includes(out.correct_option)
  ) {
    throw new Error("AI palautti virheellisen rakenteen");
  }

  return {
    question: out.question,
    options: out.options as [string, string, string, string],
    correct_option: out.correct_option,
    fact: out.fact,
  };
}
