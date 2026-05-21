import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://synttarit.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Synttärit tänään – Kuka juhlii tänään? | synttarit.com",
    template: "%s | synttarit.com",
  },
  description:
    "Katso kenen julkkiksen syntymäpäivä on tänään ja kuinka vanha hän on. Suomalaisten julkkisten syntymäpäiväkalenteri.",
  applicationName: "Synttärit",
  keywords: [
    "synttärit",
    "syntymäpäivä",
    "julkkikset",
    "suomalaiset julkkikset",
    "kuka syntyy tänään",
    "syntymäpäiväkalenteri",
  ],
  openGraph: {
    type: "website",
    locale: "fi_FI",
    url: SITE_URL,
    siteName: "synttarit.com",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0412",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fi">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
