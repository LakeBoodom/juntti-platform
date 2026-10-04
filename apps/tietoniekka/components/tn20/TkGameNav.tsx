// Jaettu Ikäjärjestyksen ja Laita järjestykseen -pelin kesken (siirretty IkajarjestysClientistä 3.10.2026).

// NAVIGAATIOKORJAUS (2026-09-17, Heikin live-QA-löydös): pelisivulta puuttui
// kokonaan tie takaisin muualle sivustoon — TopBar piiloutuu /peli-poluilla
// (pelikuoren omat logosäännöt, ks. TopBar-kommentti), ja tavallinen visa
// (GameClient.tsx) korvaa sen omalla tng-top-HUD:llaan, mutta Ikäjärjestys
// jäi ilman kumpaakaan. Kevyt oma paluulinkki kaikkiin kolmeen vaiheeseen
// (aloitus, järjestäminen, paljastus+tulos) — ei täyttä HUD:ia, koska
// Ikäjärjestyksellä ei ole tavallisen visan kysymyslaskuria/putkea.
export function TkGameNav() {
  return (
    <nav className="tk-gamenav" aria-label="Sivuston navigaatio">
      <a className="tk-gamenav-home" href="/" aria-label="Tietoniekka etusivu">
        <b>TIETO</b>
        <span>NIEKKA</span>
      </a>
    </nav>
  );
}
