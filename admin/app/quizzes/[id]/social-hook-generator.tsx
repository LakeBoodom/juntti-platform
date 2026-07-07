"use client";

import { useState, useTransition } from "react";
import { Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateSocialHooks } from "./social-actions";

const STYLE_LABEL: Record<string, string> = {
  naapuri_hook: "Naapurihaaste",
  stat_hook: "Tilastokoukku",
  question_reveal: "Kysymys esillä",
  challenge_hook: "Haaste",
};

export function SocialHookGenerator({ quizId }: { quizId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [variants, setVariants] = useState<
    { style: string; text: string }[] | null
  >(null);
  const [savedCount, setSavedCount] = useState(0);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  function run() {
    setOpen(true);
    setError(null);
    startTransition(async () => {
      const res = await generateSocialHooks(quizId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setVariants(res.variants);
      setSavedCount(res.savedCount);
    });
  }

  function copy(text: string, i: number) {
    navigator.clipboard.writeText(text);
    setCopiedIdx(i);
    setTimeout(() => setCopiedIdx((cur) => (cur === i ? null : cur)), 1500);
  }

  return (
    <>
      <Button variant="outline" onClick={run} disabled={pending}>
        <Sparkles /> Luo some-koukku
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Some-postauksen koukut</DialogTitle>
            <DialogDescription>
              {pending
                ? "Generoidaan koukkuja…"
                : variants
                  ? `${savedCount} versiota tallennettu draftiksi (näkyvät myös /somepostaukset). Kopioi haluamasi versio.`
                  : "Odotetaan…"}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {variants && (
            <div className="space-y-3">
              {variants.map((v, i) => (
                <div key={i} className="rounded-md border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      {STYLE_LABEL[v.style] ?? v.style}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copy(v.text, i)}
                    >
                      {copiedIdx === i ? (
                        <>
                          <Check /> Kopioitu
                        </>
                      ) : (
                        <>
                          <Copy /> Kopioi
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{v.text}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
