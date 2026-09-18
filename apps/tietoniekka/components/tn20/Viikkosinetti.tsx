// VIIKKOVISA — 10A SINETTI (Claude Design, kierrokset 10A ja 11; valittu 18.9.2026).
//
// Kaksi osaa, sama järjestelmä:
//  - ViikkoMerkki: syaani numerolohko + "Viikkovisa / uusi maanantaina".
//    Toimii yksin ilman kategoriaa (designin sääntö "merkki toimii yksin").
//  - ViikkoMerkkirivi: merkki + kategoriapilleri SISARUKSINA samassa
//    flex-rivissä, ei merkin sisällä — sama merkki kelpaa Musiikille ilman
//    uutta väriä tai komponenttia.
//  - ViikkoSinetti: kierroksen 11 kuusikulmainen sinetti aloitusnäkymään
//    (sädekehä, hehkuva reunus, VKO + numero + päivämääräväli).
//
// Säännöt (design): viikkonumero on merkin isoin elementti; aksentti on
// merkki, hairline, hehku ja ääriviivanappi — ei koskaan täytetty nappi;
// kategorialla ei ole omaa väriä. Ei arkistokieltä, ei viikkovalitsinta.
// Tyylit: app/(tn20)/viikkovisa.css (.vv-*).

type Koko = "s" | "m" | "l";

export function ViikkoMerkki({ viikko, koko = "m" }: { viikko: number; koko?: Koko }) {
  return (
    <span className="vv-merkki" data-koko={koko}>
      <span className="vv-merkki-nro">{viikko}</span>
      <span className="vv-merkki-teksti">
        <span className="vv-merkki-nimi">Viikkovisa</span>
        <span className="vv-merkki-uusi">Uusi maanantaina</span>
      </span>
    </span>
  );
}

export function ViikkoMerkkirivi({ viikko, kategoria, koko = "m" }: { viikko: number; kategoria?: string; koko?: Koko }) {
  return (
    <span className="vv-merkkirivi" data-koko={koko}>
      <ViikkoMerkki viikko={viikko} koko={koko} />
      {kategoria && <span className="vv-pilleri">{kategoria}</span>}
    </span>
  );
}

export function ViikkoSinetti({ viikko, vali }: { viikko: number; vali: string }) {
  return (
    <div className="vv-sinetti" aria-hidden="true">
      <span className="vv-sinetti-sateet" />
      <span className="vv-sinetti-hehku" />
      <span className="vv-sinetti-reuna">
        <span className="vv-sinetti-sisus">
          <span className="vv-sinetti-vko">Vko</span>
          <span className="vv-sinetti-nro">{viikko}</span>
          <span className="vv-sinetti-viiva" />
          <span className="vv-sinetti-vali">{vali}</span>
        </span>
      </span>
    </div>
  );
}

/** Kategorian kuvake (kuva-ikoni designin 11A:sta). */
export function KuvatIkoni({ size = 26, stroke = "#0B0904" }: { size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="8.6" cy="9.6" r="1.7" />
      <path d="M3.6 17.4 9 12.6l4.2 3.6 3.1-2.6 4.1 3.4" />
    </svg>
  );
}
