import Link from "next/link";
import { brand } from "@/config/brand";

export const metadata = { title: `Tietosuoja — ${brand.name}` };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-xl space-y-4 px-4 pb-24 pt-6">
      <Link href="/" className="text-sm text-ink-muted underline">
        ← Etusivulle
      </Link>
      <h1 className="text-2xl font-bold">Tietosuoja</h1>
      <p className="text-sm text-ink-muted">
        {brand.name} ei kerää henkilötietoja. Sivusto tallentaa anonyymin
        pelikerta-rivin (visan tunniste, tulos, satunnainen istunto-id) laadun
        parantamiseksi. Emme käytä mainoksia emmekä kolmannen osapuolen
        seurantatyökaluja.
      </p>
      <h2 className="pt-2 text-base font-semibold">Evästeet</h2>
      <p className="text-sm text-ink-muted">
        Tallennamme selaimeesi yhden evästeen: <code>juntti-cookie-consent</code>,
        joka muistaa suostumuksesi. Pelikokemuksen parantamiseksi käytämme myös
        selaimen localStoragea (istunto-id, putki) — tämä tieto ei lähde
        palvelimelle.
      </p>
      <h2 className="pt-2 text-base font-semibold">Yhteys</h2>
      <p className="text-sm text-ink-muted">
        Kysymykset tietosuojasta: <Link href="/yhteys" className="underline">yhteys</Link>.
      </p>
    </main>
  );
}
