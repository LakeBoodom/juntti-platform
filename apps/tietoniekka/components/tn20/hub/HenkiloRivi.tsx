// Hakemistorivi (erä B3, design 3e): 44 px kuva, nimi, "Rooli · ikä", nuoli. Kuvaton = nimikirjaimet.
export type HenkiloRiviData = { href: string; name: string; meta: string; image_url: string | null };

export default function HenkiloRivi({ r }: { r: HenkiloRiviData }) {
  return (
    <a className="hk-rivi" href={r.href}>
      <span className="hk-rivi-kuva">
        {r.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.image_url} alt="" loading="lazy" />
        ) : (
          <span className="hub-laatta-ini" aria-hidden="true">
            {r.name
              .split(/\s+/)
              .map((w) => w[0])
              .join("")
              .slice(0, 2)}
          </span>
        )}
        <span className="hub-duotone" aria-hidden="true" />
      </span>
      <span className="hk-rivi-teksti">
        <span className="hk-rivi-nimi">{r.name}</span>
        {r.meta && <span className="hk-rivi-meta">{r.meta}</span>}
      </span>
      <span className="hk-rivi-nuoli" aria-hidden="true">
        ›
      </span>
    </a>
  );
}
