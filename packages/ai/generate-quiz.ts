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

  let toolUse = await callOnce();
  // If the first call returned fewer than 60% of requested questions,
  // retry once — usually token pressure eased up.
  const minAcceptable = Math.ceil(clamped.questionCount * 0.6);
  if (toolUse && toolUse.input.questions.length < minAcceptable) {
    const retry = await callOnce();
    if (retry && retry.input.questions.length > toolUse.input.questions.length) {
      toolUse = retry;
    }
  }
  if (!toolUse) {
    throw new Error(
      "Claude did not return a tool_use block — check prompt + model",
    );
  }

  // Auto-correct common Claude slips instead of throwing and losing the
  // whole generation. The detail page shows the first answer as 'correct'
  // if we had to guess, so the user fixes it with one click.
  const data = toolUse.input;
  for (const q of data.questions) {
    // Pad or truncate to exactly 4 answers.
    while (q.answers.length < 4) {
      q.answers.push({ text: "", is_correct: false });
    }
    if (q.answers.length > 4) q.answers.length = 4;

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
  }
  return data;
}
