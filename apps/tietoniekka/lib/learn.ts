// Visan learn-rakenne (quizzes.learn). Pelinäkymä käyttää intro-kenttää aloitusnäkymän ja metan
// kuvauksena. Erillinen "pähkinänkuoressa"-aiheopas (LearnArticle) poistettiin 19.10.2026 (Heikki:
// sivustolla ei ole erillisiä hakukonetekstejä).
export type Learn = {
  intro?: string;
  heading?: string;
  key_facts?: Array<{ k: string; v: string; qi?: number }>;
  title?: string;
  sections?: Array<{ h: string; p: string[] }>;
  faq?: Array<{ q: string; a: string }>;
  sources?: Array<{ name: string; url: string }>;
  last_reviewed?: string;
};
