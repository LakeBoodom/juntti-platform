import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tietosuojaseloste",
  description:
    "Miten Tietoniekka.fi käsittelee tietoja. Lyhyt vastaus: ei henkilötietoja kerätä.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "17.5.2026";

export default function TietosuojaPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--color-surface-dark, #0f1520)",
        color: "white",
        padding: "var(--space-xl, 40px) var(--space-md, 16px)",
      }}
    >
      <article
        style={{
          maxWidth: 760,
          margin: "0 auto",
          fontFamily: "var(--font-body, system-ui)",
          lineHeight: 1.65,
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-block",
            color: "rgba(255,255,255,0.6)",
            fontSize: 14,
            textDecoration: "none",
            marginBottom: 24,
          }}
        >
          ← Etusivulle
        </Link>

        <h1
          style={{
            fontFamily: "var(--font-display, system-ui)",
            fontWeight: 900,
            fontSize: "clamp(36px, 7vw, 56px)",
            color: "var(--color-brand-gold, #E8A320)",
            textTransform: "uppercase",
            letterSpacing: "-0.01em",
            lineHeight: 1.05,
            marginBottom: 8,
          }}
        >
          Tietosuojaseloste
        </h1>

        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.55)",
            marginBottom: 32,
          }}
        >
          Päivitetty {LAST_UPDATED}
        </p>

        <Section title="Lyhyesti">
          <p>
            Tietoniekka.fi <strong>ei kerää sinusta henkilötietoja</strong>.
            Et luo tiliä, et anna sähköpostia, etkä syötä mitään
            lomakkeisiin. Vierailusi näkyy meille vain anonyyminä tilastona.
          </p>
        </Section>

        <Section title="1. Rekisterinpitäjä">
          <p>
            <strong>Heikki Aura</strong>
            <br />
            Sähköposti tietosuoja-asioissa:{" "}
            <a
              href="mailto:heikki@stanssi.fi"
              style={{ color: "var(--color-brand-gold, #E8A320)" }}
            >
              heikki@stanssi.fi
            </a>
          </p>
        </Section>

        <Section title="2. Mitä järjestelmiä käytetään">
          <p>
            Käytämme kahta järjestelmää, jotka molemmat toimivat ilman
            henkilötietoja:
          </p>
          <ul style={listStyle}>
            <li>
              <strong>Plausible Analytics</strong> — kerää anonyymejä
              käyntitilastoja: sivun osoite, viittaava sivusto, maa
              (kaupungin tarkkuudella), selain ja laitetyyppi. Plausible ei
              käytä evästeitä eikä tallenna IP-osoitteita.
            </li>
            <li>
              <strong>Anonyymi pelitulos</strong> — kun pelaat visan,
              tallennamme tuloksen (oikeat vastaukset, pisteet) sekä
              satunnaisen tunnisteen, joka säilyy selaimesi omassa
              muistissa (localStorage). Tunniste ei liity kehenkään
              tunnistettavaan henkilöön — se on vain selainkohtainen
              merkkijono, jonka avulla peräkkäiset pelisi näkyvät samana
              tilastoissa.
            </li>
          </ul>
          <p>
            Emme kerää nimeä, sähköpostia, puhelinnumeroa, IP-osoitetta
            tai muita henkilötietoja. Sivustolla ei ole evästesuostumus-
            banneria, koska sivusto ei käytä seurantakeksejä.
          </p>
        </Section>

        <Section title="3. Mihin tiedot menevät">
          <p>Käytämme näitä palveluntarjoajia:</p>
          <ul style={listStyle}>
            <li>
              <strong>Vercel Inc.</strong> (Yhdysvallat) — sivuston
              tekninen hostaus. Käsittely perustuu EU:n hyväksymiin
              vakiosopimuslausekkeisiin (SCC). Vercel ei käsittele sisältöä
              johon liittyy henkilötietoja.
            </li>
            <li>
              <strong>Supabase</strong> — anonyymien pelitulosten
              tietokanta. Tietoniekan tiedot sijaitsevat EU:ssa (Tukholma,
              eu-north-1).
            </li>
            <li>
              <strong>Plausible Insights OÜ</strong> (Viro, EU) —
              käyntitilastot. Tiedot pysyvät EU:n alueella.
            </li>
          </ul>
          <p>
            Emme myy emmekä luovuta tietoja kolmansille osapuolille
            markkinointitarkoituksiin.
          </p>
        </Section>

        <Section title="4. Säilytysaika">
          <p>
            Anonyymejä tilastoja ja pelituloksia säilytetään toistaiseksi,
            koska ne eivät sisällä henkilötietoja. Selaimesi localStorageen
            tallennettu tunniste pysyy laitteellasi kunnes itse tyhjennät
            selaimen tiedot.
          </p>
        </Section>

        <Section title="5. Sinun oikeutesi">
          <p>
            Vaikka emme käsittele sinun henkilötietojasi, sinulla on
            tietosuoja-asetuksen mukaiset oikeudet pyytää tietoja,
            korjauksia tai poistoja. Ota yhteyttä yllä olevaan
            sähköpostiin.
          </p>
          <p>
            Voit milloin tahansa tyhjentää selaimellesi tallennetun
            anonyymin tunnisteen selaimen asetuksista (paikallisen
            tallennustilan tyhjennys).
          </p>
          <p>
            Jos epäilet että tietojasi käsitellään lainvastaisesti,
            sinulla on oikeus tehdä valitus valvontaviranomaiselle:{" "}
            <a
              href="https://tietosuoja.fi"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--color-brand-gold, #E8A320)" }}
            >
              tietosuoja.fi
            </a>
            .
          </p>
        </Section>

        <Section title="6. Muutokset">
          <p>
            Tätä selostetta voidaan päivittää. Päivityspäivä näkyy
            sivun yläosassa.
          </p>
        </Section>

        <div style={{ marginTop: 48, textAlign: "center" }}>
          <Link
            href="/"
            className="btn btn-primary btn-large"
            style={{ display: "inline-block" }}
          >
            ← TAKAISIN ETUSIVULLE
          </Link>
        </div>
      </article>
    </main>
  );
}

const listStyle: React.CSSProperties = {
  paddingLeft: 22,
  margin: "12px 0",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2
        style={{
          fontFamily: "var(--font-display, system-ui)",
          fontWeight: 800,
          fontSize: "clamp(20px, 3.5vw, 26px)",
          color: "white",
          textTransform: "uppercase",
          letterSpacing: "-0.01em",
          marginBottom: 12,
          marginTop: 0,
        }}
      >
        {title}
      </h2>
      <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 16 }}>
        {children}
      </div>
    </section>
  );
}
