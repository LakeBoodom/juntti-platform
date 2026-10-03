// Aihesivujen "Muut …" -laatat (erä B4): 6 kuvalaattaa (desktop ruudukko, mobiili vaakavieritys).
// Kuvaton = nimikirjaimet samalla violetilla pohjalla (design 3a, Kovalainen-esimerkki).
export type SukulaisLaatta = { href: string; name: string; image_url: string | null; ala: string };

const nimikirjaimet = (n: string) =>
  n
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function SukulaisLaatat({
  otsikko,
  laatat,
  kaikki,
}: {
  otsikko: string;
  laatat: SukulaisLaatta[];
  kaikki?: { n: number; href: string | null };
}) {
  if (!laatat.length) return null;
  return (
    <section className="hub-laatat" aria-label={otsikko}>
      <div className="hub-laatat-head">
        <h2 className="hub-h3">{otsikko}</h2>
        {kaikki &&
          (kaikki.href ? (
            <a className="hub-laatat-kaikki" href={kaikki.href}>
              Kaikki {kaikki.n} →
            </a>
          ) : (
            <span className="hub-laatat-n">{kaikki.n}</span>
          ))}
      </div>
      <ul className="hub-laatat-lista">
        {laatat.map((l) => (
          <li key={l.href}>
            <a href={l.href} className="hub-laatta">
              <span className="hub-laatta-kuva">
                {l.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.image_url} alt="" loading="lazy" />
                ) : (
                  <span className="hub-laatta-ini" aria-hidden="true">
                    {nimikirjaimet(l.name)}
                  </span>
                )}
                <span className="hub-duotone" aria-hidden="true" />
              </span>
              <span className="hub-laatta-nimi">{l.name}</span>
              {l.ala && <span className="hub-laatta-ala">{l.ala}</span>}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
