"use client";
// Kaupunkisivun jakorivi (brief §0.7): sama Jakoalue kuin muissa peleissä, teksti "{korttinimi} – kokeile tätä:" ja lyhyt
// osoite /<slug> (ohjautuu kanoniseen /kaupunki/<slug>). Osoite selaimen originista, jotta esikatselun linkki
// osoittaa esikatseluun.
import { useEffect, useState } from "react";
import Jakoalue from "@/components/tn20/jako/Jakoalue";
import { jaaPeliTeksti } from "@/lib/korttinimi";
import { brand } from "@/config/brand";

export default function KaupunkiJako({ slug, korttinimi }: { slug: string; korttinimi: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => setUrl(`${location.origin}/${slug}`), [slug]);
  return (
    <div className="ks-jako">
      <Jakoalue
        id="ks-jako-h"
        otsikko={`Jaa ${korttinimi}-visat`}
        waNappi="Jaa WhatsAppissa"
        teksti={jaaPeliTeksti(korttinimi)}
        url={url}
        natiiviOtsikko={`${brand.name} · ${korttinimi}`}
      />
    </div>
  );
}
