// JÄRJESTÄ — tuloksen jatko (CD 2d/3a, Heikki 2.11.2026): Seuraava rivi (lime) → jako samalla Jakoalueella kuin muissa
// peleissä → Uusi kierros. Oikean järjestyksen jälkeen saman rivin uusiminen olisi turhaa, joten kierros on uusi rivi.
import type { ReactNode } from "react";
import Jakoalue from "@/components/tn20/jako/Jakoalue";
import { KaveriVertailu } from "@/components/tn20/kaveri/Kaveri";
import type { KaverinTulos, OmaTulos } from "@/lib/kaveri";

export default function RiviJatko({
  seuraava,
  uusi,
  jako,
  lisa,
  vertailu,
}: {
  /** Seuraava pakka; ei /oma-pakoissa. */
  seuraava?: string;
  uusi: { teksti: string; onClick: () => void; kesken?: boolean };
  jako: { teksti: string; url: string | null; natiiviOtsikko?: string };
  lisa?: ReactNode;
  /** Haastetun polku (v4 §5): oma ja kaverin tulos rinnakkain ennen jatkoa; jako on vastahaaste. */
  vertailu?: { oma: OmaTulos; kaveri: KaverinTulos } | null;
}) {
  return (
    <>
      {vertailu && <KaveriVertailu oma={vertailu.oma} kaveri={vertailu.kaveri} taso="h2" />}
      {seuraava && <a className="jr-nappi" href={seuraava} data-tn-entry="tulos:seuraava-rivi">Seuraava rivi</a>}
      <Jakoalue className="jr-jako" id="jr-jako-h" otsikko={vertailu ? "Lähetä vastahaaste" : "Haasta kaveri"} waNappi="Jaa WhatsAppissa" teksti={jako.teksti} url={jako.url} natiiviOtsikko={jako.natiiviOtsikko} />
      <button type="button" className="jr-nappi2" onClick={uusi.onClick} disabled={uusi.kesken}>{uusi.kesken ? "Arvotaan…" : uusi.teksti}</button>
      {lisa}
    </>
  );
}
