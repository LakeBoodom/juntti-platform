import { getAnthropic, MODEL } from "./client";
import {
  buildQuizSystemPrompt,
  buildQuizUserPrompt,
  quizToolSchema,
} from "./prompts/quiz";
import type { GenerateQuizInput, GeneratedQuiz } from "./types";

export async function generateQuiz(
  input: GenerateQuizInput,
): Promise<GeneratedQuiz> {
  const clamped = {
    ...input,
    questionCount: Math.max(3, Math.min(15, input.questionCount)),
  };

  const anthropic = getAnthropic();

  async function callOnce() {
    // 8192 tokens fits 15 Finnish questions + explanations comfortably.
    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 8192,
      system: buildQuizSystemPrompt(),
      tools: [quizToolSchema(clamped.questionCount) as any],
      tool_choice: { type: "tool", name: "submit_quiz" },
      messages: [{ role: "user", content: buildQuizUserPrompt(clamped) }],
    });
    return resp.content.find((b: any) => b.type === "tool_use") as
      | { type: "tool_use"; name: string; input: GeneratedQuiz }
      | undefined;
  }

  function questionCount(tu: typeof toolUse): number {
    return Array.isArray(tu?.input?.questions) ? tu!.input.questions.length : 0;
  }

  let toolUse = await callOnce();
  // If the first call returned fewer than 60% of requested questions,
  // retry once — usually token pressure eased up.
  const minAcceptable = Math.ceil(clamped.questionCount * 0.6);
  if (toolUse && questionCount(toolUse) < minAcceptable) {
    const retry = await callOnce();
    if (retry && questionCount(retry) > questionCount(toolUse)) {
      toolUse = retry;
    }
  }
  if (!toolUse) {
    throw new Error(
      "Claude did not return a tool_use block — check prompt + model",
    );
  }

  // Defensively reshape the tool output. Claude can emit partial JSON if it
  // hits max_tokens, which leaves some fields undefined. Normalize everything
  // so the rest of the pipeline and the UI see a well-formed GeneratedQuiz.
  const raw: any = toolUse.input ?? {};
  const data: GeneratedQuiz = {
    title: typeof raw.title === "string" && raw.title.trim() ? raw.title : "Nimetön visa",
    description: typeof raw.description === "string" ? raw.description : "",
    slug:
      typeof raw.slug === "string" && /^[a-z0-9-]+$/.test(raw.slug)
        ? raw.slug
        : `visa-${Date.now().toString(36)}`,
    emoji_hint: typeof raw.emoji_hint === "string" ? raw.emoji_hint : "",
    questions: Array.isArray(raw.questions) ? raw.questions : [],
  };

  if (data.questions.length === 0) {
    throw new Error(
      "Claude palautti tyhjän vastauksen. Yritä uudelleen — joskus auttaa vaihtaa aihetta tai vähentää kysymysten määrää.",
    );
  }

  // Normalize each question. Missing fields get safe defaults instead of
  // crashing the server action; the user fixes them in the detail page.
  for (const q of data.questions) {
    if (typeof q.question_text !== "string") q.question_text = "";
    if (typeof q.explanation !== "string") q.explanation = "";
    if (!Array.isArray(q.answers)) q.answers = [];

    // Pad or truncate to exactly 4 answers.
    while (q.answers.length < 4) {
      q.answers.push({ text: "", is_correct: false });
    }
    if (q.answers.length > 4) q.answers.length = 4;

    // Normalize each answer shape.
    for (const a of q.answers) {
      if (typeof a.text !== "string") a.text = "";
      if (typeof a.is_correct !== "boolean") a.is_correct = false;
    }

    // Ensure exactly one is_correct = true.
    const correctIndices = q.answers
      .map((a, i) => (a.is_correct ? i : -1))
      .filter((i) => i >= 0);
    if (correctIndices.length === 0) {
      q.answers[0].is_correct = true;
    } else if (correctIndices.length > 1) {
      const keep = correctIndices[0];
      q.answers.forEach((a, i) => {
        a.is_correct = i === keep;
      });
    }

    // Shuffle answer order — Claude (and most LLMs) have a strong bias
    // toward putting the correct answer first. Fisher-Yates on the
    // normalized array guarantees uniform random position for is_correct.
    for (let i = q.answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [q.answers[i], q.answers[j]] = [q.answers[j], q.answers[i]];
    }
  }
  return data;
}
