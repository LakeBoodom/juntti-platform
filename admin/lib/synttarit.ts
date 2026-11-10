// Synttärit.com beta (toimeksianto §6–7, 11.10.2026): yhteiset tyypit ja apurit adminin
// Synttärit-välilehdille. Taulut: synttarit_pages, synttarit_greetings (migraatio 20261108).

/** Betan osoite esikatselulinkkejä varten. Vaihdetaan env-muuttujalla, kun beta.-osoite on käytössä. */
export function synttaritBetaUrl(): string {
  return (process.env.NEXT_PUBLIC_SYNTTARIT_BETA_URL || "https://synttarit.vercel.app").replace(/\/$/, "");
}

// Päivän sivun reitti /1-lokakuu. Kuukausi perusmuodossa ja ilman ääkkösiä (kesakuu, heinakuu),
// jotta osoite pysyy siistinä jaettaessa.
const KUUKAUDET = [
  "tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesakuu",
  "heinakuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu",
];

/** birth_date (yyyy-mm-dd) → "1-lokakuu" */
export function paivaSlug(birthDate: string): string {
  const [, m, d] = birthDate.split("-").map(Number);
  return `${d}-${KUUKAUDET[m - 1]}`;
}

export const PAGE_TYPES = [
  { value: "opas", label: "Opas" },
  { value: "merkkivuosi", label: "Merkkivuosi" },
  { value: "onnittelut", label: "Onnittelut" },
  { value: "lapset", label: "Lasten synttärit" },
  { value: "juhlaopas", label: "Juhlaopas" },
  { value: "staattinen", label: "Staattinen sivu" },
] as const;
export type PageType = (typeof PAGE_TYPES)[number]["value"];

export const TONES = ["lämmin", "lyhyt", "hauska", "juhlava"] as const;
export type Tone = (typeof TONES)[number];

export const RECIPIENTS = ["kaikille", "ystävä", "työkaveri", "sukulainen", "puoliso", "isovanhempi"] as const;
export type Recipient = (typeof RECIPIENTS)[number];

export type Status = "draft" | "published";
export const STATUS_LABEL: Record<Status, string> = { draft: "Luonnos", published: "Julkaistu" };

// ---- body-lohkot ----

export type Block =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "tip"; title?: string; text: string }
  | { type: "quote"; text: string; source?: string }
  | { type: "checklist"; title?: string; items: string[] }
  | { type: "table"; rows: string[][] } // ensimmäinen rivi = otsikkorivi
  | { type: "tietoniekka"; title: string; text?: string; url: string }
  | {
      type: "gift_idea";
      number: number;
      title: string;
      for_whom?: string;
      why?: string;
      make_it_yours?: string;
      price_band?: string;
      image_url?: string;
      partner?: string;
      partner_url?: string;
    }
  | { type: "ad" };

export type BlockType = Block["type"];

export const BLOCK_TYPES: { value: BlockType; label: string }[] = [
  { value: "heading", label: "Väliotsikko" },
  { value: "paragraph", label: "Kappale" },
  { value: "gift_idea", label: "Lahjaidea" },
  { value: "tip", label: "Vinkki" },
  { value: "quote", label: "Lainaus" },
  { value: "checklist", label: "Muistilista" },
  { value: "table", label: "Taulukko" },
  { value: "tietoniekka", label: "Tietoniekka-nosto" },
  { value: "ad", label: "Mainospaikka" },
];

export function emptyBlock(type: BlockType, existing: Block[]): Block {
  switch (type) {
    case "heading":
    case "paragraph":
      return { type, text: "" };
    case "tip":
      return { type, title: "", text: "" };
    case "quote":
      return { type, text: "", source: "" };
    case "checklist":
      return { type, title: "", items: [""] };
    case "table":
      return { type, rows: [["", ""], ["", ""]] };
    case "tietoniekka":
      return { type, title: "", text: "", url: "" };
    case "gift_idea":
      return {
        type,
        number: existing.filter((b) => b.type === "gift_idea").length + 1,
        title: "",
        for_whom: "",
        why: "",
        make_it_yours: "",
        price_band: "",
        image_url: "",
        partner: "",
        partner_url: "",
      };
    case "ad":
      return { type };
  }
}

/** Lyhyt kuvaus lohkosta listaan (kun lohko on suljettuna). */
export function blockSummary(b: Block): string {
  switch (b.type) {
    case "heading":
    case "paragraph":
    case "quote":
      return b.text;
    case "tip":
      return b.title || b.text;
    case "checklist":
      return b.title || b.items.filter(Boolean).join(", ");
    case "table":
      return `${b.rows.length} riviä`;
    case "tietoniekka":
      return b.title;
    case "gift_idea":
      return `${b.number}. ${b.title}`;
    case "ad":
      return "Mainospaikka (näkyy vasta kun mainokset kytketään päälle)";
  }
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/å/g, "a")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9/]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "")
    .replace(/-?\/-?/g, "/");
}
