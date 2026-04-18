"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  generateAndSaveDraft,
  type GenerateAndSaveInput,
} from "./actions";

const CATEGORIES = [
  "musiikki",
  "urheilu",
  "historia",
  "kulttuuri",
  "maantieto",
  "tiede",
  "elokuvat",
  "tv",
  "ruoka",
  "politiikka",
  "yleistieto",
];

export function GeneratorForm() {
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState<string>("yleistieto");
  const [difficulty, setDifficulty] = useState<"helppo" | "keski" | "vaikea">(
    "keski",
  );
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [tone, setTone] = useState<
    "rento" | "humoristinen" | "asiallinen" | "nostalginen"
  >("rento");
  const [platform, setPlatform] = useState<"juntti" | "tietovisa" | "both">(
    "juntti",
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const input: GenerateAndSaveInput = {
      topic: topic.trim(),
      category,
      difficulty,
      questionCount,
      tone,
      platform,
    };
    startTransition(async () => {
      const res = await generateAndSaveDraft(input);
      if (res && !res.ok) setError(res.error);
      // On success the action redirects; we won't reach here.
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="topic">Aihe</Label>
        <Input
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="esim. Suomi-rock 80-luvulla"
          required
          disabled={pending}
        />
        <p className="text-xs text-muted-foreground">
          Vapaatekstinen aihe — voi olla laaja tai hyvin spesifi.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Kategoria</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Vaikeus</Label>
          <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="helppo">Helppo</SelectItem>
              <SelectItem value="keski">Keski</SelectItem>
              <SelectItem value="vaikea">Vaikea</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Kysymysten määrä</Label>
          <Select
            value={String(questionCount)}
            onValueChange={(v) => setQuestionCount(parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 kysymystä (nopea)</SelectItem>
              <SelectItem value="10">10 kysymystä (normaali)</SelectItem>
              <SelectItem value="15">15 kysymystä (pitkä)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Sävy</Label>
          <Select value={tone} onValueChange={(v: any) => setTone(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rento">Rento</SelectItem>
              <SelectItem value="humoristinen">Humoristinen</SelectItem>
              <SelectItem value="asiallinen">Asiallinen</SelectItem>
              <SelectItem value="nostalginen">Nostalginen</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Alusta</Label>
          <Select value={platform} onValueChange={(v: any) => setPlatform(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="juntti">juntti.com (30–50v)</SelectItem>
              <SelectItem value="tietovisa">tietovisa.fi (50–70v)</SelectItem>
              <SelectItem value="both">Molemmat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending || !topic.trim()} size="lg">
          <Sparkles /> {pending ? "Generoidaan…" : "Generoi visa"}
        </Button>
        {pending && (
          <p className="text-sm text-muted-foreground">
            Claude kirjoittaa kysymyksiä… tämä kestää 15–40 sekuntia.
          </p>
        )}
      </div>
    </form>
  );
}
