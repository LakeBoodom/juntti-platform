"use server";

import { generateKuvavisaQuestion, type KuvavisaQuestionInput } from "@juntti/ai";

export async function aiGenerateKuvavisa(input: KuvavisaQuestionInput) {
  try {
    const result = await generateKuvavisaQuestion(input);
    return { ok: true as const, data: result };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI-luonti epäonnistui";
    return { ok: false as const, error: msg };
  }
}
