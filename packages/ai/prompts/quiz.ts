import type { GenerateQuizInput } from "../types";

const TONE_GUIDE: Record<string, string> = {
  rento: "rento ja arkinen, puhekielinen mutta selkeä",
  humoristinen: "humoristinen ja kevyt, pilke silmäkulmassa, ei kuitenkaan vitsikäs kysymysten kustannuksella",
  asiallinen: "asiallinen ja neutraali, journalistinen ote",
  nostalginen: "nostalginen ja lämmin, 90-luvun/2000-luvun vivahteita kun kontekstiin sopii",
};

const AUDIENCE_GUIDE: Record<string, string> = {
  juntti:
    "Kohderyhmä: 30–50-vuotiaat suomalaiset. Viittaukset 90- ja 2000-lukuun tuttuja. Humoristinen, nostalginen tyyli toimii. Kieli rentoa ja nykysuomea.",
  tietovisa:
    "Kohderyhmä: 50–70-vuotiaat suomalaiset. Klassinen yleissivistys, perinteinen kulttuuri, historia. Kieli asiallisempaa, ei slangia.",
  both: "Kohderyhmä: kaikenikäiset suomalaiset. Vältä sukupolvikohtaisia viittauksia.",
};

export function buildQuizSystemPrompt() {
  return `Olet suomalainen tietovisa-asiantuntija. Kirjoitat kysymyksiä sujuvalla, luonnollisella suomen kielellä — ei käännöskieltä, ei kömpelöä fraasia. Tarkkuus on ehdoton: jos et ole varma vastauksesta, älä esitä kysymystä. Kaikki kysymykset on faktoiltaan pitäviä 2026-aprilin tiedon mukaan.

**Tuota TASAN pyydetty määrä kysymyksiä** — ei vähemmän, ei enempää. Jos pyydettiin 10, palauta 10.

**Työjärjestys jokaiselle kysymykselle:**
1. Päätä ensin aihe ja tarkka oikea vastaus (esim. "1995").
2. Kirjoita kysymys joka ohjaa tähän vastaukseen selvästi.
3. Valitse oikea vastausvaihtoehto joka vastaa tätä — merkitse is_correct: true.
4. Kirjoita 3 uskottavaa mutta väärää vastausvaihtoehtoa — kaikki is_correct: false.
5. Kirjoita selitys ikään kuin kirjoittaisit lopullista ensyklopediatekstiä.

**Säännöt:**
- Kysymys on yhdellä lauseella, korkeintaan 160 merkkiä.
- Tasan 4 vastausvaihtoehtoa, tasan 1 oikein.
- Vääristä vastauksista ei saa olla ilmeisen hölmöjä — ne ovat uskottavia, samaa aihepiiriä.
- Selitys on 1–2 siistiä lausetta lopullisena faktana. **Älä koskaan paljasta ajatteluprosessia selityksessä** — ei sanoja kuten "hetkinen", "odota", "korjaus", "ei vaan", "toisin sanoen", "itse asiassa". Selitys lukee kuin tietosanakirjan lyhyt kuvaus, ei kuin kirjoittaja miettisi ääneen.
- Jos huomaat kesken kirjoittamisen että vastausmerkintä oli väärin, **käynnistä sama kysymys alusta** — korjaa is_correct-flagi oikealle vastaukselle ennen kuin viimeistelet selityksen. Älä jätä ristiriitaa merkinnän ja selityksen väliin.
- Rajatapausaiheissa (esim. vuosikymmen-rajat) valitse selvä esimerkki — jos 1995-luku voisi olla sekä 1990- että 2000-luku riippuen tulkinnasta, **vaihda koko kysymys** aiheeseen joka ei ole rajatapaus.
- Ei päivämäärä-tarkkuutta ("tarkalleen 15. elokuuta 2003") ellei se ole kysymyksen pointti — suuntaa antavat vuosiluvut ovat parempia.

Älä liitä tekstiin johdantoja ("Tässä on visa…"), yhteenvetoja, metakommentteja tai emoji-ketjuja. Vastaa vain pyydetyllä työkalulla (tool use).`;
}

export function buildQuizUserPrompt(input: GenerateQuizInput) {
  const tone = TONE_GUIDE[input.tone] ?? input.tone;
  const audience = AUDIENCE_GUIDE[input.platform] ?? AUDIENCE_GUIDE.both;

  return `Luo ${input.questionCount} kysymyksen tietovisa aiheesta: **${input.topic}**.

Kategoria: ${input.category}
Vaikeustaso: ${input.difficulty} (helppo = useimmat tietävät, keski = yleissivistystä vaativa, vaikea = erikoistuneempaa tietoa)
Sävy: ${tone}
${audience}

Luo lyhyt, iskevä otsikko ja 1–2 lauseen kuvaus visasta. Slug on otsikon ASCII-muoto viivalla (esim. "suomen-rock-80-luku"). Valitse kysymyksille yksi sopiva emoji-vihje (esim. "🎸").

Palauta tulos \`submit_quiz\`-työkalulla.`;
}

// Input schema for Claude's tool use — Anthropic will only return this shape.
// Factory so we can pin minItems/maxItems to the exact requested count.
export function quizToolSchema(requestedCount: number) {
  return {
    name: "submit_quiz",
    description:
      "Palauttaa valmiin visan rakenteisessa muodossa. Kutsu tätä kun kysymykset on valmiita.",
    input_schema: {
      type: "object" as const,
      required: ["title", "description", "slug", "emoji_hint", "questions"],
      properties: {
        title: {
          type: "string",
          description: "Visan otsikko, korkeintaan 60 merkkiä",
        },
        description: {
          type: "string",
          description: "1–2 lauseen kuvaus mitä visassa kysytään",
        },
        slug: {
          type: "string",
          description: "ASCII-slug viivalla eroteltuna, vain a-z 0-9 ja -",
          pattern: "^[a-z0-9-]+$",
        },
        emoji_hint: {
          type: "string",
          description: "Yksittäinen emoji tai lyhyt ikoni-vihje",
        },
        questions: {
          type: "array",
          minItems: requestedCount,
          maxItems: requestedCount,
          items: {
            type: "object",
            required: ["question_text", "answers", "explanation"],
            properties: {
              question_text: { type: "string" },
              explanation: { type: "string" },
              answers: {
                type: "array",
                minItems: 4,
                maxItems: 4,
                items: {
                  type: "object",
                  required: ["text", "is_correct"],
                  properties: {
                    text: { type: "string" },
                    is_correct: { type: "boolean" },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}
