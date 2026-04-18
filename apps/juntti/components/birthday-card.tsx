import Link from "next/link";
import type { CelebrityToday } from "@/lib/queries";
import { Cake } from "lucide-react";

export function BirthdayCard({ celeb, platform }: { celeb: CelebrityToday; platform: string }) {
  const aliveSuffix = celeb.death_date ? " (kuollut)" : "";
  const ageLine = celeb.death_date
    ? `Olisi täyttänyt ${celeb.age_years}`
    : `Täyttää tänään ${celeb.age_years}`;

  const href = celeb.trivia_quiz_id ? `/visa/${celeb.trivia_quiz_id}` : "#";

  return (
    <article className="overflow-hidden rounded-2xl bg-ink text-white shadow-lg">
      <div className="flex gap-4 p-4">
        {celeb.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={celeb.image_url}
            alt={celeb.name}
            className="h-24 w-24 flex-shrink-0 rounded-xl object-cover"
            loading="eager"
          />
        ) : (
          <div className="h-24 w-24 flex-shrink-0 rounded-xl bg-ink-soft" />
        )}
        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
            <Cake className="h-3 w-3" /> Synttärisankari
          </div>
          <h2 className="mt-1 truncate text-xl font-bold">{celeb.name}</h2>
          <p className="text-sm text-ink-hint">{celeb.role}{aliveSuffix}</p>
          <p className="mt-1 text-sm text-white/80">{ageLine}</p>
        </div>
      </div>

      {celeb.bio_short && (
        <p className="px-4 pb-3 text-sm text-white/75">{celeb.bio_short}</p>
      )}

      {celeb.trivia_quiz_id && (
        <Link
          href={href}
          className="block border-t border-white/10 px-4 py-3 text-center text-sm font-semibold text-brand-soft hover:bg-white/5"
        >
          Pelaa {celeb.name.split(" ")[0]} -visa →
        </Link>
      )}
    </article>
  );
}
