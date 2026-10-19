// Rungon otsikkofontti next/font/localilla (runko vaihe 1, 19.10.2026): Barlow Condensed 700/800 latautui
// @fontsourcen kautta vasta näkyvän otsikon jälkeen, ja fonttivaihto siirsi osioita (CLS 0,065).
// next/font esilataa tiedostot ja tekee varafontille saman mitoituksen (adjustFontFallback) → CLS 0.
// Tiedostot samasta @fontsource-paketista (ei uutta riippuvuutta).
import localFont from "next/font/local";

export const runkoCond = localFont({
  src: [
    { path: "../../../../../node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../../../../../node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--rk-cond-font",
  display: "swap",
  fallback: ["Arial Narrow", "sans-serif"],
});
