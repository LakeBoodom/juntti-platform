import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { CookieBanner } from "@/components/cookie-banner";
import "./globals.css";

export const metadata: Metadata = {
  title: `${brand.name} — suomalainen tietovisa`,
  description: `${brand.name} — tänään syntyneet, päivän visa ja tulevat juhlat.`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fi">
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
