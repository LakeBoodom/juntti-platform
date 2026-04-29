"use server";

import { generateKuvavisaQuestion, type KuvavisaQuestionInput } from "@juntti/ai";
import { fetchWikipediaArticle } from "../celebrities/wikipedia-actions";

export async function aiGenerateKuvavisa(
  input: Omit<KuvavisaQuestionInput, "sourceContext" | "sourceLabel"> & {
    wikipediaUrl?: string | null;
  },
) {
  try {
    let sourceContext: string | undefined;
    let sourceLabel: string | undefined;
    if (input.wikipediaUrl) {
      const article = await fetchWikipediaArticle(input.wikipediaUrl);
      if (article) {
        sourceContext = article;
        sourceLabel = input.wikipediaUrl;
      }
    }
    const result = await generateKuvavisaQuestion({
      type: input.type,
      subject: input.subject,
      difficulty: input.difficulty,
      sourceContext,
      sourceLabel,
    });
    return { ok: true as const, data: result, usedSource: !!sourceContext };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI-luonti epäonnistui";
    return { ok: false as const, error: msg };
  }
}
