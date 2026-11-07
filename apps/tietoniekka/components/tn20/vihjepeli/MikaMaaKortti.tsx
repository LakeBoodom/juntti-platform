// MIKÄ MAA? — kortti Karttapelit-kokoelmaan (CD-paketti 7.11.2026, 3a/3b). Kokoelman ainoa vaalea kortti: pala pelin
// kermaista lautaa tummalla sivulla. Kuvana kompassi (samat kahdeksan suuntanuolta kuin arvausrivillä) ja kysymysmerkki,
// koukkuna päivän vihje 1. Ensisijainen painike on lime-pilleri (UI-laatusääntö 5). Palvelinkomponentti.

const NUOLET = [0, 45, 90, 135, 180, 225, 270, 315];

/** Kompassi 240 × 240: katkoviivarengas, kahdeksan terrakottanuolta ja laivastonsininen kysymysmerkki. */
export function Kompassi({ className }: { className?: string }) {
  const c = 120, r = 91, ar = 23;
  return (
    <svg className={className} viewBox="0 0 240 240" role="img" aria-label="Kahdeksan suuntanuolta ja kysymysmerkki">
      <circle cx={c} cy={c} r={r} fill="none" stroke="#B7C9C5" strokeWidth={2} strokeDasharray="6 6" />
      {NUOLET.map((d) => {
        const rad = (d * Math.PI) / 180;
        const x = c + Math.sin(rad) * r, y = c - Math.cos(rad) * r;
        return (
          <g key={d} transform={`translate(${x} ${y})`}>
            <circle r={ar} fill="#B4532A" />
            <path d="M0 9.5V-7M-6 -1l6-6 6 6" transform={`rotate(${d})`} fill="none" stroke="#fff" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      })}
      <circle cx={c} cy={c} r={38} fill="#0E3A5C" />
      <text x={c} y={c + 17} textAnchor="middle" fontFamily="Archivo Variable, Archivo, sans-serif" fontWeight={900} fontSize={48} fill="#fff">?</text>
    </svg>
  );
}

export default function MikaMaaKortti({ href, paiva, vihje }: { href: string; paiva: string; vihje: string }) {
  return (
    <li className="kh-kortti kh-kortti--mm">
      <span className="kh-mm-kuva">
        <Kompassi className="kh-mm-kompassi" />
      </span>
      <div className="kh-teksti">
        <p className="kh-laji">Päivän maa · {paiva}</p>
        <h2 className="kh-nimi" style={{ ["--kh-lw" as string]: 4 }}>
          <a href={href} data-tn-entry="karttapelit:mika-maa">Mikä maa?</a>
        </h2>
        <p className="kh-mm-vihje">{vihje}</p>
        <div className="kh-toiminnot">
          <span className="kh-cta tn-cta-lime" aria-hidden="true">Arvaa maa</span>
        </div>
      </div>
    </li>
  );
}
