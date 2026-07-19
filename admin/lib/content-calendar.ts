// Sisältökalenterin resoluutio: mikä visa/synttärisankari/tapahtuma on live minäkin päivänä.
// Kutsuja (esim. /kalenteri-sivu) hakee kaikki tarvittavat rivit KERRAN koko aikavälille,
// ja tätä funktiota kutsutaan silmukassa per päivä (ei N+1-kyselyitä).
//
// Postgres-gotcha: LIKE/ILIKE ei toimi DATE-sarakkeille kk/pv-täsmäytykseen.
// Siksi kaikki celebrities/countdowns-rivit haetaan valmiiksi ja suodatetaan JS:ssä
// (sama malli kuin admin/app/synttarit/page.tsx).

const PINNALLA_HORIZON_DAYS = 45;
const MS_DAY = 86400000;

export type CalendarQuiz = {
  id: string;
  title: string;
  category: string;
};

export type CalendarCelebrity = {
  id: string;
  name: string;
  role: string;
  image_url: string | null;
  birth_date: string;
  death_date: string | null;
};

export type CalendarCountdown = {
  id: string;
  name: string;
  emoji: string | null;
  status: "upcoming" | "today" | "ongoing";
  quizId: string | null;
  quizTitle: string | null;
};

export type CalendarDay = {
  date: string; // ISO YYYY-MM-DD
  quiz: CalendarQuiz | null;
  celebrity: CalendarCelebrity | null;
  countdown: CalendarCountdown | null;
};

// ── Raakadata-tyypit (poimittu Supabasesta ilman regeneroituja tyyppejä) ──

export type RawQuizRow = {
  id: string;
  title: string;
  category: string;
  status: string;
};

export type RawCelebrityRow = {
  id: string;
  name: string;
  role: string;
  image_url: string | null;
  birth_date: string; // YYYY-MM-DD
  death_date: string | null;
  priority: number | null;
  platform: string | null;
};

export type RawCountdownRow = {
  id: string;
  name: string;
  month: number;
  day: number;
  starts_on: string | null;
  ends_on: string | null;
  image_url: string | null;
  emoji: string | null;
  tag: string | null;
};

export type RawCountdownQuizRow = {
  countdown_id: string;
  quiz_id: string;
  sort_order: number;
};

export type RawScheduleRuleRow = {
  content_type: string;
  content_id: string;
  strategy: string;
  scheduled_date: string | null;
  active: boolean;
};

export type ResolveInputs = {
  quizzes: RawQuizRow[];
  celebrities: RawCelebrityRow[];
  countdowns: RawCountdownRow[];
  countdownQuizzes: RawCountdownQuizRow[];
  scheduleRules: RawScheduleRuleRow[];
};

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Resolvoi päivän visa: schedule_rules (content_type=quiz, strategy=date, scheduled_date=iso). */
function resolveQuiz(
  iso: string,
  quizzes: RawQuizRow[],
  scheduleRules: RawScheduleRuleRow[],
): CalendarQuiz | null {
  const quizMap = new Map(quizzes.map((q) => [q.id, q]));
  const rule = scheduleRules.find(
    (r) =>
      r.active &&
      r.content_type === "quiz" &&
      r.strategy === "date" &&
      r.scheduled_date === iso,
  );
  if (!rule) return null;
  const quiz = quizMap.get(rule.content_id);
  if (!quiz) return null;
  return { id: quiz.id, title: quiz.title, category: quiz.category };
}

/**
 * Resolvoi päivän synttärisankari: kandidaatit joiden birth_date kk/pv täsmää,
 * valitaan pienin priority (99 = piilotettu, suljetaan pois), tasapelissä nimen mukaan.
 */
function resolveCelebrity(
  iso: string,
  celebrities: RawCelebrityRow[],
): CalendarCelebrity | null {
  const [, mStr, dStr] = iso.split("-");
  const month = Number(mStr);
  const day = Number(dStr);

  const candidates = celebrities.filter((c) => {
    if (!c.birth_date) return false;
    const [, cm, cd] = c.birth_date.split("-").map(Number);
    if (cm !== month || cd !== day) return false;
    const priority = c.priority ?? 50;
    return priority !== 99;
  });

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    const pa = a.priority ?? 50;
    const pb = b.priority ?? 50;
    if (pa !== pb) return pa - pb;
    return a.name.localeCompare(b.name, "fi");
  });

  const winner = candidates[0];
  return {
    id: winner.id,
    name: winner.name,
    role: winner.role,
    image_url: winner.image_url,
    birth_date: winner.birth_date,
    death_date: winner.death_date,
  };
}

/**
 * Resolvoi countdown-tapahtuman tietylle päivälle. Porttaus
 * apps/tietoniekka/lib/queries.ts:n getPinnallaEvents-logiikasta,
 * mutta suhteessa mielivaltaiseen target-päivään "tänään"-oletuksen sijaan.
 */
function resolveCountdown(
  iso: string,
  countdowns: RawCountdownRow[],
  countdownQuizzes: RawCountdownQuizRow[],
  quizzes: RawQuizRow[],
): CalendarCountdown | null {
  const target = parseIsoDate(iso);
  const quizMap = new Map(quizzes.map((q) => [q.id, q]));

  const active: {
    row: RawCountdownRow;
    status: "upcoming" | "today" | "ongoing";
    daysUntil: number;
    rotationDay: number;
  }[] = [];

  for (const row of countdowns) {
    let status: "upcoming" | "today" | "ongoing";
    let daysUntil = 0;
    let rotationDay = Math.floor(target.getTime() / MS_DAY);

    if (row.starts_on) {
      const start = new Date(`${row.starts_on}T00:00:00`);
      const end = row.ends_on ? new Date(`${row.ends_on}T00:00:00`) : start;
      if (target.getTime() > end.getTime()) continue; // tapahtuma ohi tuolloin
      if (target.getTime() < start.getTime()) {
        daysUntil = Math.round((start.getTime() - target.getTime()) / MS_DAY);
        status = "upcoming";
      } else {
        const singleDay = end.getTime() === start.getTime();
        status = singleDay && target.getTime() === start.getTime() ? "today" : "ongoing";
        rotationDay = Math.round((target.getTime() - start.getTime()) / MS_DAY);
      }
    } else {
      // Vuosittainen month/day — etsi lähin esiintymä target-päivän suhteen
      const candidateThisYear = new Date(target.getFullYear(), row.month - 1, row.day);
      let next = candidateThisYear;
      if (next.getTime() < target.getTime()) {
        next = new Date(target.getFullYear() + 1, row.month - 1, row.day);
      }
      daysUntil = Math.round((next.getTime() - target.getTime()) / MS_DAY);
      status = daysUntil === 0 ? "today" : "upcoming";
    }
    if (status === "upcoming" && daysUntil > PINNALLA_HORIZON_DAYS) continue;

    active.push({ row, status, daysUntil, rotationDay });
  }

  if (active.length === 0) return null;

  // Käynnissä/tänään ensin, sitten lähimmät — sama järjestys kuin getPinnallaEvents
  active.sort((a, b) => {
    const aOn = a.status !== "upcoming" ? 0 : 1;
    const bOn = b.status !== "upcoming" ? 0 : 1;
    return aOn - bOn || a.daysUntil - b.daysUntil;
  });

  // Kalenterinäkymässä näytetään vain "today"/"ongoing" tapahtuma sille päivälle
  // (upcoming ei ole vielä "live" sisältöä some-postausta varten).
  const winner = active.find((e) => e.status !== "upcoming");
  if (!winner) return null;

  const attached = countdownQuizzes
    .filter((cq) => cq.countdown_id === winner.row.id)
    .filter((cq) => quizMap.get(cq.quiz_id)?.status === "published")
    .sort((a, b) => a.sort_order - b.sort_order);

  let quizId: string | null = null;
  let quizTitle: string | null = null;
  if (attached.length > 0) {
    const idx = ((winner.rotationDay % attached.length) + attached.length) % attached.length;
    const q = quizMap.get(attached[idx].quiz_id);
    if (q) {
      quizId = q.id;
      quizTitle = q.title;
    }
  }

  return {
    id: winner.row.id,
    name: winner.row.name,
    emoji: winner.row.emoji,
    status: winner.status,
    quizId,
    quizTitle,
  };
}

/** Resolvoi kaiken kolmesta lähteestä yhdelle päivälle. */
export function resolveCalendarDay(
  siteId: string,
  isoDate: string,
  inputs: ResolveInputs,
): CalendarDay {
  return {
    date: isoDate,
    quiz: resolveQuiz(isoDate, inputs.quizzes, inputs.scheduleRules),
    celebrity: resolveCelebrity(isoDate, inputs.celebrities),
    countdown: resolveCountdown(
      isoDate,
      inputs.countdowns,
      inputs.countdownQuizzes,
      inputs.quizzes,
    ),
  };
}
