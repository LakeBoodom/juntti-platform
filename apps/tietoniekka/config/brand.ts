/**
 * Brand abstraction layer for Tietoniekka.
 *
 * Reads env vars so brand strings stay configurable. Default values match
 * Tietoniekka.com — set Vercel env vars (NEXT_PUBLIC_BRAND_KEY, _SITE_NAME,
 * _SITE_URL) to override per environment.
 */

export const brand = {
  key: process.env.NEXT_PUBLIC_BRAND_KEY ?? "tietoniekka",
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Tietoniekka",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.com",
} as const;

export type BrandKey = string;
