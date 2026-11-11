"use server";
// LAITA JÄRJESTYKSEEN — kierroksen arvonta (Server Action, kuten lib/ikajarjestys.ts).
// Saa eksportoida vain async-funktioita; tyypit ja pakat asuvat lib/jarjesta/pakat.ts:ssä.
//
// Arvonta: `pick` kohdetta siten, että minkä tahansa kahden arvon ero on vähintään pakan
// `vali.min` (suhteellinen kuten Kumpi?-pelissä tai absoluuttinen). Jos täyttä kierrosta ei
// synny (esim. vain 8 eri arvoa 13:sta), sallitaan tasapelit — pisteytys hyväksyy silloin kumman
// tahansa järjestyksen (lib/jarjesta/pisteytys.ts).

import { henkiloKuva } from "../henkilokuvat";
import { haePakka, type JarjestysKohde } from "./pakat";
import { arvoPaivanRivi, poimi, sekoita, type Ehdokas } from "./arvonta";
import { haePool } from "./pooli";

/** Kuvat kaikille tai ei kenellekään (brief §2): yksikin puuttuva oma kopio → tekstikortit, ei koskaan siluettia. */
function kuvatKaikille(valitut: Ehdokas[]): JarjestysKohde[] {
  const kuvat = valitut.every((k) => henkiloKuva(k.image_url));
  return valitut.map(({ tunnettu: _t, mittari: _m, ...k }) => (kuvat ? k : { ...k, image_url: null, hideThumb: true }));
}

export async function haeJarjestysKierros(slug: string, excludeIds: string[] = []): Promise<JarjestysKohde[]> {
  const p = haePakka(slug);
  if (!p) return [];
  const pool = await haePool(p);

  const arvo = (lahde: Ehdokas[]) => {
    const tiukka = poimi(p, lahde, p.vali);
    return tiukka.length >= p.pick ? tiukka : poimi(p, lahde, { tapa: "absoluuttinen", min: 0 });
  };
  // Edellisen kierroksen kohteet pois, jos täysi kierros syntyy silti; muuten ilman rajausta.
  let valitut = excludeIds.length ? arvo(pool.filter((k) => !excludeIds.includes(k.id))) : [];
  if (valitut.length < p.pick) valitut = arvo(pool);

  return kuvatKaikille(sekoita(valitut));
}

/** Päivän rivi (CD kierros 5a, 31.10.2026): RIVIN_PITUUS kohdetta väärässä järjestyksessä, sama kaikille
 *  koko päivän (siemen = päivä + pakka). Pelataan hubissa, jaettu tulos avautuu ?kohteet=-linkillä.
 *  `vainNimet` rajaa rivin arvonnan näihin kohteisiin (hubin haaste, pakka itse pysyy ennallaan).
 *  Arvonta lib/jarjesta/arvonta.ts:ssä (vakaa poolin järjestys, vaihe B2). */
export async function haePaivanRivi(slug: string, paiva: string, vainNimet?: readonly string[]): Promise<JarjestysKohde[]> {
  const p = haePakka(slug);
  if (!p) return [];
  const valitut = arvoPaivanRivi(p, await haePool(p), slug, paiva, vainNimet);
  return valitut.length ? kuvatKaikille(valitut) : [];
}

/** Täsmälleen nämä kohteet annetussa järjestyksessä (?kohteet=id,id,… : päivän rivi ja jaettu kierros). */
export async function haeJarjestysKohteet(slug: string, ids: string[]): Promise<JarjestysKohde[]> {
  const p = haePakka(slug);
  const puhtaat = [...new Set(ids)].filter((x) => /^[0-9a-f-]{36}$/i.test(x)).slice(0, 12);
  if (!p || puhtaat.length < 3) return [];
  const pool = await haePool(p);
  const kartta = new Map(pool.map((k) => [k.id, k]));
  const valitut = puhtaat.map((id) => kartta.get(id)).filter((k): k is Ehdokas => !!k);
  return valitut.length >= 3 ? kuvatKaikille(valitut) : [];
}
