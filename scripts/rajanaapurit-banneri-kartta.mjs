// RAJANAAPURIT — etusivun bannerin taustakartta (CD v0.2 3f, 27.9.2026): Keski-Eurooppa
// (lon 6–32, lat 41–52,5) pelin karttatyylillä, staattisena SVG:nä. Aja maat.json-päivityksen jälkeen:
//   node scripts/rajanaapurit-banneri-kartta.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const juuri = join(dirname(fileURLToPath(import.meta.url)), "../apps/tietoniekka");
const data = JSON.parse(readFileSync(join(juuri, "lib/rajanaapurit/maat.json"), "utf8"));
const merc = ([lon, lat]) => [6371 * lon * Math.PI / 180, -6371 * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360))];
const [x0, y1] = merc([6, 41]), [x1, y0] = merc([32, 52.5]);
const vb = [Math.round(x0), Math.round(y0), Math.round(x1 - x0), Math.round(y1 - y0)];
const ACT = ["#0E3A5C", "#1A5B80", "#0F6A74", "#1C8487", "#2F6E96"], DIM = ["#9DB2BD", "#AEC0C7", "#A3BAB8", "#B7C6CB", "#A6B6C3"];
const nakyy = (b) => b[2] >= vb[0] && b[0] <= vb[0] + vb[2] && b[3] >= vb[1] && b[1] <= vb[1] + vb[3];
const G = 6; // km — taustakuva on himmeä, karkeampi ruudukko riittää
function karkeista(d) {
  return d.split("z").map((rengas) => {
    const m = rengas.match(/^M(-?\d+) (-?\d+)l?(.*)$/);
    if (!m) return "";
    let x = +m[1], y = +m[2];
    const pts = [[x, y]];
    const l = (m[3].match(/-?\d+/g) ?? []).map(Number);
    for (let i = 0; i + 1 < l.length; i += 2) pts.push([(x += l[i]), (y += l[i + 1])]);
    const p = [];
    for (const [px, py] of pts) { const q = [Math.round(px / G) * G, Math.round(py / G) * G]; if (!p.length || p.at(-1)[0] !== q[0] || p.at(-1)[1] !== q[1]) p.push(q); }
    if (p.length < 3) return "";
    return `M${p[0][0]} ${p[0][1]}` + p.slice(1).map((q) => `L${q[0]} ${q[1]}`).join("") + "z";
  }).join("");
}
const polut = [
  ...data.tausta.filter((t) => nakyy(t.b)).map((t) => `<path d="${karkeista(t.d)}" fill="#EAE4D6" stroke="#CFC4AC" stroke-width="1.2"/>`),
  ...data.alueet.filter((a) => nakyy(a.b)).map((a) => {
    const eu = (a.rr ?? [a.r ?? a.m]).includes("Eurooppa");
    return `<path d="${karkeista(a.d)}" fill="${(eu ? ACT : DIM)[a.s ?? 0]}" stroke="${eu ? "#EFE9DC" : "#E6ECEC"}" stroke-width="1.6"/>`;
  }),
];
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(" ")}" preserveAspectRatio="xMidYMid slice" stroke-linejoin="round">${polut.join("")}</svg>`;
// SVG → webp (1520 px, ~40 kt): node -e "require('sharp')('banneri-kartta.svg',{density:110}).resize({width:1520}).webp({quality:70}).toFile('banneri-kartta.webp')"
writeFileSync(join(juuri, "public/20/rajanaapurit/banneri-kartta.svg"), svg);
console.log("banneri-kartta.svg", Math.round(svg.length / 1024), "kt,", polut.length, "aluetta, viewBox", vb.join(" "));
