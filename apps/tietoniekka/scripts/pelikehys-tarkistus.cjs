// PELIKEHYS K1–K4 -tarkistus (TOTEUTUSBRIEF §4, 20.10.2026) WebKitillä ja Chromiumilla.
// Jokaisen pelin aloitusnäkymä leveyksillä 320/375/390/430 × 844:
//   - tekstin ylivuoto (Range-pohjainen, KORTTISÄÄNTÖ) pk-*-teksteille, vaakavieritys
//   - pääpainike (.pk-aloitus .pk-nappi) ja valinta näkyvät ilman vieritystä (alareuna ≤ 844)
//   - paluulinkki kotikokoelmaan (.pk-paluu href) ja kosketuskohteet ≥ 44 px kehyksen osissa
//   - Megavisan tulos: läpikäynti kiinni, kohteet ≥ 44 px, K4-järjestys, ei ylivuotoa
//   - Aloita-napin jälkeen pelinäkymän palkki: nimi ja tila mahtuvat, palkki 56 px, paluurivi piilossa mobiilissa
// Käyttö (playwright erillisessä kansiossa, ks. korttisaanto-webkit.cjs):
//   NODE_PATH=/tmp/wk/node_modules node apps/tietoniekka/scripts/pelikehys-tarkistus.cjs <perus-URL> [webkit|chromium]
// Chromium ajetaan koneen Chromella (CHROME_PATH tai macOS-oletuspolku).
const pw = require("playwright");
const BASE = process.argv[2];
const MOOTTORI = process.argv[3] || "webkit";
const PELIT = [
  ["/peli/tupla-tai-kuitti", "/kokoelmat"],
  ["/peli/tupla-tai-kuitti/sm-liiga", "/kokoelmat"],
  ["/peli/kuntaliitos", "/kokoelma/kaupungit"],
  ["/peli/rajanaapurit", "/kokoelma/matkakohteet"],
  ["/peli/vaalipiiriketju", "/kokoelma/vaalit"],
  ["/peli/ikajarjestys", "/kokoelma/tunnetut-henkilot"],
  ["/peli/jarjesta/paaministerit-kesto", "/kokoelma/vaalit"],
  ["/peli?mega=suuri-mega-50", "/kokoelmat"],
];
const LEVEYDET = [320, 375, 390, 430];
const TEKSTI = ".pk-h1,.pk-lause,.pk-peli,.pk-tila,.pk-paluu,.pk-nappi,.pk-vaihtoehto,.pk-alarivi,.pk-ohje summary,.pk-valinta legend";
(async () => {
  const b = MOOTTORI === "chromium"
    ? await pw.chromium.launch({ executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" })
    : await pw.webkit.launch();
  let virheita = 0;
  for (const [polku, koti] of PELIT) for (const w of LEVEYDET) {
    const ctx = await b.newContext({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2, isMobile: MOOTTORI === "webkit", hasTouch: true });
    const p = await ctx.newPage();
    let r = null;
    for (let yritys = 0; yritys < 3 && !r; yritys++) {
      try { r = await p.goto(`${BASE}${polku}`, { waitUntil: "load", timeout: 60000 }); } catch (e) { if (yritys === 2) throw e; }
    }
    await p.waitForTimeout(700);
    await p.evaluate(() => document.fonts.ready);
    const t = await p.evaluate(([TEKSTI, koti]) => {
      const virheet = [];
      const blokki = (el) => { let x = el; while (x && getComputedStyle(x).display.startsWith("inline")) x = x.parentElement; return x; };
      document.querySelectorAll(TEKSTI).forEach((el) => {
        const cs = getComputedStyle(el); if (cs.display === "none" || !el.getClientRects().length) return;
        if (cs.textOverflow === "ellipsis") { if (el.scrollWidth > el.clientWidth + 1) virheet.push(`katkaistu "${el.textContent.trim().slice(0, 30)}"`); return; }
        const rg = document.createRange(); rg.selectNodeContents(el);
        const bl = blokki(el), bb = bl.getBoundingClientRect(), bc = getComputedStyle(bl);
        const vas = bb.left + parseFloat(bc.paddingLeft) + parseFloat(bc.borderLeftWidth) - 0.5;
        const oik = bb.right - parseFloat(bc.paddingRight) - parseFloat(bc.borderRightWidth) + 0.5;
        const yli = [...rg.getClientRects()].filter((q) => q.width > 0 && (q.left < vas || q.right > oik));
        if (yli.length) virheet.push(`ylivuoto ${el.className.split(" ")[0]} "${el.textContent.trim().slice(0, 30)}"`);
      });
      const hs = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      if (hs > 0) virheet.push(`vaakavieritys ${hs}px`);
      const nappi = document.querySelector(".pk-aloitus .pk-nappi");
      const ala = nappi ? Math.round(nappi.getBoundingClientRect().bottom + scrollY) : null;
      if (!nappi) virheet.push("ei aloitusnappia");
      else if (ala > 844) virheet.push(`nappi alareuna ${ala} > 844`);
      const valinta = document.querySelector(".pk-aloitus .pk-valinta");
      if (valinta && valinta.getBoundingClientRect().bottom + scrollY > 844) virheet.push("valinta ei mahdu");
      const paluu = document.querySelector(".pk-paluu");
      if (!paluu || paluu.getAttribute("href") !== koti) virheet.push(`paluu ${paluu && paluu.getAttribute("href")} ≠ ${koti}`);
      document.querySelectorAll(".pk-palkki a,.pk-aloitus button,.pk-aloitus a.pk-nappi,.pk-vaihtoehto,.pk-ohje summary,.pk-valikko").forEach((el) => {
        const q = el.getBoundingClientRect(); if (!q.width) return;
        if (q.height < 43.5) virheet.push(`kohde ${Math.round(q.height)}px "${el.textContent.trim().slice(0, 20)}"`);
      });
      const h1 = document.querySelector(".pk-h1");
      return { virheet, ala, h1: h1 ? getComputedStyle(h1).fontSize : null };
    }, [TEKSTI, koti]);
    if (r.status() !== 200) t.virheet.push(`HTTP ${r.status()}`);
    // Pelinäkymä: Aloita → palkin teksti ja korkeus.
    // Megavisan pelinäkymä on tavallisen visan HUD (K3, ei pelipalkkia) → vain aloitus tarkistetaan.
    if (t.ala && !polku.includes("mega=")) {
      await Promise.all([p.waitForLoadState("load").catch(() => {}), p.click(".pk-aloitus .pk-nappi")]);
      await p.waitForTimeout(2500);
      const peli = await p.evaluate(() => {
        const v = [];
        const palkki = document.querySelector(".pk-palkki");
        if (!palkki) return ["ei palkkia pelissä"];
        const rivi = palkki.querySelector(".pk-palkki-rivi").getBoundingClientRect();
        if (Math.round(rivi.height) !== 56) v.push(`palkki ${Math.round(rivi.height)}px`);
        palkki.querySelectorAll(".pk-tunnus,.pk-peli,.pk-tila").forEach((el) => {
          const q = el.getBoundingClientRect(); if (!q.width) return;
          const rg = document.createRange(); rg.selectNodeContents(el);
          const yli = [...rg.getClientRects()].some((x) => x.width > 0 && (x.right > q.right + 0.5 || x.left < q.left - 0.5 || x.bottom > rivi.bottom + 0.5));
          if (yli) v.push(`pelissä ylivuoto "${el.textContent.trim()}"`);
        });
        const paluu = palkki.querySelector(".pk-paluu");
        if (palkki.hasAttribute("data-pelissa") && innerWidth < 900 && paluu && paluu.getClientRects().length) v.push("paluurivi näkyy pelissä");
        return v.concat(palkki.hasAttribute("data-pelissa") ? [] : ["ei pelissa-tilaa"]).map((x) => `${x} [${(palkki.querySelector(".pk-tila") || {}).textContent || "-"}]`);
      });
      t.virheet.push(...peli.filter((x) => !x.startsWith("ei pelissa-tilaa")));
      t.pelissa = peli.some((x) => x.startsWith("ei pelissa-tilaa")) ? "ei tilaa" : "tila ok";
    }
    virheita += t.virheet.length;
    console.log(`${MOOTTORI} ${polku} ${w}: nappi ${t.ala}px h1 ${t.h1} pelissä ${t.pelissa}${t.virheet.length ? " ✗ " + t.virheet.join("; ") : " ✓"}`);
    await ctx.close();
  }
  // Megavisan K4-tulos: pelataan lyhin mega läpi (ensimmäinen vastaus joka kerta) ja mitataan tulos + läpikäynti.
  for (const w of LEVEYDET) {
    const ctx = await b.newContext({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2, isMobile: MOOTTORI === "webkit", hasTouch: true });
    const p = await ctx.newPage();
    p.on("dialog", (d) => d.accept());
    await p.goto(`${BASE}/peli?mega=maailman-kolkat-mega&aloita=1`, { waitUntil: "load", timeout: 60000 });
    for (let i = 0; i < 80 && !(await p.$(".pk-tulos")); i++) {
      const ans = await p.$(".tng-ans:not([disabled])");
      if (ans) { await ans.click().catch(() => {}); await p.waitForTimeout(250); }
      const seur = await p.$(".tng-next");
      if (seur) { await seur.click().catch(() => {}); await p.waitForTimeout(250); }
    }
    const v = await p.evaluate(async (TEKSTI) => {
      const out = [];
      const t = document.querySelector(".pk-tulos");
      if (!t) return ["ei tulosta"];
      const d = t.querySelector(".pk-lapikaynti");
      if (!d) out.push("ei läpikäyntiä");
      else {
        if (d.open) out.push("läpikäynti auki oletuksena");
        const sm = d.querySelector("summary");
        if (!/Näytä vastauksesi \(\d+\)/.test(sm.textContent)) out.push(`summary "${sm.textContent.trim()}"`);
        if (sm.getBoundingClientRect().height < 43.5) out.push("summary < 44 px");
        d.open = true; await new Promise((r) => setTimeout(r, 100));
        d.querySelectorAll(".tng-sum,.tng-ghost").forEach((el) => { if (el.getBoundingClientRect().height < 43.5) out.push(`ruutu ${Math.round(el.getBoundingClientRect().height)} px`); });
      }
      const jarj = [...t.querySelectorAll(".pk-tulos-iso,.pk-lapikaynti,.pk-tulos-toiminnot .pk-nappi,.pk-haasta,.pk-seuraava")].map((e) => e.className.split(" ")[0]);
      if (jarj.join(",") !== "pk-tulos-iso,pk-lapikaynti,pk-nappi,pk-haasta,pk-seuraava") out.push(`järjestys ${jarj.join(",")}`);
      t.querySelectorAll(".pk-tulos-iso,.pk-tulos-ala,.pk-tulos-eyebrow,.pk-pelikortti-nimi,.pk-pelikortti-kuvaus,.tng-sumtext,.tng-sumlabel,.tng-ghost,.pk-lapikaynti summary").forEach((el) => {
        const rg = document.createRange(); rg.selectNodeContents(el);
        let bl = el; while (getComputedStyle(bl).display.startsWith("inline")) bl = bl.parentElement;
        const q = bl.getBoundingClientRect();
        if ([...rg.getClientRects()].some((x) => x.width > 0 && (x.right > q.right + 0.5 || x.left < q.left - 0.5))) out.push(`ylivuoto "${el.textContent.trim().slice(0, 30)}"`);
      });
      const hs = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      if (hs > 0) out.push(`vaakavieritys ${hs}px`);
      return out;
    }, TEKSTI);
    virheita += v.length;
    console.log(`${MOOTTORI} mega-tulos ${w}:${v.length ? " ✗ " + v.join("; ") : " ✓"}`);
    await ctx.close();
  }
  await b.close();
  console.log(virheita ? `${virheita} virhettä` : "0 virhettä");
})();
