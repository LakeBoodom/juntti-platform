// JÄRJESTÄ — tuloksen jatko (CD 2d/3a, Heikki 2.11.2026): Seuraava rivi (lime) → jako samalla Jakoalueella kuin muissa
// peleissä → Uusi kierros. Oikean järjestyksen jälkeen saman rivin uusiminen olisi turhaa, joten kierros on uusi rivi.
import type { ReactNode } from "react";
import Jakoalue from "@/components/tn20/jako/Jakoalue";

export default function RiviJatko({
  seuraava,
  uusi,
  jako,
  lisa,
}: {
  /** Seuraava pakka; ei /oma-pakoissa. */
  seuraava?: string;
  uusi: { teksti: string; onClick: () => void; kesken?: boolean };
  jako: { teksti: string; url: string | null; natiiviOtsikko?: string };
  lisa?: ReactNode;
}) {
  return (
    <>
      {seuraava && <a className="jr-nappi" href={seuraava} data-tn-entry="tulos:seuraava-rivi">Seuraava rivi</a>}
      <Jakoalue className="jr-jako" id="jr-jako-h" otsikko="Haasta kaveri" waNappi="Jaa WhatsAppissa" teksti={jako.teksti} url={jako.url} natiiviOtsikko={jako.natiiviOtsikko} />
      <button type="button" className="jr-nappi2" onClick={uusi.onClick} disabled={uusi.kesken}>{uusi.kesken ? "Arvotaan…" : uusi.teksti}</button>
      {lisa}
    </>
  );
}
