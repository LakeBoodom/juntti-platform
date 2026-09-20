#!/usr/bin/env node
// Vercel-tallennustilan siivous (20.9.2026).
//
// Poistaa vanhat deploymentit ja halutessa nukkuvat projektit.
// Ajo:
//   VERCEL_TOKEN=xxx node scripts/vercel-siivous.mjs            # näyttää vain mitä tehtäisiin
//   VERCEL_TOKEN=xxx node scripts/vercel-siivous.mjs --poista   # poistaa oikeasti
//
// Tokenin saa: vercel.com -> Account Settings -> Tokens -> Create.
//
// Turvasäännöt (jokainen tarkistetaan ennen poistoa):
//  1. Elävä tuotantoversio (uusin READY + target=production) säilyy AINA.
//  2. Kolme uusinta READY-deploymenttia säilyy (paluuvara).
//  3. Deployment, jolla on muu kuin haaran esikatselualias, säilyy.
//  4. Keskeneräisiin (BUILDING/QUEUED/INITIALIZING) ei kosketa.

const TOKEN = process.env.VERCEL_TOKEN;
const TEAM = "team_d8ClUfyvgtYEzX9YmbQ4rXeF";
const AJA = process.argv.includes("--poista");

/** Projektit, joista siivotaan vanhat deploymentit (projekti itse jää). */
const SIIVOTTAVAT = [
  ["tietoniekka", "prj_1fdefpr5qU2ACIabsYs2eIhhK9uw"],
  ["juntti", "prj_ViEeVJ2YamK92zyB2nSOnfz9DuV1"],
  ["synttarit", "prj_ZbzmhGXjr0GwmOnzEDyXVcDyHZ6j"],
  ["juntti-admin", "prj_Md8AuMx7wBLluHx8uRfSXrCvkERT"],
  ["howlongday", "prj_aoZz0lfxvTrUM6bGXMqKJNfFaZ2x"],
  ["diggaa", "prj_WG1Boxkq1AHTfSZjxlh9UZTTz385"],
  ["whattoday", "prj_m9DEizxM42EkB5FoKaiLgzRlY1wf"],
];

/** Kokonaan poistettavat projektit. Tyhjennä lista jos et halua poistaa näitä. */
const POISTETTAVAT_PROJEKTIT = ["pellos", "tanaan", "travel-assari", "uplause-feedback"];

if (!TOKEN || TOKEN === "xxx") {
  console.error("Puuttuu oikea VERCEL_TOKEN.");
  console.error("Luo token: vercel.com -> Account Settings -> Tokens -> Create (scope: lakeboodom's projects).");
  console.error("Aja sitten: VERCEL_TOKEN=<oikea-token> node scripts/vercel-siivous.mjs");
  process.exit(1);
}

const api = async (polku, init = {}) => {
  const r = await fetch(`https://api.vercel.com${polku}`, {
    ...init,
    headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json", ...(init.headers || {}) },
  });
  const teksti = await r.text();
  let data = null;
  try { data = teksti ? JSON.parse(teksti) : null; } catch { /* ei-JSON vastaus */ }
  return { ok: r.ok, status: r.status, data, teksti };
};

/** Lukukutsu, joka ei saa epäonnistua hiljaa: tyhjä lista tarkoittaisi
    "ei mitään poistettavaa", ja 401 näyttäisi samalta kuin siivottu projekti. */
const lue = async (polku, mita) => {
  const r = await api(polku);
  if (!r.ok) {
    console.error(`\nVIRHE (${r.status}) haettaessa: ${mita}`);
    console.error(r.teksti.slice(0, 200));
    if (r.status === 401 || r.status === 403) {
      console.error("\nToken ei kelpaa. Luo uusi: vercel.com -> Account Settings -> Tokens -> Create,");
      console.error("valitse scopeksi lakeboodom's projects, ja aja komento oikealla tokenilla.");
    }
    process.exit(1);
  }
  return r.data;
};

async function kaikkiDeploymentit(nimi, projectId) {
  const kaikki = [];
  let until = null;
  for (let i = 0; i < 40; i++) {
    const q = `/v6/deployments?teamId=${TEAM}&projectId=${projectId}&limit=100${until ? `&until=${until}` : ""}`;
    const data = await lue(q, `${nimi}: deploymentit`);
    const osa = data?.deployments ?? [];
    if (!osa.length) break;
    kaikki.push(...osa);
    if (!data?.pagination?.next) break;
    until = data.pagination.next;
  }
  return kaikki.sort((a, b) => b.created - a.created);
}

async function suojatut(nimi, projectId) {
  const data = await lue(`/v4/aliases?teamId=${TEAM}&projectId=${projectId}&limit=100`, `${nimi}: aliakset`);
  const s = new Set();
  for (const a of data?.aliases ?? []) if (!/-git-/.test(a.alias)) s.add(a.deploymentId);
  return s;
}

// Tarkistetaan token ennen kuin tehdään mitään muuta.
const minä = await lue("/v2/user", "käyttäjätiedot");
console.log(`Tunnistauduttu: ${minä?.user?.username ?? "?"} (${minä?.user?.email ?? "?"})`);

let poistettujaYhteensa = 0;
let loytyiDeploymentteja = false;

for (const [nimi, pid] of SIIVOTTAVAT) {
  const kaikki = await kaikkiDeploymentit(nimi, pid);
  const suoja = await suojatut(nimi, pid);
  if (kaikki.length) loytyiDeploymentteja = true;
  const id = (d) => d.uid || d.id;

  const live = kaikki.find((d) => d.state === "READY" && d.target === "production");
  const sailyta = new Set(suoja);
  if (live) sailyta.add(id(live));
  // Kolme uusinta onnistunutta buildia jää paluuvaraksi.
  for (const d of kaikki.filter((d) => d.state === "READY").slice(0, 3)) sailyta.add(id(d));

  const kesken = ["BUILDING", "QUEUED", "INITIALIZING"];
  const poistettavat = kaikki.filter((d) => !sailyta.has(id(d)) && !kesken.includes(d.state));

  if (live && poistettavat.some((d) => id(d) === id(live))) {
    console.error(`${nimi}: TURVATARKISTUS PETTI — elävä versio poistolistalla. Ohitetaan.`);
    continue;
  }

  console.log(`\n${nimi}: ${kaikki.length} deploymenttia, säilyy ${sailyta.size}, poistetaan ${poistettavat.length}`);
  console.log(`  livenä: ${live ? `${String(live.meta?.githubCommitSha ?? "").slice(0, 7)} (${id(live)})` : "ei löytynyt"}`);

  if (!AJA) continue;

  let ok = 0;
  for (const d of poistettavat) {
    const r = await api(`/v13/deployments/${id(d)}?teamId=${TEAM}`, { method: "DELETE" });
    if (r.ok) ok++;
    else console.error(`  virhe ${id(d)}: ${r.status} ${r.teksti.slice(0, 120)}`);
    await new Promise((z) => setTimeout(z, 120));
  }
  poistettujaYhteensa += ok;
  console.log(`  poistettu ${ok}/${poistettavat.length}`);
}

if (!loytyiDeploymentteja) {
  console.error("\nYksikään projekti ei palauttanut deploymentteja. Se ei ole uskottavaa,");
  console.error("joten jokin on pielessä (väärä tiimi tai tokenin oikeudet). Keskeytetään");
  console.error("ennen projektien poistoa.");
  process.exit(1);
}

if (POISTETTAVAT_PROJEKTIT.length) {
  console.log(`\nProjektit kokonaan pois: ${POISTETTAVAT_PROJEKTIT.join(", ")}`);
  if (AJA) {
    for (const nimi of POISTETTAVAT_PROJEKTIT) {
      const r = await api(`/v9/projects/${nimi}?teamId=${TEAM}`, { method: "DELETE" });
      console.log(`  ${nimi}: ${r.ok ? "poistettu" : `virhe ${r.status} ${r.teksti.slice(0, 120)}`}`);
    }
  }
}

console.log(
  AJA
    ? `\nValmis. Deploymentteja poistettu ${poistettujaYhteensa}.`
    : "\nTämä oli kuiva ajo — mitään ei poistettu. Aja --poista kun luvut näyttävät oikeilta.",
);
