// JÄRJESTÄ OIKEIN — kolmas pelimuoto.
//
// Sama data kuin Kumpi-pelissä, sama laatulogiikka, eri kysely: kahden
// entiteetin sijaan valitaan neljä tai viisi ja pelaaja asettaa ne
// järjestykseen. Generaattori on puhdas funktio, kuten duel.ts:ssä.
//
// Laatusääntö on Kumpi-pelin sääntö sovellettuna ketjuun: siellä katsottiin
// yhden parin eroa, tässä katsotaan PERÄKKÄISTEN parien eroja. Ketju on niin
// vahva kuin sen heikoin lenkki — jos kaksi vierekkäistä arvoa ovat liian
// lähellä toisiaan, koko tehtävä on osittain arvausta.

import {
  domainDistance,
  haversineKm,
  type DuelData,
  type DuelDef,
  type DuelEntity,
} from "./duel";

export type RankItem = {
  entity: DuelEntity;
  /** Vertailtava luku. Distance-moodissa laskettu, muuten tallennettu. */
  value: number;
  /** Paljastuksessa näytettävä arvo ("694 392", "231 km"). */
  display: string;
};

export type RankTask = {
  def: DuelDef;
  /** Oikea järjestys, ensimmäinen = ohjeen mukaan ensimmäinen. */
  solution: RankItem[];
  /** Sekoitettu aloitusjärjestys. Ei koskaan sama kuin ratkaisu. */
  shuffled: RankItem[];
  /** Näytettävä ohje ("suurimmasta pienimpään"). */
  label: string;
  /** true = järjestys on käännetty def.winner-suunnasta. */
  reversed: boolean;
  /**
   * Vain kaksi tasoa. "Helppo" on rakenteellisesti mahdoton: jos jokainen
   * peräkkäinen ero ylittäisi helppo-kynnyksen, tehtävä hylätään triviaalina.
   * Viiden asian järjestäminen ei muutenkaan ole koskaan yhtä helppoa kuin
   * kahden välillä valitseminen.
   */
  difficulty: "keski" | "vaikea";
  /** Arvottu vertailupiste, vain distance-moodissa. */
  ref: DuelEntity | null;
  taskKey: string;
};

const TASK_LEN = 5;
const MIN_LEN = 4;

const pick = <T,>(xs: T[]): T => xs[Math.floor(Math.random() * xs.length)];

function shuffle<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Ero kahden peräkkäisen arvon välillä, samalla logiikalla kuin Kumpi-pelissä.
 * gapMode tulee määrityksestä, ei attribuutin nimestä.
 */
function step(def: DuelDef, va: number, vb: number): number {
  if (def.gapMode === "absolute") return Math.abs(va - vb) / def.gapDivisor;
  return Math.abs(va - vb) / Math.max(Math.abs(va), Math.abs(vb), 1);
}

/**
 * Alaraja peräkkäisten arvojen erolle. Ilman tätä tehtävään päätyisi pareja
 * joiden keskinäistä järjestystä ei voi tietää, vain arvata — ja koko tehtävä
 * menisi pieleen yhden arvauksen takia.
 */
function minStepFor(def: DuelDef): number {
  if (def.minGap !== null) return def.minGap;
  // Jos alarajaa ei ole asetettu, se johdetaan keskitason kynnyksestä.
  // EI midGap sellaisenaan: silloin alaraja ja "vaikea"-kynnys olisivat sama
  // luku, eikä yhtään vaikeaa tehtävää voisi syntyä. Mitattu: puolikkaalla
  // kynnyksellä kaupungeista tulee 441 vaikeaa tehtävää, kokonaisella 0.
  if (def.midGap !== null) return def.midGap / 2;
  return 0;
}

function poolFor(entities: DuelEntity[], def: DuelDef): DuelEntity[] {
  if (def.mode === "distance")
    return entities.filter((e) => e.kind === def.kind && e.lat !== null && e.lon !== null);
  return entities.filter((e) => e.kind === def.kind && e.v[def.key] !== undefined);
}

/** Järjestyspeliin kelpaavat vain numeeriset ja etäisyysattribuutit, joilla on ohje. */
function rankableDefs(defs: DuelDef[], theme: string): DuelDef[] {
  return defs.filter(
    (d) =>
      d.mode !== "flag" &&
      d.rankLabel !== null &&
      (theme === "sekoitus" || d.theme === theme),
  );
}

export function hasRankContent(data: DuelData, theme: string): boolean {
  return rankableDefs(data.defs, theme).some(
    (d) => poolFor(data.entities, d).length >= MIN_LEN + (d.mode === "distance" ? 1 : 0),
  );
}

export function makeRankTask(
  data: DuelData,
  theme: string,
  used: Set<string>,
): RankTask | null {
  const defs = rankableDefs(data.defs, theme);
  if (!defs.length) return null;

  // Ensin yritetään viittä. Jos aineisto on ohut (järviä on 8 ja osa niistä
  // lähes samankokoisia), viiden ketju ei mahdu alarajan läpi lainkaan —
  // silloin neljä toimii. Mitattu: järvillä 0 tehtävää viidellä, 28 neljällä.
  for (let attempt = 0; attempt < 400; attempt++) {
    const relax = attempt >= 240;
    const def = pick(defs);
    const pool = poolFor(data.entities, def);

    let ref: DuelEntity | null = null;
    let candidates = pool;
    if (def.mode === "distance") {
      // Vertailupiste ei voi olla myös järjestettävänä.
      if (pool.length < MIN_LEN + 1) continue;
      ref = pick(pool);
      candidates = pool.filter((e) => e.id !== ref!.id);
    }

    const want = !relax && candidates.length >= TASK_LEN ? TASK_LEN : MIN_LEN;
    if (candidates.length < want) continue;

    const chosen = shuffle(candidates).slice(0, want);

    // Lipuissa harhauttimen läheisyys ratkaistaan alojen etäisyydellä. Sama
    // ajatus pätee tässä: sekalainen joukko eri aloilta on tunnistustehtävä,
    // ei tietotehtävä. Numeerisissa tämä koskee vain henkilöitä, joilla ala on.
    if (def.kind === "person") {
      const tooFar = chosen.some((a) =>
        chosen.some((b) => domainDistance(a.domain, b.domain) > def.maxDomainDistance),
      );
      if (tooFar) continue;
    }

    const items: RankItem[] = chosen.map((e) => {
      const value = ref ? haversineKm(ref, e) : e.v[def.key];
      const display = ref
        ? `${Math.round(value)} km`
        : e.d[def.key] ?? String(value);
      return { entity: e, value, display };
    });

    // Suunta arvotaan kun käänteinen ohje on olemassa. Ilman tätä sama
    // attribuutti kysyisi aina samaan suuntaan ja tehtävät alkaisivat
    // tuntua samalta, vaikka sisältö vaihtuisi.
    const reversed = def.rankLabelRev !== null && Math.random() < 0.5;
    const ascending = (def.winner === "low") !== reversed;
    const solution = [...items].sort((x, y) =>
      ascending ? x.value - y.value : y.value - x.value,
    );

    // Peräkkäisten erojen tarkistus. Yksikin liian pieni ero pilaa tehtävän.
    const steps: number[] = [];
    for (let i = 1; i < solution.length; i++)
      steps.push(step(def, solution[i - 1].value, solution[i].value));

    const floor = minStepFor(def);
    if (steps.some((s) => s <= 0 || s < floor)) continue;

    // Vähintään yhden vierekkäisen parin on oltava aidosti pohdittava.
    // Muuten tehtävä on tyyppiä "järjestä: Kiina, Intia, Islanti, Suomi",
    // jossa jokainen askel on itsestään selvä eikä mitään tarvitse tietää.
    const easy = def.easyGap;
    if (easy !== null && steps.every((s) => s >= easy)) continue;

    const taskKey = `${def.key}|${ref ? ref.id + "|" : ""}${solution
      .map((i) => i.entity.id)
      .sort()
      .join(",")}`;
    if (used.has(taskKey)) continue;
    used.add(taskKey);

    // Vaikeus tulee heikoimmasta lenkistä: se ratkaisee koko tehtävän.
    const weakest = Math.min(...steps);
    const difficulty = def.midGap !== null && weakest < def.midGap ? "vaikea" : "keski";

    // Sekoitettu järjestys ei saa olla vahingossa jo oikein.
    let shuffled = shuffle(items);
    for (let i = 0; i < 12 && sameOrder(shuffled, solution); i++) shuffled = shuffle(items);
    if (sameOrder(shuffled, solution)) continue;

    return {
      def,
      solution,
      shuffled,
      label: ((reversed ? def.rankLabelRev : def.rankLabel) ?? "").replaceAll(
        "{ref}",
        ref ? ref.partitive ?? ref.name : "",
      ),
      reversed,
      difficulty,
      ref,
      taskKey,
    };
  }
  return null;
}

function sameOrder(a: RankItem[], b: RankItem[]): boolean {
  return a.every((x, i) => x.entity.id === b[i].entity.id);
}

/** Oikein sijoitettujen määrä. Osittainen onnistuminen tuntuu reilummalta kuin kaikki tai ei mitään. */
export function scoreOrder(guess: RankItem[], solution: RankItem[]): number {
  return guess.reduce((n, item, i) => (item.entity.id === solution[i].entity.id ? n + 1 : n), 0);
}
