/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@juntti/db"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "commons.wikimedia.org" },
    ],
  },
  /* Julkaisu 31.8.2026: 2.0 siirtyi juureen ja 1.0-reitit poistuivat.
     Kaikki vanhat osoitteet ohjataan 301:llä uusiin (SEO_STRATEGIA §3.1).
     /visa/<slug> säilyy samana polkuna (uusi sivu vastaa siihen suoraan). */
  async redirects() {
    return [
      /* Haaran esikatseluosoitteet → juuri */
      { source: "/2-0", destination: "/", permanent: true },
      { source: "/2-0/:path*", destination: "/:path*", permanent: true },
      /* 1.0 kategoriat → 2.0 kokoelmat */
      { source: "/kategoria/urheilu", destination: "/kokoelma/urheilu", permanent: true },
      { source: "/kategoria/maantieto", destination: "/kokoelma/matkakohteet", permanent: true },
      { source: "/kategoria/tv-sarjat", destination: "/kokoelma/tv", permanent: true },
      { source: "/kategoria/luonto", destination: "/kokoelma/luonto", permanent: true },
      { source: "/kategoria/historia", destination: "/kokoelma/historia", permanent: true },
      { source: "/kategoria/elokuvat", destination: "/kokoelma/elokuvat", permanent: true },
      { source: "/kategoria/musiikki", destination: "/kokoelma/musiikki", permanent: true },
      /* Ruoka & juoma ja Muoti & design eivät ole 2.0-julkaisussa → kokoelmalista */
      { source: "/kategoria/:slug*", destination: "/kokoelmat", permanent: true },
      /* 1.0 henkilösivut → Tunnetut henkilöt -hub (2.0:n henkilösivut tulevat myöhemmin) */
      { source: "/sankari/:slug*", destination: "/kokoelma/tunnetut-henkilot", permanent: true },
      /* 1.0 pelimuodot */
      { source: "/mega", destination: "/megavisat", permanent: true },
      { source: "/kumpi", destination: "/", permanent: true },
      { source: "/jarjesta", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
