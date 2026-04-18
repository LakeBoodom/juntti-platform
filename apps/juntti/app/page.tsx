import Link from "next/link";
import { brand } from "@/config/brand";
import {
  getBirthdaysToday,
  getFeaturedQuiz,
  getUpcomingCountdowns,
  getStats,
  loadQuizWithFirstQuestion,
  getRandomQuizPool,
} from "@/lib/queries";
import { countdownEmoji, roleEmoji } from "@/lib/icons";
import { ShareRow, ShareRowCompact } from "@/components/share-buttons";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { MoreQuizzes } from "@/components/more-quizzes";

export const dynamic = "force-dynamic";

const LETTERS = ["A", "B", "C", "D"];

function formatFiDate(): string {
  return new Intl.DateTimeFormat("fi-FI", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  })
    .format(new Date())
    .replace(/\s/g, "");
}

function formatFiLongDay(): string {
  return new Intl.DateTimeFormat("fi-FI", {
    day: "numeric",
    month: "long",
  }).format(new Date());
}

function daysLabel(n: number): string {
  if (n === 0) return "tänään";
  if (n === 1) return "huomenna";
  return `${n} pv`;
}

export default async function HomePage() {
  const platform = brand.key;
  const [birthdays, countdowns, stats] = await Promise.all([
    getBirthdaysToday(platform),
    getUpcomingCountdowns(platform, 8),
    getStats(platform),
  ]);

  // Quizzes surfaced elsewhere on the page — exclude from random slots.
  const bdayQuizIds = birthdays
    .map((b) => b.trivia_quiz_id)
    .filter((x): x is string => !!x);

  const featured = await getFeaturedQuiz(platform, bdayQuizIds);
  const featuredFull = featured
    ? await loadQuizWithFirstQuestion(featured.id)
    : null;

  const bdayWithQuiz = birthdays.find((b) => b.trivia_quiz_id);
  const bdayFeatured =
    bdayWithQuiz && bdayWithQuiz.trivia_quiz_id
      ? await loadQuizWithFirstQuestion(bdayWithQuiz.trivia_quiz_id)
      : null;

  const nearestWithQuiz = countdowns.find((c) => c.trivia_quiz_id);
  const countdownFeatured =
    nearestWithQuiz && nearestWithQuiz.trivia_quiz_id
      ? await loadQuizWithFirstQuestion(nearestWithQuiz.trivia_quiz_id)
      : null;

  const topBirthday = birthdays[0];

  // "Haluatko pelata lisää?" pool — exclude everything already on the page.
  const excludeFromPool = [
    featured?.id,
    bdayFeatured?.id,
    countdownFeatured?.id,
  ].filter((x): x is string => !!x);
  const pool = await getRandomQuizPool(platform, excludeFromPool, 15);

  return (
    <>
      {/* NAV */}
      <div className="nav">
        <div>
          <div className="nav-logo">{brand.name.toUpperCase()}.COM</div>
          <div className="nav-logo-sub">Oikean Suomen kotisivu</div>
        </div>
        <button className="nav-menu" aria-label="Valikko">
          ☰
        </button>
      </div>

      {/* HERO */}
      <div className="hero">
        <div className="hero-bg"></div>
        <div className="hero-glow"></div>
        <div className="stage-lights">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="bulb"></span>
          ))}
        </div>
        <div className="bubble">
          <p>&ldquo;Tiedätkö enemmän kuin naapuri?&rdquo;</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hero-couple" src="/hosts/hero.png" alt="" />
        <div className="hero-floor"></div>
      </div>

      {/* INTRO */}
      <div className="intro">
        <div className="intro-eyebrow">Tervetuloa kotiin</div>
        <div className="intro-title">
          TESTAA
          <em>TIETOSI.</em>
        </div>
        <div className="intro-sub">
          Päivittäin vaihtuva visa, julkkisten synttärit ja paljon muuta —{" "}
          <strong>100% ilmainen, aina.</strong>
        </div>
      </div>

      {/* TICKER */}
      <div className="ticker">
        <span className="ticker-badge">Nyt</span>
        <span className="ticker-text">
          Pelaajia: <b>{stats.total_plays.toLocaleString("fi-FI")}</b>
          {stats.latest_quiz && (
            <>
              {" "}· Uusin: <b>&ldquo;{stats.latest_quiz.title}&rdquo;</b>
            </>
          )}
          {topBirthday && (
            <>
              {" "}· Synttärit: <b>{topBirthday.name} {topBirthday.age_years}v</b>
            </>
          )}
        </span>
      </div>

      {/* PÄIVÄN VISA */}
      {featuredFull && (
        <div className="section">
          <div className="section-title">🎯 Päivän visa</div>
          <Link href={`/visa/${featuredFull.slug}`} className="quiz-block">
            <div className="quiz-stripe"></div>
            <div className="quiz-inner">
              <div className="quiz-tag">● Suomi · {formatFiDate()}</div>
              <div className="quiz-q">
                {featuredFull.first_question?.question_text ??
                  featuredFull.title}
              </div>
              {featuredFull.first_question && (
                <div className="quiz-answers">
                  {featuredFull.first_question.answers
                    .slice(0, 4)
                    .map((a, i) => (
                      <div key={i} className="qans">
                        <div className="qkey">{LETTERS[i]}</div>
                        <div className="qtext">{a.text}</div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <ShareRow label="Pelaa nyt →" />
          </Link>
        </div>
      )}

      {/* AD 1 — päivän visan jälkeen */}
      <AdPlaceholder />

      {/* SYNTTÄRIT */}
      {birthdays.length > 0 && (
        <div className="section">
          <div className="section-title">🎂 Synttärit tänään</div>

          <div className="bday-block">
            <div className="bday-head">📅 Tänään {formatFiLongDay()}</div>
            <div className="bday-list">
              {birthdays.map((b) =>
                b.trivia_quiz_id ? (
                  <Link
                    key={b.id}
                    href={`/visa/${b.trivia_quiz_id}`}
                    className="bday-row"
                  >
                    <BdayBadge celeb={b} />
                    <div className="bday-info">
                      <div className="bday-name">{b.name}</div>
                      <div className="bday-role">{b.role}</div>
                    </div>
                    <span className="bday-play">Trivia →</span>
                  </Link>
                ) : (
                  <div key={b.id} className="bday-row">
                    <BdayBadge celeb={b} />
                    <div className="bday-info">
                      <div className="bday-name">{b.name}</div>
                      <div className="bday-role">{b.role}</div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          {bdayWithQuiz && bdayFeatured && (
            <Link
              href={`/visa/${bdayFeatured.slug}`}
              className="bday-quiz"
            >
              <div className="bday-quiz-head">
                <div className="bday-quiz-icon">
                  {bdayFeatured.emoji_hint || roleEmoji(bdayWithQuiz.role)}
                </div>
                <div>
                  <div className="bday-quiz-title">
                    {bdayWithQuiz.name} täyttää tänään {bdayWithQuiz.age_years}
                  </div>
                  <div className="bday-quiz-sub">
                    {bdayFeatured.description ??
                      `Tiedätkö ${bdayWithQuiz.name.split(" ")[0]}sta kaiken?`}
                  </div>
                </div>
              </div>
              <div className="bday-quiz-inner">
                <div className="bday-quiz-q">
                  {bdayFeatured.first_question?.question_text ??
                    bdayFeatured.title}
                </div>
                {bdayFeatured.first_question && (
                  <div className="bday-quiz-answers">
                    {bdayFeatured.first_question.answers
                      .slice(0, 4)
                      .map((a, i) => (
                        <div key={i} className="bqans">
                          {LETTERS[i]} · {a.text}
                        </div>
                      ))}
                  </div>
                )}
                <ShareRowCompact label="Jaa syntymäpäiväbiisa!" />
              </div>
            </Link>
          )}
        </div>
      )}

      {/* MID HERO — toinen henkilökuva sivun keskellä */}
      <div className="mid-hero">
        <div className="mid-hero-bg"></div>
        <div className="mid-hero-text">
          <div className="mid-hero-eyebrow">Pysy kyydissä</div>
          <div className="mid-hero-title">
            JUNTTI ON <em>SINUN.</em>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="mid-hero-img" src="/hosts/hero-2.png" alt="" />
      </div>

      {/* COUNTDOWNS */}
      {countdowns.length > 0 && (
        <div className="section">
          <div className="section-title">⏳ Montako päivää...</div>

          <div className="countdown-section">
            <div className="countdown-scroll">
              {countdowns.map((c, i) => (
                <div key={c.id} className={i === 0 ? "cobj first" : "cobj"}>
                  <div className="cobj-icon">{countdownEmoji(c.object_type)}</div>
                  <div className="cobj-days">{daysLabel(c.days_until)}</div>
                  <div className="cobj-lbl">{c.name}</div>
                </div>
              ))}
            </div>
          </div>

          {nearestWithQuiz && countdownFeatured && (
            <Link
              href={`/visa/${countdownFeatured.slug}`}
              className="countdown-trivia"
            >
              <div className="ct-head">
                <div className="ct-icon">
                  {countdownEmoji(nearestWithQuiz.object_type)}
                </div>
                <div className="ct-info">
                  <div className="ct-title">
                    {nearestWithQuiz.name} —{" "}
                    {nearestWithQuiz.days_until === 0
                      ? "tänään!"
                      : `${nearestWithQuiz.days_until} päivää jäljellä!`}
                  </div>
                  <div className="ct-sub">
                    {countdownFeatured.description ??
                      `Tiedätkö ${nearestWithQuiz.name}sta kaiken?`}
                  </div>
                </div>
              </div>
              <div className="ct-inner">
                <div className="ct-q">
                  {countdownFeatured.first_question?.question_text ??
                    countdownFeatured.title}
                </div>
                {countdownFeatured.first_question && (
                  <div className="ct-answers">
                    {countdownFeatured.first_question.answers
                      .slice(0, 4)
                      .map((a, i) => (
                        <div key={i} className="ctans">
                          {LETTERS[i]} · {a.text}
                        </div>
                      ))}
                  </div>
                )}
                <ShareRowCompact label="Jaa tulos!" />
              </div>
            </Link>
          )}
        </div>
      )}

      {/* HALUATKO PELATA LISÄÄ */}
      <MoreQuizzes pool={pool} />

      {/* AD 2 — viimeinen */}
      <AdPlaceholder />

      <div className="spacer"></div>

      {/* BOTTOM NAV */}
      <div className="bottom-nav">
        <Link href="/" className="active">
          <div className="bottom-nav-icon">🏠</div>
          <div className="bottom-nav-lbl">Koti</div>
        </Link>
        <Link href="/">
          <div className="bottom-nav-icon">🎯</div>
          <div className="bottom-nav-lbl">Visat</div>
        </Link>
        <Link href="/">
          <div className="bottom-nav-icon">🎂</div>
          <div className="bottom-nav-lbl">Synttärit</div>
        </Link>
        <Link href="/yhteys">
          <div className="bottom-nav-icon">☰</div>
          <div className="bottom-nav-lbl">Lisää</div>
        </Link>
      </div>
    </>
  );
}

function BdayBadge({ celeb }: { celeb: { name: string; image_url: string | null; age_years: number } }) {
  if (celeb.image_url) {
    return (
      <div className="bday-age-badge">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={celeb.image_url} alt={celeb.name} />
      </div>
    );
  }
  return <div className="bday-age-badge">{celeb.age_years}</div>;
}
