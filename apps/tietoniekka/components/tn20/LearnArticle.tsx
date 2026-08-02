// TIETOMEDIA — aiheopas ("pähkinänkuoressa" + UKK + lähteet).
// Jaettu komponentti: page.tsx renderöi SSR-kopion hakukoneille
// (piilotetaan selaimessa, luokka tn-learn-ssr) ja GameClient näyttää
// saman sisällön loppunäkymässä kohdassa 5 (Heikin järjestys 2.8.2026).

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

export function LearnArticle({
  learn,
  fallbackTitle,
  accent,
  ssr,
}: {
  learn: Learn;
  fallbackTitle: string;
  accent: string;
  ssr?: boolean;
}) {
  if (!learn.sections || learn.sections.length === 0) return null;
  return (
    <section
      id={ssr ? "opas" : undefined}
      className={`tn-learn${ssr ? " tn-learn-ssr" : ""}`}
      style={{ ["--tn-game-accent" as string]: accent }}
    >
      <div className="tn-learn-in">
        <h2 className="tn-learn-title">{learn.title ?? `${fallbackTitle} pähkinänkuoressa`}</h2>
        {learn.sections.map((s) => (
          <div key={s.h} className="tn-learn-sec">
            <h3>{s.h}</h3>
            {s.p.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        ))}
        {/* Pikafaktat: vain SSR-kopiossa. Loppunäkymässä samat faktat
            näytetään henkilökohtaistettuina ("✓ Tiesit tämän") kohdassa 3,
            joten client-kopioon niitä ei toisteta. Kysymys→vastaus-muoto on
            se, jonka hakukoneet ja kielimallit poimivat. (§13.3) */}
        {ssr && learn.key_facts && learn.key_facts.length > 0 && (
          <div className="tn-learn-sec">
            <h3>Pikafaktat</h3>
            <dl className="tn-learn-facts">
              {learn.key_facts.map((f) => (
                <div key={f.k} className="tn-learn-fact">
                  <dt>{f.k}</dt>
                  <dd>{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
        {learn.faq && learn.faq.length > 0 && (
          <div className="tn-learn-sec">
            <h3>Usein kysyttyä</h3>
            {learn.faq.map((f) => (
              <div key={f.q} className="tn-learn-faq">
                <h4>{f.q}</h4>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        )}
        {learn.sources && learn.sources.length > 0 && (
          <div className="tn-learn-sources">
            <span>Lähteet:</span>{" "}
            {learn.sources.map((src, i) => (
              <span key={src.url}>
                {i > 0 && " · "}
                <a href={src.url} target="_blank" rel="noopener noreferrer">{src.name}</a>
              </span>
            ))}
            {learn.last_reviewed && <span className="tn-learn-date"> · Tarkistettu {learn.last_reviewed.split("-").reverse().join(".")}</span>}
          </div>
        )}
      </div>
    </section>
  );
}
