import type { Metadata, Viewport } from "next";
import Script from "next/script";
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
  description: `${brand.name} — päivittäin vaihtuva visa, julkkisten synttärit. Aina ilmainen.`,
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
    description: `Päivittäin vaihtuva visa, julkkisten synttärit. Aina ilmainen.`,
    images: [
      {
        url: "/og-image.png",
        width: 1729,
        height: 910,
        alt: `${brand.name} — testaa tietosi`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name} — testaa tietosi`,
    description: `Päivittäin vaihtuva visa, julkkisten synttärit.`,
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
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
            description: `${brand.name} — suomalainen tietovisa-sivusto. Päivittäin vaihtuva visa, yli 9 kategoriaa, päivän sankari -profiilit. Aina ilmainen, ei rekisteröitymistä.`,
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
            description: `Suomenkielisiä tietovisoja: päivän visa, kategoriat (urheilu, maantieto, luonto, historia, tv-sarjat, elokuvat, musiikki, ruoka & juoma, muoti & design), kuvavisat (liput, vaakunat, linnut, kasvit, eläimet) ja päivän sankari -profiilit. Tietoniekka on ilmainen suomalainen visa-sivusto.`,
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
