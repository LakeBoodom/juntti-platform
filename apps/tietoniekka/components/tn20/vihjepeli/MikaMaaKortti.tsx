// MIKÄ MAA? — kortti Karttapelit-kokoelmaan (CD-paketti 7.11.2026, 3a/3b; tunnus v0.2). Kokoelman ainoa vaalea kortti: pala
// pelin kermaista lautaa tummalla sivulla. Kuvana pelin tunnus (keksitty maa kohdistimessa), koukkuna päivän vihje 1.
// Ensisijainen painike on lime-pilleri (UI-laatusääntö 5). Palvelinkomponentti.

import MikaMaaTunnus from "./MikaMaaTunnus";

export default function MikaMaaKortti({ href, paiva, vihje }: { href: string; paiva: string; vihje: string }) {
  return (
    <li className="kh-kortti kh-kortti--mm">
      <span className="kh-mm-kuva">
        <MikaMaaTunnus className="kh-mm-tunnus" />
      </span>
      <div className="kh-teksti">
        <p className="kh-laji">Päivän maa · {paiva}</p>
        <h2 className="kh-nimi" style={{ ["--kh-lw" as string]: 4 }}>
          <a href={href} data-tn-entry="karttapelit:mika-maa">Mikä maa?</a>
        </h2>
        <p className="kh-mm-vihje">{vihje}</p>
        <div className="kh-toiminnot">
          <span className="kh-cta tn-cta-lime" aria-hidden="true">Arvaa maa</span>
        </div>
      </div>
    </li>
  );
}
