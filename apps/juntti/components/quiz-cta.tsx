import Link from "next/link";
import type { QuizSummary } from "@/lib/queries";
import { HostImage } from "./hosts";
import { PlayCircle } from "lucide-react";

function hostVariantFor(q: QuizSummary) {
  const c = q.category.toLowerCase();
  if (
    c.includes("urheilu") ||
    c.includes("jääkiekko") ||
    c.includes("lätkä") ||
    c.includes("kiekko")
  )
    return "hockey" as const;
  if (c.includes("historia") || c.includes("politiikka")) return "classic" as const;
  if (c.includes("musiikki") || c.includes("tv") || c.includes("elokuvat"))
    return "bling" as const;
  return "default" as const;
}

export function QuizCta({ quiz }: { quiz: QuizSummary }) {
  const variant = hostVariantFor(quiz);
  return (
    <Link
      href={`/visa/${quiz.slug}`}
      className="group block overflow-hidden rounded-2xl bg-ink text-white shadow-xl"
    >
      <div className="relative aspect-[16/10] w-full">
        <HostImage
          variant={variant}
          className="absolute inset-0"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
        <div className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white/90 backdrop-blur">
          {quiz.emoji_hint && <span className="mr-1">{quiz.emoji_hint}</span>}
          Päivän visa
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="text-xs uppercase tracking-wide text-white/70">
            {quiz.category} · {quiz.difficulty}
          </div>
          <h2 className="mt-0.5 text-2xl font-bold leading-tight">
            {quiz.title}
          </h2>
          {quiz.description && (
            <p className="mt-1 line-clamp-2 text-sm text-white/80">
              {quiz.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3 text-sm font-semibold">
        <span className="text-white/80">{quiz.question_count} kysymystä</span>
        <span className="inline-flex items-center gap-1.5 text-brand-soft group-hover:translate-x-0.5 transition-transform">
          <PlayCircle className="h-4 w-4" /> Pelaa
        </span>
      </div>
    </Link>
  );
}
