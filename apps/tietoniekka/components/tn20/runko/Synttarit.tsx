// V4 TUNNUSOSA "synttarit" (runko vaihe 3, Tunnetut henkilöt; brief §3: "Tänään ja tulevat synttärit",
// vaakarivi). 12 lähintä syntymäpäivää Suomen ajan päivästä; kortti vie henkilösivulle. Kasvokuvat omista
// kopioista (henkiloKuva), kuvaton → nimikirjaimet.
import type { Synttari } from "@/lib/kokoelmat/henkilot";

const kirjaimet = (n: string) => n.split(/\s+/).map((s) => s[0]).slice(0, 2).join("");

export default function Synttarit({ lista }: { lista: Synttari[] }) {
  if (!lista.length) return null;
  return (
    <section className="rk-v4" aria-labelledby="rk-v4-h">
      <div className="rk-v4-in">
        <span className="rk-v4-eyebrow">Synttärisankarit</span>
        <h2 id="rk-v4-h" className="rk-h2">Tänään ja tulevat synttärit</h2>
        <ol className="rk-synt">
          {lista.map((s) => (
            <li key={s.href}>
              <a href={s.href}>
                <span className="rk-synt-kuva" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {s.kuva ? <img src={s.kuva} alt="" loading="lazy" /> : <span>{kirjaimet(s.nimi)}</span>}
                </span>
                <span className="rk-synt-pvm" data-tanaan={s.paiva === "Tänään" || undefined}>{s.paiva}</span>
                <span className="rk-synt-nimi">{s.nimi}</span>
                <span className="rk-synt-ika">{s.ika} vuotta</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
