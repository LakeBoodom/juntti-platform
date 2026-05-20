import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITEE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://synttarit.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Synttärit tänään – Kuka juhlii tänään? | synttarit.com",
    template: "%s | synttarit.com",
  },
  description:
    "Kayso kenen julkkiksen syntymääivä on tänään ja kuinka vanha hän on. Suomalaisten julkkisten syntymäpäiväkkalenteri.",
  applicationName: "Synttärit",
  keywords: [
    "synttärit",
    "syntymäpäivä",
    "julkkikset",
    "suomalaiset julkkikset",
    "kuka syntyy tänään",
    "syntymääiväkkalenteri",
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
      <body>{children}</body>
    </html>
  );
}
