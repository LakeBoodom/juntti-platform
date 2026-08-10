// TIETONIEKKA 2.0 — korttikomponentit (KORTTIJARJESTELMA.md §6)
// korttigrafiikka = f(collection, genre, badge, hash(id) % 3)
// Kehys, chip, badge ja tekstit AINA koodissa — ei koskaan leivottuna kuvaan.

import { Motif, PersonSilhouette } from "./motifs";

/* Deterministinen A/B/C-variaatio: sama visa saa aina saman ilmeen. */
export function cardVariant(id: string): "a" | "b" | "c" {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (["a", "b", "c"] as const)[h % 3];
}

/* Kokoelma → aksenttimuuttuja (värikuri: perhe per kokoelma, tokenit tn20.css:ssä). */
const ACCENT: Record<string, string> = {
  tv: "var(--tn-acc-tv)",
  urheilu: "var(--tn-acc-urheilu)",
  musiikki: "var(--tn-acc-musiikki)",
  elokuvat: "var(--tn-acc-elokuvat)",
  matkakohteet: "var(--tn-acc-matkakohteet)",
  "tunnetut-henkilot": "var(--tn-acc-henkilot)",
  yleistieto: "var(--tn-acc-yleistieto)",
};

/* Genren sävy kokoelman väriperheen SISÄLLÄ (TV = magenta-perhe).
   Genre erottuu motiivista + hienovaraisesta sävyerosta, EI omasta väristään. */
const TV_GENRE_SHADE: Record<string, string> = {
  komedia: "#ff6fb5",
  draama: "#e04597",
  rikosdraama: "#c22c7c",
  scifi: "#ff4dd2",
  kauhu: "#9c2263",
  "tosi-tv": "#ff77c8",
  dokumentti: "#d155a0",
  animaatio: "#ff5ca8",
};

export function cardAccent(collection: string | null, genre?: string | null): string {
  if (collection === "tv" && genre && TV_GENRE_SHADE[genre]) return TV_GENRE_SHADE[genre];
  return (collection && ACCENT[collection]) || "var(--tn-gold)";
}

const COLLECTION_LABEL: Record<string, string> = {
  tv: "TV",
  urheilu: "Urheilu",
  musiikki: "Musiikki",
  elokuvat: "Elokuvat",
  matkakohteet: "Matkakohteet",
  "tunnetut-henkilot": "Henkilöt",
  yleistieto: "Yleistieto",
};

const MODE_LABEL: Record<string, string> = {
  klassinen: "Klassinen",
  kumpi: "Kumpi?",
  jarjesta: "Järjestä",
  mega: "Mega",
};

export type QuizCardData = {
  id: string;
  slug: string;
  custom_slug?: string | null;
  display_title: string | null;
  title: string;
  teaser: string | null;
  collection: string | null;
  genre: string | null;
  genre_label?: string | null;
  badge: string | null;
  game_mode: string | null;
  question_count: number;
};

/** Genrekortti (TV, elokuvat, yleinen visakortti). */
export function QuizCard({ quiz, href }: { quiz: QuizCardData; href?: string }) {
  const accent = cardAccent(quiz.collection, quiz.genre);
  const variant = cardVariant(quiz.id);
  const title = quiz.display_title ?? quiz.title;
  const genreLabel = quiz.genre_label ?? quiz.genre;
  const meta = `${MODE_LABEL[quiz.game_mode ?? "klassinen"] ?? quiz.game_mode} · ${quiz.question_count} kys.`;
  const link = href ?? `/visa/${quiz.custom_slug ?? quiz.slug}`;

  return (
    <article className="tn-card" style={{ ["--tn-card-accent" as string]: accent }}>
      <a href={link} aria-label={title}>
        <div className="tn-card-face" data-variant={variant}>
          <div className="tn-card-motif">
            <Motif collection={quiz.collection} genre={quiz.genre} uid={quiz.id} />
          </div>
          <div className="tn-card-top">
            <span className="tn-chip">{COLLECTION_LABEL[quiz.collection ?? ""] ?? "Visa"}</span>
            {quiz.badge && (
              <span className="tn-badge" data-badge={quiz.badge}>
                {quiz.badge}
              </span>
            )}
          </div>
          {genreLabel && <div className="tn-card-genre">{genreLabel}</div>}
        </div>
      </a>
      <div>
        <div className="tn-card-title">{title}</div>
        {quiz.teaser && <div className="tn-card-teaser">{quiz.teaser}</div>}
        <div className="tn-card-meta">{meta}</div>
      </div>
    </article>
  );
}

/** Urheilukortti: laji-motiivi + joukkueen tunnusväri. EI tekstiä kortin sisällä
    (paitsi chip+badge) — nimi caption-tekstinä alla. */
export function SportCard({
  quiz,
  sport,
  teamColor,
  href,
}: {
  quiz: QuizCardData;
  sport: string;
  teamColor: string;
  href?: string;
}) {
  const variant = cardVariant(quiz.id);
  const title = quiz.display_title ?? quiz.title;
  const link = href ?? `/2-0/peli?quiz_id=${quiz.id}`;
  const meta = `${MODE_LABEL[quiz.game_mode ?? "klassinen"] ?? quiz.game_mode} · ${quiz.question_count} kys.`;

  return (
    <article className="tn-card" style={{ ["--tn-card-accent" as string]: teamColor }}>
      <a href={link} aria-label={title}>
        <div className="tn-card-face" data-variant={variant} data-kind="sport">
          <div className="tn-card-motif">
            <Motif collection="urheilu" genre={sport} uid={quiz.id} />
          </div>
          <div className="tn-card-top">
            <span className="tn-chip">Urheilu</span>
            {quiz.badge && (
              <span className="tn-badge" data-badge={quiz.badge}>
                {quiz.badge}
              </span>
            )}
          </div>
        </div>
      </a>
      <div>
        <div className="tn-card-title">{title}</div>
        {quiz.teaser && <div className="tn-card-teaser">{quiz.teaser}</div>}
        <div className="tn-card-meta">{meta}</div>
      </div>
    </article>
  );
}

export type PersonCardData = {
  id: string;
  slug: string | null;
  name: string;
  role: string | null;
  image_url: string | null;
  birth_date?: string | null;
  question_count?: number;
};

/** Henkilökortti: duotone-valokuva + nimi + tarkka ammatti + "5 kys.".
    Kuvan puuttuessa silhuetti — kortti ei voi jäädä syntymättä. */
export function PersonCard({
  person,
  dateChip,
  ageLabel,
  href,
}: {
  person: PersonCardData;
  dateChip?: string;
  ageLabel?: string;
  href?: string;
}) {
  const link = href ?? (person.slug ? `/sankari/${person.slug}` : "#");
  const meta = [person.role, `${person.question_count ?? 5} kys.`].filter(Boolean).join(" · ");

  return (
    <article className="tn-card">
      <a href={link} aria-label={person.name}>
        <div className="tn-person-face">
          {person.image_url ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="tn-person-photo" src={person.image_url} alt="" loading="lazy" />
              <div className="tn-person-tint" />
              {/* Henkilökuvat tulevat Wikipediasta (CC) — lähdemaininta on
                  lisenssiehto (Heikki 10.8.2026). Lisenssitiedot henkilön
                  Wikipedia-sivulla (linkki /sankari-sivulla). */}
              <span className="tn-person-credit" aria-hidden>📷 Wikipedia</span>
            </>
          ) : (
            <div className="tn-person-silhouette">
              <PersonSilhouette />
            </div>
          )}
          <div className="tn-person-shade" />
          {dateChip && (
            <span className="tn-chip tn-person-datechip" style={{ color: "var(--tn-amber)" }}>
              {dateChip}
            </span>
          )}
          {ageLabel && <div className="tn-person-foot">{ageLabel}</div>}
        </div>
      </a>
      <div>
        <div className="tn-card-title">{person.name}</div>
        <div className="tn-card-meta">{meta}</div>
      </div>
    </article>
  );
}
