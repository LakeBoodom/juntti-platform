"use client";

import { useTransition } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleQuizFeatured } from "./featured-actions";

/**
 * Nosto: kategorian etusivuteaseri näyttää tähdellä merkityn visan randomin sijaan.
 * Esim. urheilu → futisvisa MM-kisojen ajan.
 */
export function FeaturedToggle({
  quizId,
  featured,
}: {
  quizId: string;
  featured: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={pending}
      aria-label={featured ? "Poista nosto" : "Nosta kategorian teaseriin"}
      title={featured ? "Nosto päällä — etusivun kategoriateaseri näyttää tämän visan" : "Nosta kategorian teaseriin"}
      onClick={() =>
        startTransition(async () => {
          await toggleQuizFeatured(quizId, !featured);
        })
      }
    >
      <Star
        className={featured ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}
      />
    </Button>
  );
}
