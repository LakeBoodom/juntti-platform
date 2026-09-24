"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  backfillCelebrityImages,
  type BackfillImagesResult,
} from "./wikipedia-actions";

// Hakee puuttuvat kuvat henkilöiden omilta Wikipedia-sivuilta. Päivittää vain
// image_url-kentän — nimet, biot ja visat pysyvät ennallaan.
export function BackfillImagesButton({ missingCount }: { missingCount: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<BackfillImagesResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run() {
    setError(null);
    setResult(null);
    startTransition(async () => {
      const res = await backfillCelebrityImages();
      if (!res.ok) setError(res.error);
      else setResult(res.result);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        onClick={run}
        disabled={pending || missingCount === 0}
      >
        <ImageDown />
        {pending
          ? "Haetaan kuvia…"
          : `Hae puuttuvat kuvat Wikipediasta (${missingCount})`}
      </Button>

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">
          Haku epäonnistui: {error}
        </p>
      )}

      {result && (
        <div className="space-y-3 rounded-md border bg-muted/30 p-3 text-sm">
          <p className="font-medium">
            Päivitetty {result.updated.length} · ilman kuvaa{" "}
            {result.missing.length}
            {result.remaining > 0 &&
              ` · ${result.remaining} jäi käsittelemättä aikarajan takia — aja uudelleen`}
          </p>
          {result.updated.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Päivitetyt (tarkista että kuvassa on oikea henkilö)
              </p>
              <ul className="mt-1 grid gap-1 sm:grid-cols-2">
                {result.updated.map((u) => (
                  <li key={u.name} className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={u.image_url}
                      alt=""
                      className="h-8 w-8 rounded object-cover"
                    />
                    <a
                      href={u.image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {u.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.missing.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Ilman kuvaa jääneet
              </p>
              <ul className="mt-1 space-y-0.5">
                {result.missing.map((m) => (
                  <li key={m.name}>
                    {m.name} — <span className="text-muted-foreground">{m.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
