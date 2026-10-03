// Henkilösivun osoite johdetaan nimestä (3.10.2026). celebrities.slug sisältää 111/380 henkilöllä visan
// otsikon ("spede-pasanen-savolainen-hauskuuttaja"), joten se ei kelpaa henkilön pysyväksi osoitteeksi.
// Nimestä johdettu slug on törmäyksetön koko aineistossa (tarkistettu 3.10.). Vanha slug ohjataan 301:llä.
const ERIKOIS: Record<string, string> = { æ: "ae", ø: "o", å: "a", ß: "ss", œ: "oe", ł: "l", đ: "d" };

export function henkiloSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[æøåßœłđ]/g, (c) => ERIKOIS[c] ?? c)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const henkiloHref = (name: string) => `/henkilo/${henkiloSlug(name)}`;
