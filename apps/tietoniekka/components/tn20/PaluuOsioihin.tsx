// PALUULINKKI OSIOVALINTAAN (UI-laatu kokoelmat kierros 2, 19.10.2026).
// Pitkillä teemasivuilla (jääkiekko ≈ 15 000 px, jalkapallo ≈ 14 300 px, tiede ≈ 10 600 px mobiilissa)
// jokaisen erän/lohkon lopussa linkki takaisin osiovalintaan. Mobiilissa (≤ 768 px) osiovalinta on
// MobiiliLista, työpöydällä sivun oma osionavigaatio → kaksi linkkiä, joista näkyy vain oikea.
export function PaluuOsioihin({ label, mobId, deskId }: { label: string; mobId: string; deskId: string }) {
  return (
    <p className="tn-paluu">
      <a className="tn-paluu-mob" href={`#${mobId}`}>
        <span aria-hidden="true">↑</span> {label}
      </a>
      <a className="tn-paluu-desk" href={`#${deskId}`}>
        <span aria-hidden="true">↑</span> {label}
      </a>
    </p>
  );
}
