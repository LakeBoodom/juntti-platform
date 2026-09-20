# public/ — vain käytössä olevat tiedostot

Tämä kansio kulkee mukana **jokaisessa** Vercel-deploymentissa, joten
käyttämätön tiedosto maksaa tallennustilaa niin monta kertaa kuin
deploymentteja on säilössä. Tietoniekka 1.0:n kuvat (30 PNG, 51 MB)
poistettiin täältä 20.9.2026, koska niihin ei viitannut koodi, kanta
eikä 2.0-sivusto.

Sisältö:

- `20/` — 2.0-sivuston kuvat (`/20/<kokoelma>/<slug>.webp`, 640×360;
  herot 1600 px). Visan kuva tulee kannasta: `quizzes.hero_image`.
- `og-image.png` — jaettavan linkin esikatselukuva (`app/layout.tsx`).
- `icon-192.png`, `icon-512.png` — sovellusikonit (`app/manifest.ts`).

Ennen uuden tiedoston lisäämistä: tarkista että siihen todella
viitataan, ja pakkaa kuvat WebPiksi (kortit 640×360, q82).
