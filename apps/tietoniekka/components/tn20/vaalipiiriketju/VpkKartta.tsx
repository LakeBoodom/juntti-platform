// VAALIPIIRIKETJU — reittikartta (CD 2j "TN-Vaalipiiriketju-kartta"): 13 vaalipiiriä, reitti
// solmuina ja viivoina, Ahvenanmaan lautta syaanina katkoviivana, Helsinki zoom-laatassa.
// Katselmus §2: viiva ei saa kulkea toisen solmun läpi → kaari, jos suora osuisi solmuun.
// Puhdas esityskomponentti (ei tilaa), toimii palvelimella ja selaimessa.
import { VAALIPIIRI_GEOM } from "@/lib/vaalit/geometria";
import type { VpkLinkki } from "@/lib/vaalipiiriketju";

/** Solmujen paikat, jotka CD siirsi keskipisteestä (Uusimaa, Varsinais-Suomi, Ahvenanmaa). */
const POS: Record<string, [number, number]> = { "02": [236, 668], "03": [96, 650], "05": [22, 684] };
const HKI: [number, number] = [192, 683.5];
const HKI_LAATTA: [number, number] = [343, 694];
const SOLMU_R = 15;
const GEOM = new Map(VAALIPIIRI_GEOM.map((g) => [g.k, g]));
const ZOOM = VAALIPIIRI_GEOM.filter((g) => ["01", "02", "06", "08"].includes(g.k));

type Tila = "ok" | "bad" | null;

const paikka = (k: string): [number, number] => (k === "01" ? HKI : POS[k] ?? [GEOM.get(k)!.cx, GEOM.get(k)!.cy]);
/** Solmun piirtopaikka (Helsinki laatassa). */
const solmunPaikka = (k: string): [number, number] => (k === "01" ? HKI_LAATTA : paikka(k));
const solmuVari = (t: Tila, neutraali: boolean) => (neutraali ? "#D6CEFF" : t === "ok" ? "#B6FF3C" : t === "bad" ? "#FF6B4A" : "#F5F0E6");

function etaisyys(p: [number, number], a: [number, number], b: [number, number]) {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

/** Suora, tai kaari jos jokin muu solmu on viivan tiellä: ohjauspiste poispäin lähimmästä esteestä. */
function viiva(a: [number, number], b: [number, number], esteet: Array<[number, number]>): string {
  const osuvat = esteet.filter((p) => etaisyys(p, a, b) < SOLMU_R + 7);
  if (!osuvat.length) return `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`;
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const pituus = Math.hypot(dx, dy) || 1;
  const [nx, ny] = [-dy / pituus, dx / pituus];
  const lahin = osuvat.reduce((x, p) => (etaisyys(p, a, b) < etaisyys(x, a, b) ? p : x));
  const h = (lahin[0] - a[0]) * nx + (lahin[1] - a[1]) * ny;
  const puoli = h > 0 ? -1 : 1;
  // Kaari kääntyy esteestä poispäin: poikkeama esteen kohdalla ≥ säde + väli − nykyinen etäisyys.
  // Toisen asteen Bézier poikkeaa kohdassa t määrän 2·t·(1−t)·k, kun ohjauspiste on k:n päässä.
  const t = Math.max(0.15, Math.min(0.85, ((lahin[0] - a[0]) * dx + (lahin[1] - a[1]) * dy) / (pituus * pituus)));
  const tarve = Math.max(SOLMU_R + 14 - Math.abs(h), 8);
  const kaari = Math.min(tarve / (2 * t * (1 - t)), pituus * 0.9);
  const [mx, my] = [(a[0] + b[0]) / 2 + nx * puoli * kaari, (a[1] + b[1]) / 2 + ny * puoli * kaari];
  return `M${a[0]} ${a[1]}Q${mx.toFixed(1)} ${my.toFixed(1)} ${b[0]} ${b[1]}`;
}

export default function VpkKartta({
  reitti,
  tilat = [],
  valit = [],
  nimet = true,
  neutraali = false,
  nimi,
}: {
  /** Geometrian avaimet (01–13) reitin järjestyksessä. */
  reitti: string[];
  tilat?: Tila[];
  /** Linkkien tyypit reitin peräkkäisten välillä (null = ei rajaa). */
  valit?: Array<VpkLinkki | null>;
  nimet?: boolean;
  neutraali?: boolean;
  /** Vaalipiirien nimet (aria ja solmujen nimilaput). */
  nimi: (k: string) => string;
}) {
  const reitilla = new Set(reitti);
  const solmut = reitti.map((k) => solmunPaikka(k));
  const jaksot = reitti.slice(0, -1).map((k, i) => {
    const [a, b] = [paikka(k), paikka(reitti[i + 1])];
    const esteet = solmut.filter((_, j) => j !== i && j !== i + 1);
    const t = valit[i] ?? null;
    return {
      d: viiva(a, b, esteet),
      vari: neutraali ? "#B4A5FF" : t === "lautta" ? "#22D3EE" : t ? "#B6FF3C" : "#FF6B4A",
      katko: neutraali ? undefined : t === "lautta" ? "3 9" : t ? undefined : "10 8",
      lautta: t === "lautta" && !neutraali ? [(a[0] + b[0]) / 2 - 6, (a[1] + b[1]) / 2 - 16] : null,
    };
  });
  const hki = reitti.indexOf("01");
  const aria = reitti.length
    ? `Reitti kartalla: ${reitti.map(nimi).join(", ")}`
    : `Tyhjä Suomen kartta, jossa ${VAALIPIIRI_GEOM.length} vaalipiirin rajat`;

  return (
    <svg className="vpk-kartta" viewBox="0 0 400 745" role="img" aria-label={aria}>
      {VAALIPIIRI_GEOM.map((g) => (
        <path key={g.k} d={g.d} fill={reitilla.has(g.k) ? "#2F2850" : "#211E29"} stroke="#131109" strokeWidth={1.6} strokeLinejoin="round" />
      ))}
      {jaksot.map((j, i) => (
        <g key={i}>
          <path d={j.d} fill="none" stroke="#131109" strokeWidth={10} strokeLinecap="round" />
          <path d={j.d} fill="none" stroke={j.vari} strokeWidth={5} strokeLinecap="round" strokeDasharray={j.katko} />
        </g>
      ))}
      {jaksot.map((j, i) =>
        j.lautta ? (
          <text key={`l${i}`} x={j.lautta[0]} y={j.lautta[1]} textAnchor="middle" fontSize={15} fontWeight={800} letterSpacing={1} fill="#8EE9F7" stroke="#131109" strokeWidth={4} paintOrder="stroke">
            LAUTTA
          </text>
        ) : null,
      )}
      {reitti.map((k, i) => {
        if (k === "01") return null;
        const [x, y] = paikka(k);
        const vasen = x > 250;
        return (
          <g key={k}>
            <circle cx={x} cy={y} r={SOLMU_R} fill={solmuVari(tilat[i] ?? null, neutraali)} stroke="#131109" strokeWidth={3} />
            <text x={x} y={y + 5.5} textAnchor="middle" fontSize={16} fontWeight={900} className="vpk-kartta-num" fill="#131109">
              {i + 1}
            </text>
            {nimet && (
              <text x={vasen ? x - 22 : x + 22} y={y + 5} textAnchor={vasen ? "end" : "start"} fontSize={14} fontWeight={700} fill="#F5F0E6" stroke="#131109" strokeWidth={4} paintOrder="stroke">
                {nimi(k)}
              </text>
            )}
          </g>
        );
      })}
      <g>
        <rect x={290} y={642} width={106} height={96} rx={10} fill="#131109" stroke={hki >= 0 ? "rgba(180,165,255,.7)" : "#3A3122"} strokeWidth={1.5} />
        <clipPath id="vpk-hki">
          <rect x={291} y={643} width={104} height={94} rx={9} />
        </clipPath>
        <g clipPath="url(#vpk-hki)">
          <g transform="translate(343 692) scale(5) translate(-192 -683.5)">
            {ZOOM.map((g) => (
              <path key={g.k} d={g.d} fill={g.k === "01" ? (hki >= 0 ? "#5A4F96" : "#3A3452") : reitilla.has(g.k) ? "#2F2850" : "#211E29"} stroke="#131109" strokeWidth={0.4} />
            ))}
          </g>
        </g>
        {hki >= 0 && (
          <g>
            <circle cx={HKI_LAATTA[0]} cy={HKI_LAATTA[1]} r={SOLMU_R} fill={solmuVari(tilat[hki] ?? null, neutraali)} stroke="#131109" strokeWidth={3} />
            <text x={HKI_LAATTA[0]} y={HKI_LAATTA[1] + 6} textAnchor="middle" fontSize={16} fontWeight={900} className="vpk-kartta-num" fill="#131109">
              {hki + 1}
            </text>
          </g>
        )}
        <text x={300} y={660} fontSize={11} fontWeight={800} letterSpacing={1} fill="#A79E8C">
          HELSINKI
        </text>
        <line x1={196} y1={686} x2={290} y2={700} stroke="#4A4462" strokeWidth={1} strokeDasharray="3 3" />
      </g>
    </svg>
  );
}
