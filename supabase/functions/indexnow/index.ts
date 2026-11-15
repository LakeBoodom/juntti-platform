// INDEXNOW — Tietoniekan muuttuneet sivut Bingille ja muille IndexNow-hakukoneille (brief 28.10. + 15.11.2026).
//
// Lähde on tuotannon sitemap.xml (apps/tietoniekka/lib/sivukartta.ts): osoite ilmoitetaan, jos se on sivukartassa
// ja sen lastmod on viimeisimmän onnistuneen ajon jälkeen. Ensimmäinen ajo (ei onnistunutta ajoa taulussa
// indexnow_ajot) lähettää koko sivukartan. Epäonnistunut ajo ei siirrä alkuhetkeä, joten seuraava yrittää uudelleen.
//
// Ajastus: pg_cron kerran päivässä (sama malli kuin weekly-db-backup). Kutsu vaatii Supabasen JWT:n (verify_jwt),
// ilman sitä vastaus on 401. Palvelinavain (SUPABASE_SERVICE_ROLE_KEY) on funktion omassa ympäristössä.
//
// Parametrit:  ?kuiva=1               listaa lähetettävät osoitteet sivutyypeittäin, ei lähetä eikä kirjaa
//              ?sivukartta=<https-url> vain kuivana: toinen sivukartta (esikatselu)
//              ?kaikki=1               vain kuivana: koko sivukartta alkuhetkestä riippumatta
// Osoitesääntö: /peli?… ei koskaan, paitsi pelkkä /peli?mega=<slug> (indeksoitava, Heikki 14.11.2026).
import { createClient } from "npm:@supabase/supabase-js@2";

const HOST = "tietoniekka.fi";
const KEY = "ckrjjgncgs24awz2eoz4h7cut7ye3sdh"; // julkinen: https://tietoniekka.fi/<KEY>.txt (IndexNow-protokolla)
const SITEMAP = `https://${HOST}/sitemap.xml`;
const ENDPOINT = "https://api.indexnow.org/indexnow";
const MIN_VALI_H = 6; // oikeat ajot enintään kerran kuudessa tunnissa (toistokutsut eivät kuormita IndexNowia)
/* Sivukartta on välimuistissa enintään tunnin (revalidate 3600): alkuhetkeä aikaistetaan kahdella tunnilla, ettei
   juuri ennen ajoa muuttunut sivu putoa väliin. Muutaman osoitteen uusintailmoitus ei haittaa. */
const PUSKURI_H = 2;

type Rivi = { loc: string; lastmod: Date | null };

function lueSivukartta(xml: string): Rivi[] {
  const out: Rivi[] = [];
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = /<loc>([^<]+)<\/loc>/.exec(m[1])?.[1]?.trim().replace(/&amp;/g, "&");
    if (!loc) continue;
    const lm = /<lastmod>([^<]+)<\/lastmod>/.exec(m[1])?.[1]?.trim();
    const d = lm ? new Date(lm) : null;
    out.push({ loc, lastmod: d && !Number.isNaN(d.getTime()) ? d : null });
  }
  return out;
}

/** Sallittu osoite: tietoniekka.fi, ei /peli?-parametreja paitsi pelkkä ?mega=<slug>. */
function sallittu(loc: string): boolean {
  let u: URL;
  try { u = new URL(loc); } catch { return false; }
  if (u.protocol !== "https:") return false;
  if (u.search) return u.pathname === "/peli" && /^\?mega=[a-z0-9-]+$/.test(u.search);
  return true;
}

/** Sivutyyppi raporttia varten (polun ensimmäinen osa). */
function tyyppi(loc: string): string {
  const u = new URL(loc);
  if (u.pathname === "/") return "etusivu";
  if (u.pathname === "/peli" && u.search.startsWith("?mega=")) return "megavisa";
  return u.pathname.split("/")[1] || "muu";
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2), { status, headers: { "Content-Type": "application/json; charset=utf-8" } });

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const kuiva = url.searchParams.get("kuiva") === "1";
  const kaikki = kuiva && url.searchParams.get("kaikki") === "1";
  const toinen = url.searchParams.get("sivukartta");
  if (toinen && !kuiva) return json({ virhe: "sivukartta-parametri vain kuivana" }, 400);
  if (toinen && !/^https:\/\/[a-z0-9.-]+\.(vercel\.app|tietoniekka\.fi)\/sitemap\.xml$/.test(toinen)) {
    return json({ virhe: "sallittu vain tietoniekka.fi:n tai Vercel-esikatselun sitemap.xml" }, 400);
  }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const { data: viimeisin } = await sb
    .from("indexnow_ajot").select("aika").in("http_status", [200, 202]).order("aika", { ascending: false }).limit(1).maybeSingle();
  const alkaen = kaikki || !viimeisin ? null : new Date(viimeisin.aika as string);

  if (!kuiva && alkaen && Date.now() - alkaen.getTime() < MIN_VALI_H * 3600_000) {
    return json({ ohitettu: `edellinen onnistunut ajo ${alkaen.toISOString()}, alle ${MIN_VALI_H} h sitten` });
  }

  const vastaus = await fetch(toinen ?? SITEMAP, { headers: { "User-Agent": "tietoniekka-indexnow/1.0" } });
  if (!vastaus.ok) {
    const virhe = `sivukartta ${vastaus.status}`;
    if (!kuiva) await sb.from("indexnow_ajot").insert({ osoitteita: 0, http_status: null, virheteksti: virhe, alkuajo: !alkaen });
    return json({ virhe }, 502);
  }
  /* Esikatselun sivukartassa osoitteiden isäntä voi olla esikatselun oma: arvioidaan ne tietoniekka.fi-osoitteina. */
  const rivit = lueSivukartta(await vastaus.text()).map((r) =>
    toinen ? { ...r, loc: r.loc.replace(/^https:\/\/[^/]+/, `https://${HOST}`) } : r);
  const ehdokkaat = rivit.filter((r) => new URL(r.loc).host === HOST && sallittu(r.loc));
  const raja = alkaen ? new Date(alkaen.getTime() - PUSKURI_H * 3600_000) : null;
  const lahetettavat = ehdokkaat.filter((r) => !raja || (r.lastmod && r.lastmod > raja)).map((r) => r.loc);
  const hylatyt = rivit.filter((r) => !ehdokkaat.includes(r)).map((r) => r.loc);

  const tyypeittain: Record<string, number> = {};
  for (const l of lahetettavat) tyypeittain[tyyppi(l)] = (tyypeittain[tyyppi(l)] ?? 0) + 1;
  const yhteenveto = {
    alkuajo: !alkaen, alkaen: alkaen?.toISOString() ?? null, sivukartassa: rivit.length,
    ilman_lastmodia: rivit.filter((r) => !r.lastmod).length, hylatyt, osoitteita: lahetettavat.length, tyypeittain,
  };
  if (kuiva) return json({ kuiva: true, ...yhteenveto, osoitteet: lahetettavat });
  if (!lahetettavat.length) {
    await sb.from("indexnow_ajot").insert({ osoitteita: 0, http_status: 200, alkuajo: false, virheteksti: "ei muuttuneita osoitteita" });
    return json(yhteenveto);
  }

  let status = 0;
  let virhe: string | null = null;
  for (let i = 0; i < lahetettavat.length; i += 10_000) {
    const r = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: lahetettavat.slice(i, i + 10_000) }),
    });
    status = r.status;
    if (r.status !== 200 && r.status !== 202) { virhe = (await r.text()).slice(0, 500) || `HTTP ${r.status}`; break; }
  }
  await sb.from("indexnow_ajot").insert({ osoitteita: lahetettavat.length, http_status: status, virheteksti: virhe, alkuajo: !alkaen });
  return json({ ...yhteenveto, http_status: status, virhe }, virhe ? 502 : 200);
});
