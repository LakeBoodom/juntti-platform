// TULOSNÄKYMÄN tarkistus (Tulosnäkymä ja jakaminen, vaiheet B–C, 22.10.2026): pelaa visan läpi kerran ja mittaa
// tulosnäkymän leveyksillä 320/390/768/1024/1440/1920/2450 (KORTTISÄÄNTÖ, Range-mittaus):
//   - otsikoiden ja tekstien ylivuoto, vaakavieritys, teksti ≥ 12 px, kosketuskohteet ≥ 44 px
//   - 390 × 844: tulos ja WhatsApp-painike ilman vieritystä; 1440 × 900: tulos, jako ja seuraava visa
// Testipelaus kirjautuu quiz_plays-tauluun session_id:llä "testi-claude-tulos" → poista testin jälkeen.
// Kuvavisan haastetunnuksen luonti estetään (ei testirivejä kuvavisa_haasteet-tauluun).
// Käyttö: NODE_PATH=…/node_modules node apps/tietoniekka/scripts/tulos-tarkistus.cjs <URL> [webkit|chromium] [polku…]
const pw = require("playwright");
const BASE = process.argv[2];
const MOOTTORI = process.argv[3] || "webkit";
const POLUT = process.argv.slice(4).length ? process.argv.slice(4) : ["/peli?visa=joker-2019-tietovisa"];
// 1440 ensin: mitataan tuoreesta latauksesta (WebKit ei asettele leveää ruudukkoa täysin uudelleen 390 → 1440 -koonmuutoksessa).
const LEVEYDET = [1440, 2450, 1920, 1024, 768, 390, 320];
const TEKSTI = ".tn-tulos-eyebrow,.tn-tulos-tasonimi,.tn-tulos-pisteet,.tn-tulos-tuomio,.tn-tulos-lause,.tn-tulos-pikku,.tn-tulos-nayta,.tn-jako-h,.tn-jako-wa,.tn-jako-kanava,.tn-tulos-kortti-nimi,.tn-tulos-kortti-ala,.tn-tulos-kortti-cta,.tn-tulos-linkit a,.tn-tulos-linkit button,.pk-peli,.pk-paluu,.tn-jako-esikatselu summary";
(async () => {
  const b = MOOTTORI === "chromium"
    ? await pw.chromium.launch({ executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" })
    : await pw.webkit.launch();
  let virheita = 0;
  for (const polku of POLUT) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => { try { localStorage.setItem("tn_session_id", "testi-claude-tulos"); } catch {} });
    // Kuvavisan haastetunnusta (kuvavisa_haasteet) ei luoda testissä: jako käyttää silloin pitkää ?ids=-osoitetta.
    await ctx.route(/\/rest\/v1\/rpc\/kuvavisa_haaste_luo/, (r) => r.abort());
    const p = await ctx.newPage(); p.on("dialog", (d) => d.accept());
    await p.goto(BASE + polku, { waitUntil: "load", timeout: 180000 }); await p.waitForTimeout(1200);
    await p.click(".tng-herobtn, .tng-start-btn, .vv-btn");
    // Kuvavisoissa vastaukset avautuvat vasta kuvan latauduttua → aikaraja eikä kierrosmäärä.
    const loppu = Date.now() + 120000;
    while (Date.now() < loppu && !(await p.$(".tn-tulos"))) {
      const a = await p.$(".tng-ans:not([disabled])"); if (a) { await a.click().catch(() => {}); await p.waitForTimeout(160); }
      const n = await p.$(".tng-next"); if (n) { await n.click().catch(() => {}); await p.waitForTimeout(160); }
    }
    if (!(await p.$(".tn-tulos"))) { console.log(MOOTTORI, polku, "EI TULOSNÄKYMÄÄ"); virheita++; await ctx.close(); continue; }
    // Vaihe C: jakoteksti briefin muodossa, ei emojeita; WhatsApp-linkissä sama teksti + osoite.
    const jako = await p.evaluate(() => ({ t: document.querySelector(".tn-jako-esikatselu-t")?.textContent ?? "", wa: document.querySelector(".tn-jako-wa")?.getAttribute("href") ?? "" }));
    const muoto = /^.+ – sain \d+\/\d+ Tietoniekassa(: [^.]+)?\. Pystytkö (parempaan|samaan)\?$|^.+ – sain \d+\/\d+ Tietoniekassa, sinä \d+\/\d+\. Vastahaaste: pystytkö (parempaan|samaan)\?$/u;
    const emoji = /\p{Extended_Pictographic}/u;
    const waT = decodeURIComponent(jako.wa.replace(/^https:\/\/wa\.me\/\?text=/, ""));
    if (!muoto.test(jako.t) || emoji.test(jako.t) || !waT.startsWith(jako.t + " http")) { console.log(MOOTTORI, polku, "✗ jakoteksti:", JSON.stringify(jako.t), "| wa:", JSON.stringify(waT)); virheita++; }
    else console.log(MOOTTORI, polku, "jakoteksti ✓", JSON.stringify(waT));
    for (const w of LEVEYDET) {
      const h = w === 1440 ? 900 : 844;
      await p.setViewportSize({ width: w, height: h }); await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(400);
      const v = await p.evaluate(([TEKSTI, w]) => {
        const out = [];
        const blokki = (el) => { let x = el; while (x && getComputedStyle(x).display.startsWith("inline")) x = x.parentElement; return x; };
        document.querySelectorAll(TEKSTI).forEach((el) => {
          const cs = getComputedStyle(el); if (cs.display === "none" || !el.getClientRects().length) return;
          if (parseFloat(cs.fontSize) < 11.5) out.push(`teksti ${cs.fontSize} "${el.textContent.trim().slice(0, 24)}"`);
          const rg = document.createRange(); rg.selectNodeContents(el);
          const bl = blokki(el), q = bl.getBoundingClientRect(), bc = getComputedStyle(bl);
          const vas = q.left + parseFloat(bc.paddingLeft) - 0.5, oik = q.right - parseFloat(bc.paddingRight) + 0.5;
          if ([...rg.getClientRects()].some((x) => x.width > 0 && (x.left < vas || x.right > oik))) out.push(`ylivuoto ${el.className.split(" ")[0]} "${el.textContent.trim().slice(0, 30)}"`);
        });
        document.querySelectorAll(".tn-tulos a, .tn-tulos button, .tn-tulos summary, .pk-palkki a").forEach((el) => {
          const q = el.getBoundingClientRect(); if (q.width && q.height < 43.5) out.push(`kohde ${Math.round(q.height)}px "${el.textContent.trim().slice(0, 20)}"`);
        });
        const hs = document.documentElement.scrollWidth - innerWidth; if (hs > 0) out.push(`vaakavieritys ${hs}`);
        const ala = (s) => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().bottom + scrollY) : null; };
        if (w === 390) { if (ala(".tn-jako-wa") > 844) out.push(`WhatsApp ${ala(".tn-jako-wa")} > 844`); if (ala(".tn-tulos-tulos") > 844) out.push("tulos > 844"); }
        if (w === 1440) for (const s of [".tn-tulos-tulos", ".tn-jako", ".tn-tulos-seuraava"]) if (ala(s) > 900) out.push(`${s} ${ala(s)} > 900`);
        return out;
      }, [TEKSTI, w]);
      virheita += v.length;
      console.log(`${MOOTTORI} ${polku} ${w}:${v.length ? " ✗ " + v.join("; ") : " ✓"}`);
    }
    await ctx.close();
  }
  await b.close();
  console.log(virheita ? `${virheita} virhettä` : "0 virhettä");
})();
