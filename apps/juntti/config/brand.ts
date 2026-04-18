/**
 * Brand abstraction layer.
 *
 * Reads env vars so the same codebase can be deployed under multiple brands
 * (juntti.com, tietovisa.fi, etc.) by changing Vercel env vars only.
 * Folder names like `apps/juntti` stay as-is (internal, not user-facing).
 */

export const brand = {
  key: process.env.NEXT_PUBLIC_BRAND_KEY ?? "juntti",
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Juntti",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://juntti.com",
} as const;

export type BrandKey = string;
