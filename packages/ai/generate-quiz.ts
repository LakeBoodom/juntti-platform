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

  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: buildQuizSystemPrompt(),
    tools: [quizToolSchema as any],
    tool_choice: { type: "tool", name: "submit_quiz" },
    messages: [{ role: "user", content: buildQuizUserPrompt(clamped) }],
  });

  const toolUse = resp.content.find((b: any) => b.type === "tool_use") as
    | { type: "tool_use"; name: string; input: GeneratedQuiz }
    | undefined;
  if (!toolUse) {
    throw new Error(
      "Claude did not return a tool_use block — check prompt + model",
    );
  }

  // Validate: each question has exactly one correct answer.
  const data = toolUse.input;
  for (const [i, q] of data.questions.entries()) {
    const correct = q.answers.filter((a) => a.is_correct).length;
    if (correct !== 1) {
      throw new Error(
        `Question ${i + 1} had ${correct} correct answers — expected exactly 1`,
      );
    }
    if (q.answers.length !== 4) {
      throw new Error(
        `Question ${i + 1} had ${q.answers.length} answers — expected 4`,
      );
    }
  }
  return data;
}
