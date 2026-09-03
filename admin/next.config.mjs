/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@juntti/db", "@juntti/ai"],
  experimental: {
    serverActions: {
      // Kuvavisojen kuvien lataus kulkee Server Actionin kautta
      // (admin/app/kuvavisat/actions.ts, uploadKuvavisaImage). Next.js
      // oletusraja on 1 MB, joka torjui käytännössä kaikki oikeat kuvat
      // ("Body exceeded 1 MB limit", 413 -- Heikin 3.9.2026 raportoima
      // admin-kaatuminen digest 1145248108). Sovelluksen oma tarkistus
      // (actions.ts) sallii jo kuvia 5 MB:iin asti, joten nostetaan raja
      // sitä väljemmäksi tähän eikä tarkalleen samaksi.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
