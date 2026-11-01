// RAJANAAPURIT: YHDYSVALLAT — etusivun kortin taustakartta (CD "Rajanaapurit Yhdysvallat etusivun bannerit" 8b, 1.11.2026).
// Oma aineisto (lib/rajanaapurit/osavaltiot.json) → public/20/rajanaapurit/etusivu-usa.svg. Kortin reitti Texas → Oklahoma →
// ? → Iowa: lähtö ja maali tiilenpunaisella, Oklahoma vaaleammalla, muut viisi tummaa sävyä CD:n peittävyydellä.
//
//   node scripts/rajanaapurit-etusivukuva.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const juuri = join(dirname(fileURLToPath(import.meta.url)), "../apps/tietoniekka");
const d = JSON.parse(readFileSync(join(juuri, "lib/rajanaapurit/osavaltiot.json"), "utf8"));
const SAVYT = ["#0E3A5C", "#1A5B80", "#0F6A74", "#1C8487", "#2F6E96"];
const KOROSTUS = { TX: "#C2492F", IA: "#C2492F", OK: "#E08A72" };
// Rajaus 370 × 155 (2,39:1): reitti keskellä, itärannikko mukana. Yksikkö km.
const [W, H] = [3400, 1424];
const [x0, y0] = [-1000 - 130, -780];
const nakyy = (b) => b[2] >= x0 && b[0] <= x0 + W && b[3] >= y0 && b[1] <= y0 + H;
const polut = d.alueet.filter((a) => nakyy(a.b)).map((a, i) => {
  const k = KOROSTUS[a.k];
  return `<path d="${a.d}" fill="${k ?? SAVYT[i % SAVYT.length]}" fill-opacity="${k ? 1 : 0.85}" stroke="#F4EFE4" stroke-width="${k ? 7 : 5}" stroke-linejoin="round"/>`;
});
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0} ${y0} ${W} ${H}" width="740" height="310"><g opacity=".44">${polut.join("")}</g></svg>\n`;
writeFileSync(join(juuri, "public/20/rajanaapurit/etusivu-usa.svg"), svg);
console.log(`${polut.length} osavaltiota, ${Math.round(svg.length / 1024)} kt`);
