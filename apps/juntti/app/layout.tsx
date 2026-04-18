import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { CookieBanner } from "@/components/cookie-banner";
import "./globals.css";

export const metadata: Metadata = {
  title: `${brand.name} — oikean Suomen kotisivu`,
  description: `${brand.name} — päivittäin vaihtuva visa, synttärisankarit ja tulevat juhlat.`,
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
          href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@700;900&family=Nunito:wght@400;700;800;900&family=Caveat:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="app">{children}</div>
        <CookieBanner />
      </body>
    </html>
  );
}
