"use client";

import { useState, useTransition } from "react";
import { Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateQuestion } from "./actions";

type Answer = { text: string; is_correct: boolean };
type Props = {
  id: string;
  sortOrder: number;
  initial: {
    question_text: string;
    answers: Answer[];
    explanation: string | null;
  };
};

export function QuestionCard({ id, sortOrder, initial }: Props) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(initial.question_text);
  const [answers, setAnswers] = useState<Answer[]>(
    initial.answers.length === 4
      ? initial.answers
      : [
          { text: "", is_correct: false },
          { text: "", is_correct: false },
          { text: "", is_correct: false },
          { text: "", is_correct: false },
        ],
  );
  const [explanation, setExplanation] = useState(initial.explanation ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function setAnswer(i: number, patch: Partial<Answer>) {
    setAnswers((prev) =>
      prev.map((a, idx) =>
        idx === i
          ? { ...a, ...patch }
          : patch.is_correct
            ? { ...a, is_correct: false }
            : a,
      ),
    );
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await updateQuestion(id, {
        question_text: text.trim(),
        answers: answers.map((a) => ({ text: a.text.trim(), is_correct: a.is_correct })),
        explanation: explanation.trim(),
      });
      if (!res.ok) setError(res.error);
      else setEditing(false);
    });
  }

  if (!editing) {
    return (
      <div className="space-y-3 rounded-md border p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground">
              Kysymys {sortOrder + 1}
            </div>
            <div className="font-medium">{text}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(true)}
            aria-label="Muokkaa"
          >
            <Pencil /> Muokkaa
          </Button>
        </div>
        <ul className="space-y-1 text-sm">
          {answers.map((a, i) => (
            <li
              key={i}
              className={`flex items-center gap-2 rounded-md px-2 py-1 ${
                a.is_correct
                  ? "bg-green-50 text-green-900 dark:bg-green-950/30 dark:text-green-100"
                  : ""
              }`}
            >
              {a.is_correct ? (
                <Check className="h-3.5 w-3.5 text-green-700" />
              ) : (
                <span className="inline-block h-3.5 w-3.5" />
              )}
              <span>{a.text}</span>
            </li>
          ))}
        </ul>
        {explanation && (
          <p className="text-xs text-muted-foreground">
            <strong>Selitys:</strong> {explanation}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-md border bg-muted/30 p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Muokataan kysymystä {sortOrder + 1}
        </div>
        <div className="inline-flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditing(false);
              setText(initial.question_text);
              setAnswers(initial.answers);
              setExplanation(initial.explanation ?? "");
              setError(null);
            }}
          >
            <X /> Peruuta
          </Button>
          <Button size="sm" onClick={save} disabled={pending}>
            {pending ? "Tallennetaan…" : "Tallenna"}
          </Button>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Kysymys</Label>
        <Input value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Vastaukset (valitse oikea)</Label>
        {answers.map((a, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              name={`correct-${id}`}
              checked={a.is_correct}
              onChange={() => setAnswer(i, { is_correct: true })}
              className="h-4 w-4"
            />
            <Input
              value={a.text}
              onChange={(e) => setAnswer(i, { text: e.target.value })}
              placeholder={`Vastaus ${i + 1}`}
            />
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <Label>Selitys</Label>
        <Input
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
        />
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
