// Julkaisu Instagramiin: yksittäinen rivi (adminin "Julkaise nyt") ja ajastimen
// kierros (pg_cron → /api/ig/ajastin kymmenen minuutin välein).
//
// Vain hyväksytyt julkaisut julkaistaan. Ajastin julkaisee rivin, kun sen päivä on
// tänään ja sarjan kellonaika on ohitettu — vanhoja päiviä ei julkaista jälkikäteen.
// Rivi lukitaan tilalla 'julkaistaan', jotta kaksi rinnakkaista ajoa ei julkaise
// samaa kuvaa kahdesti.

import { getSupabaseAdmin } from "@juntti/db";
import { haeYhteys, julkaiseInstagramiin, uusiTokenTarvittaessa } from "./instagram";
import { jpegit, piirraRivi, type PiirrettavaRivi } from "./piirto";
import { synttariKuvateksti, visaKuvateksti } from "./kuvateksti";
import { haeAsetukset, tanaanHelsinki } from "./suunnitelma";

type Rivi = PiirrettavaRivi & { id: string; tila: string; kuvateksti: string | null };

const SARAKKEET = "id, site_id, paiva, slotti, quiz_id, pohja, pohja_vari, kentat, tila, kuvateksti";

export async function julkaiseRivi(id: string): Promise<{ ok: true; permalink: string | null } | { ok: false; virhe: string }> {
  const sb = getSupabaseAdmin();
  // Lukitus: vain hyväksytty tai epäonnistunut rivi siirtyy tilaan 'julkaistaan'.
  const { data: lukittu } = await sb
    .from("ig_julkaisut" as never)
    .update({ tila: "julkaistaan", virhe: null, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .in("tila", ["hyvaksytty", "epaonnistui"])
    .select(SARAKKEET)
    .maybeSingle();
  const rivi = lukittu as unknown as Rivi | null;
  if (!rivi) return { ok: false, virhe: "Vain hyväksytyn julkaisun voi julkaista (tai se on jo julkaisussa)." };

  const epaonnistui = async (virhe: string) => {
    await sb.from("ig_julkaisut" as never).update({ tila: "epaonnistui", virhe, updated_at: new Date().toISOString() } as never).eq("id", id);
    return { ok: false as const, virhe };
  };

  try {
    let yhteys = await haeYhteys(rivi.site_id);
    if (!yhteys) return epaonnistui("Instagram-yhteyttä ei ole — yhdistä tili Instagram-sivun yläosasta.");
    yhteys = await uusiTokenTarvittaessa(yhteys);

    const p = await piirraRivi(rivi);
    if (!p) return epaonnistui("Julkaisun sisältöä ei löytynyt (visa tai synttärisankari puuttuu).");
    if (p.piirros.esteet.length) return epaonnistui(`Pohja ei ole julkaisukelpoinen: ${p.piirros.esteet.join(" ")}`);

    const kuvat = await jpegit(p.piirros, p.fontit);
    const urlit: string[] = [];
    for (let i = 0; i < kuvat.length; i++) {
      const polku = `julkaisut/${rivi.paiva}/${rivi.id}-${Date.now()}-${i + 1}.jpg`;
      const { error } = await sb.storage.from("ig-kuvat").upload(polku, kuvat[i], { contentType: "image/jpeg", upsert: true });
      if (error) return epaonnistui(`Kuvan tallennus: ${error.message}`);
      urlit.push(sb.storage.from("ig-kuvat").getPublicUrl(polku).data.publicUrl);
    }

    const kuvateksti =
      rivi.kuvateksti?.trim() ||
      (p.sisalto.tyyppi === "visa"
        ? visaKuvateksti(rivi.kentat?.tapahtuma ? { ...p.sisalto.v, introOtsikko: rivi.kentat.tapahtuma } : p.sisalto.v)
        : synttariKuvateksti(p.sisalto.s, rivi.pohja, rivi.kentat ?? {}));

    const t = await julkaiseInstagramiin(yhteys, urlit, kuvateksti);
    await sb
      .from("ig_julkaisut" as never)
      .update({
        tila: "julkaistu",
        ig_media_id: t.mediaId,
        ig_permalink: t.permalink,
        kuva_urls: urlit,
        kuvateksti,
        on_kuva: p.piirros.onKuva,
        julkaistu_at: new Date().toISOString(),
        virhe: null,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", id);
    return { ok: true, permalink: t.permalink };
  } catch (e) {
    return epaonnistui(e instanceof Error ? e.message : String(e));
  }
}

const hhmm = (t: string) => t.slice(0, 5);

function nytHelsinki(): string {
  return new Intl.DateTimeFormat("fi-FI", { timeZone: "Europe/Helsinki", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .format(new Date())
    .replace(".", ":");
}

/** Ajastimen kierros: julkaisee enintään yhden erääntyneen julkaisun per ajo
    (ajo kymmenen minuutin välein riittää, ja funktio pysyy aikarajassa). */
export async function ajastinKierros(siteId: string): Promise<string> {
  const a = await haeAsetukset(siteId);
  const y = await haeYhteys(siteId);
  if (!y) return "ei yhteyttä";
  try { await uusiTokenTarvittaessa(y); } catch (e) { console.error("IG-tokenin uusiminen", e); }
  if (!a.automaattinen) return "automaattinen julkaisu pois";

  const tanaan = tanaanHelsinki();
  const nyt = nytHelsinki();
  const erapaiva: Record<string, { paalla: boolean; klo: string }> = {
    paivan_visa: { paalla: a.visa_paalla, klo: hhmm(a.visa_klo) },
    synttarit: { paalla: a.synttarit_paalla, klo: hhmm(a.synttarit_klo) },
    oma: { paalla: true, klo: hhmm(a.omat_klo) },
  };
  const { data } = await getSupabaseAdmin()
    .from("ig_julkaisut" as never)
    .select("id, slotti, created_at")
    .eq("site_id", siteId)
    .eq("paiva", tanaan)
    .eq("tila", "hyvaksytty")
    .order("created_at");
  const erääntyneet = ((data ?? []) as unknown as Array<{ id: string; slotti: string }>).filter((r) => {
    const s = erapaiva[r.slotti];
    return s?.paalla && nyt >= s.klo;
  });
  if (erääntyneet.length === 0) return `ei erääntyneitä (${nyt})`;
  const t = await julkaiseRivi(erääntyneet[0].id);
  return t.ok ? `julkaistu ${erääntyneet[0].id}` : `epäonnistui ${erääntyneet[0].id}: ${t.virhe}`;
}
