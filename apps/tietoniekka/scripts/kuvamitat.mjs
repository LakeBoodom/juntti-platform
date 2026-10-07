// Visakuvien mitat (handoff "Visan pääkuva mobiili" 7.10.2026): mobiiliheron tila päätetään
// kuvan leveydestä ja sivusuhteesta ilman kuvan latausta. Ajetaan prebuildissa, joten uudet
// public/20-kuvat tulevat mukaan automaattisesti. Jos sharp tai lukeminen epäonnistuu,
// vanha lib/kuvamitat.json jää voimaan (build ei kaadu).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const juuri = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(juuri, "public");
const ulos = path.join(juuri, "lib", "kuvamitat.json");

const tiedostot = [];
const kay = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) kay(p);
    else if (/\.(webp|jpe?g|png|avif)$/i.test(e.name)) tiedostot.push(p);
  }
};

try {
  const { default: sharp } = await import("sharp");
  kay(path.join(pub, "20"));
  const mitat = {};
  for (const t of tiedostot.sort()) {
    const m = await sharp(t).metadata();
    if (m.width && m.height) mitat["/" + path.relative(pub, t).split(path.sep).join("/")] = [m.width, m.height];
  }
  fs.writeFileSync(ulos, JSON.stringify(mitat, null, 0).replace(/\],"/g, '],\n"') + "\n");
  console.log(`kuvamitat: ${Object.keys(mitat).length} kuvaa → lib/kuvamitat.json`);
} catch (e) {
  console.warn("kuvamitat: ohitettu,", e instanceof Error ? e.message : e);
}
