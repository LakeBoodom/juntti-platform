import type { Metadata, Viewport } from "next";
import Script from "next/script";

/* Self-hosted fontit (brief osio 2): @fontsource-paketit — woff2:t tulevat
   npm-paketista ja tarjoillaan omalta domainilta. Ei kutsuja Googleen. */
import "@fontsource/barlow/400.css";
import "@fontsource/barlow/500.css";
import "@fontsource/barlow/600.css";
import "@fontsource/barlow/700.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/800.css";
import "@fontsource/barlow-condensed/900.css";
import { brand } from "@/config/brand";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${brand.name} — testaa tietosi`,
    template: `%s | ${brand.name}`,
  },
  description: `${brand.name} — suomalainen tietovisasivusto. Yli 500 visaa, Päivän visa, megavisat ja kuvavisat. Aina ilmainen.`,
  applicationName: brand.name,
  keywords: [
    "visa",
    "tietovisa",
    "trivia",
    "päivän visa",
    "suomalainen visa",
    "tietoniekka",
  ],
  authors: [{ name: brand.name }],
  openGraph: {
    type: "website",
    locale: "fi_FI",
    url: SITE_URL,
    siteName: brand.name,
    title: `${brand.name} — testaa tietosi`,
    description: `Suomalainen tietovisasivusto — yli 500 visaa, Päivän visa, megavisat ja kuvavisat. Aina ilmainen.`,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${brand.name} — testaa tietosi`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name} — testaa tietosi`,
    description: `Suomalainen tietovisasivusto — yli 500 visaa, aina ilmainen.`,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1520",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fi">
      <body>
        {/* JSON-LD: Organization + WebSite — helps Google + LLM crawlers */}
        <Script
          id="ld-organization"
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: brand.name,
            url: SITE_URL,
            logo: `${SITE_URL}/og-image.png`,
            description: `${brand.name} — suomalainen tietovisasivusto. Yli 500 visaa: Päivän visa, kokoelmat, megavisat ja kuvavisat. Aina ilmainen, ei rekisteröitymistä.`,
            sameAs: [],
          })}
        </Script>
        <Script
          id="ld-website"
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: brand.name,
            url: SITE_URL,
            inLanguage: "fi-FI",
            description: `Suomenkielisiä tietovisoja: Päivän visa, kokoelmat (urheilu, jääkiekko, jalkapallo, elokuvat, tv, musiikki, historia, luonto, matkakohteet, kulttuuri, Suomen kaupungit, tunnetut henkilöt), megavisat ja kuvavisat (liput, vaakunat, linnut, kasvit, eläimet). Tietoniekka on ilmainen suomalainen tietovisasivusto.`,
            publisher: {
              "@type": "Organization",
              name: brand.name,
              url: SITE_URL,
            },
          })}
        </Script>
        {children}
        {PLAUSIBLE_DOMAIN && (
          <Script
            defer
            src="https://plausible.io/js/script.js"
            data-domain={PLAUSIBLE_DOMAIN}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
