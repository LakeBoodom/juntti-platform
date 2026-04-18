import Link from "next/link";
import { brand } from "@/config/brand";
import {
  getBirthdaysToday,
  getFeaturedQuiz,
  getUpcomingCountdowns,
} from "@/lib/queries";
import { BirthdayCard } from "@/components/birthday-card";
import { CountdownList } from "@/components/countdown-list";
import { QuizCta } from "@/components/quiz-cta";

// Always render fresh — admin changes (publish, schedule, new celebrity)
// need to appear immediately, not after a 15-minute cache window.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const platform = brand.key;
  const [birthdays, countdowns, featured] = await Promise.all([
    getBirthdaysToday(platform),
    getUpcomingCountdowns(platform, 4),
    getFeaturedQuiz(platform),
  ]);

  const dateLine = new Intl.DateTimeFormat("fi-FI", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <main className="mx-auto max-w-xl px-4 pb-24 pt-4 space-y-6">
      <header className="space-y-1 pt-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          {dateLine}
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {brand.name}
        </h1>
        <p className="text-sm text-ink-muted">
          Suomalainen tietovisa — päivä kerrallaan
        </p>
      </header>

      {featured ? (
        <QuizCta quiz={featured} />
      ) : (
        <div className="rounded-2xl border border-dashed border-ink/10 p-6 text-center text-sm text-ink-muted">
          Ei vielä julkaistuja visoja. Palaa huomenna.
        </div>
      )}

      {birthdays.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Tänään täyttää vuosia
          </h2>
          <div className="space-y-3">
            {birthdays.map((c) => (
              <BirthdayCard key={c.id} celeb={c} platform={platform} />
            ))}
          </div>
        </section>
      )}

      <CountdownList items={countdowns} />

      <footer className="pt-8 text-center text-xs text-ink-hint">
        <div className="space-x-3">
          <Link href="/tietosuoja" className="underline">Tietosuoja</Link>
          <Link href="/yhteys" className="underline">Yhteys</Link>
        </div>
        <p className="mt-2">© {new Date().getFullYear()} {brand.name}</p>
      </footer>
    </main>
  );
}
