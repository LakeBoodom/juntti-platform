// TIETONIEKKA 2.0 — leveä visakortti (CD:n hub-design 2026-07-31)
// "Kortti oli liian dominoiva, visa jäi varjoon" → 16:9 väripesu + pieni motiivi,
// visan nimi isolla KORTIN ALLA omassa tekstiosassa. Väri = currentColor-tekniikka.

export type WideCardProps = {
  href: string;
  color: string;          // kortin aksentti (joukkueväri / genren sävy / kokoelma)
  motifPath: string;      // MOTIF_PATHS-polku (viewBox 0 0 200 260)
  genreChip: string;      // esim. "Rikosdraama" | "Liiga · Tappara"
  title: string;          // visan nimi — pääosassa
  desc?: string | null;   // teaser
  mode: string;           // "Klassinen" | "Kumpi?" | ...
  meta: string;           // "10 kysymystä" (+ pelattu-määrä kun dataa)
  badge?: string | null;
};

export function WideCard({ href, color, motifPath, genreChip, title, desc, mode, meta, badge }: WideCardProps) {
  return (
    <a className="tn-wide" href={href} style={{ color }}>
      <div className="tn-wide-box">
        <div className="tn-wide-visual">
          <div className="tn-wide-wash" />
          <div className="tn-wide-glowspot" />
          <svg viewBox="0 0 200 260" className="tn-wide-motif" aria-hidden>
            <path d={motifPath} fill="none" stroke="currentColor" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="tn-wide-fade" />
          <span className="tn-wide-genre">{genreChip}</span>
          {badge && (
            <span className="tn-badge tn-wide-badge" data-badge={badge}>
              {badge}
            </span>
          )}
        </div>
        <div className="tn-wide-body">
          <div className="tn-wide-title">{title}</div>
          {desc && <div className="tn-wide-desc">{desc}</div>}
          <div className="tn-wide-meta">
            <span style={{ color: "currentColor" }}>{mode}</span>
            <span className="tn-wide-dot">·</span>
            <span>{meta}</span>
          </div>
        </div>
      </div>
    </a>
  );
}
