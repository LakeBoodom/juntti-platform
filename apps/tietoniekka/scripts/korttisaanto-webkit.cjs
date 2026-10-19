// KORTTISÄÄNTÖ WebKitillä (Safarin moottori) — Heikki 19.10.2026: Chromium ei riitä, koska Safari ei
// katkaise yhdysmerkistä word-break: keep-all -otsikoissa ("HÄMÄHÄKKIMIES-ELOKUVAT" leikkautui iPhonessa).
// Mittaa rungolla olevat kokoelmasivut leveyksillä 320/375/390/430 (Range-pohjainen, ks. CLAUDE.md).
// Käyttö (playwright ei ole repon riippuvuus — asenna erilliseen kansioon):
//   mkdir -p /tmp/wk && cd /tmp/wk && npm i playwright@1.56.1 && npx playwright install webkit
//   NODE_PATH=/tmp/wk/node_modules node apps/tietoniekka/scripts/korttisaanto-webkit.cjs <perus-URL> [sivu,sivu,...]
const { webkit } = require("playwright");
const BASE = process.argv[2];
const SIVUT = (process.argv[3] || "tv,elokuvat,musiikki,matkakohteet,kulttuuri,euroviisut").split(",");
const LEVEYDET = [320, 375, 390, 430];
const SEL = ".rk-h1,.rk-h2,.rk-b-nimi,.rk-a-nimi,.rk-c-nimi,.rk-peli-nimi,.rk-kokoelma-nimi,.rk-chip,.rk-cta,.rk-cta-selite,.rk-ingress,.rk-eyebrow,.tn-card-cta,.tn-card-meta";
(async () => {
  const b = await webkit.launch();
  let virheita = 0;
  for (const s of SIVUT) for (const w of LEVEYDET) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const p = await ctx.newPage();
    const r = await p.goto(`${BASE}/kokoelma/${s}`, { waitUntil: "networkidle" });
    if (r.status() !== 200) { console.log(s, w, "HTTP", r.status()); await ctx.close(); continue; }
    await p.evaluate(() => document.fonts.ready);
    const tulos = await p.evaluate((SEL) => {
      document.querySelectorAll(".rk-yli-m,.rk-yli-d").forEach((e) => { e.classList.remove("rk-yli-m", "rk-yli-d"); });
      const out = []; let n = 0;
      const blokki = (el) => { let x = el; while (x && getComputedStyle(x).display.startsWith("inline")) x = x.parentElement; return x; };
      document.querySelectorAll(SEL).forEach((el) => {
        const cs = getComputedStyle(el); if (cs.display === "none" || !el.getClientRects().length) return;
        n++;
        const rg = document.createRange(); rg.selectNodeContents(el);
        const b = blokki(el), bb = b.getBoundingClientRect(), bc = getComputedStyle(b);
        const vas = bb.left + parseFloat(bc.paddingLeft) + parseFloat(bc.borderLeftWidth) - 0.5;
        const oik = bb.right - parseFloat(bc.paddingRight) - parseFloat(bc.borderRightWidth) + 0.5;
        const yli = [...rg.getClientRects()].filter((q) => q.width > 0 && (q.left < vas || q.right > oik));
        if (yli.length) out.push(`${el.className.split(" ")[0]} "${el.textContent.trim().slice(0, 40)}" +${Math.round(Math.max(...yli.map((q) => Math.max(q.right - oik, vas - q.left))))}px`);
      });
      return { n, out, hs: document.documentElement.scrollWidth - document.documentElement.clientWidth };
    }, SEL);
    virheita += tulos.out.length + (tulos.hs > 0 ? 1 : 0);
    console.log(`${s.padEnd(13)} ${w}  mitattu ${String(tulos.n).padStart(3)}  ylivuotoja ${tulos.out.length}  vaakavieritys ${tulos.hs}`);
    tulos.out.forEach((o) => console.log("    ", o));
    await ctx.close();
  }
  await b.close();
  console.log(virheita ? `YHTEENSÄ ${virheita} VIRHETTÄ` : "0 ylivuotoa");
})();
