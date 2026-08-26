# Juntti Platform — CLAUDE.md

> **Brand name note:** The final domain/brand name may change from `juntti.com`.
> Never hardcode "Juntti" or "juntti.com" in UI strings, meta tags, OG images,
> share text, or emails. Always pull from `config/brand.ts` + env vars.
> Folder names like `apps/juntti` stay as-is — internal only.

## What this project is

Two-brand Finnish trivia platform sharing one Supabase backend and one admin tool:
- **juntti.com** — 30–50yo Finns. Humor, nostalgia, 90s culture.
- **tietovisa.fi** — 50–70yo Finns. History, classic culture, more serious tone.

First launch target is juntti.com. Tietovisa.fi comes after.

Solopreneur stack — Heikki (non-technical founder) makes product decisions,
Claude does all technical execution.

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + React 19, TypeScript, Tailwind 3
- **Database**: Supabase (Postgres) — project `pkfsdzqwfxqczirjddue`, region eu-north-1
- **Hosting**: Vercel, team `lakeboodoms-projects`
  - `juntti` project (`prj_ViEeVJ2YamK92zyB2nSOnfz9DuV1`) — https://juntti.vercel.app
  - `juntti-admin` project (`prj_Md8AuMx7wBLluHx8uRfSXrCvkERT`) — https://juntti-admin.vercel.app
- **AI**: Anthropic Claude API — model `claude-sonnet-4-6`. Wikipedia article grounding when a source URL is available (drops hallucinations sharply).
- **Admin auth**: Supabase magic-link, email allowlist gated in middleware (`heikki.aura@uplause.com`).
- **Icons in admin**: Lucide React. Homepage uses emoji fallback until `Juntti — Countdown Icons.pdf` is processed into Lucide-style SVG set.
- **Fonts (juntti.com)**: Roboto Condensed 700/900, Nunito 400/700/800/900, Caveat 600/700. Google Fonts in `layout.tsx`.
- **Monorepo**: npm workspaces. `npm install --prefix=../..` at Vercel root.

## Project Structure

```
juntti-platform/
├── apps/
│   ├── juntti/          # juntti.com Next.js app  ✓ homepage + play page
│   └── tietovisa/       # tietovisa.fi app  (Phase 5)
├── packages/
│   ├── db/              # typed Supabase clients  ✓ done
│   └── ai/              # Claude API wrapper + Wikipedia grounding  ✓ done
├── admin/               # admin tool  ✓ countdowns, quizzes, celebrities, schedule
├── supabase/
│   └── migrations/      # 001–004 applied
└── CLAUDE.md
```

## Core rules

1. **Admin UI uses Lucide icons.** Homepage uses emoji until the Countdown Icons PDF is processed. Never mix emoji + lucide in the same section on the homepage.
2. **Mobile-first** — design for 390px, max content width 430px, desktop is a bonus.
3. **One Supabase client per context** — `getSupabaseBrowser`/`getSupabaseServer`/`getSupabaseAdmin` from `@juntti/db`, or `getPublicSupabase` on juntti.com. Never create inline clients.
4. **`platform` field on all content** — never show tietovisa rows on juntti, or vice versa. `"both"` is visible on both.
5. **Finnish UI throughout** — all copy, labels, errors in Finnish.
6. **Brand-agnostic strings** — pull from `config/brand.ts` + env vars, never hardcode "Juntti" in text that ends up in UI.
7. **No login required for playing** — v1 is fully anonymous; `quiz_plays` logs results without PII, `session_id` is client-generated.
8. **Social sharing on every quiz result** — WA, FB, Messenger, X, copy link. Currently placeholders (alert) until Phase 5.
9. **AI quizzes ALWAYS get Wikipedia grounding when possible.** Pass a `sourceContext` to `generateQuiz`. Celebrity flow uses `celebrities.wikipedia_url` automatically; manual `/quizzes/new` has an optional Wikipedia URL field.
10. **Postgres DATE columns** — `like`/`ilike` don't work against them. Either use `to_char`/`extract` in SQL, or fetch and filter client-side (preferred for small tables like celebrities).

## Environment variables

Required in `.env.local` (gitignored) and on both Vercel projects:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY          # server-only, never exposed to browser
ANTHROPIC_API_KEY                  # admin + future cron use
NEXT_PUBLIC_SITE_NAME=Juntti
NEXT_PUBLIC_SITE_URL=https://juntti.com
NEXT_PUBLIC_BRAND_KEY=juntti
NEXT_PUBLIC_PLATFORM=juntti
```

All set on both `juntti` and `juntti-admin` Vercel projects as of 2026-04-18.
Local `apps/juntti/.env.local` and `admin/.env.local` carry the same values
for dev.

## Vercel REST quirks

- `NEXT_PUBLIC_*` vars are baked at build time. Set env vars BEFORE the
  first deploy, or trigger a rebuild afterwards.
- The Vercel "New Project" env inputs swallow multi-line paste. POST via
  `/api/v10/projects/:id/env` from a logged-in vercel.com tab
  (Chrome MCP `javascript_tool` with `credentials: "include"`) instead.
- The `type: "sensitive"` flag on Hobby plans can silently skip a
  variable — use `type: "encrypted"`.

## Supabase quirks

- Auth → URL Configuration must include the deploy domain in both Site URL
  and Redirect URLs (`https://juntti-admin.vercel.app/**` already added).
  Without this, magic link redirects break silently.
- Browser clients cannot use `sb_secret_*` keys — Supabase detects the UA
  and returns a 401 "Forbidden use of secret API key in browser". Useful
  as a validity check, but means a flagged key should be rotated.

## Design source of truth

Mockup at `~/Downloads/juntti_mobile_v1.html` on Heikki's laptop (not in
repo — it's a working scratch file; CLAUDE.md previously called this
`juntti_mobile_v2.html`, same file renamed). The homepage CSS (class
names, colors, typography) is copied **verbatim** from this file into
`apps/juntti/app/globals.css`; class names match so future mockup
revisions diff cleanly.

Juntti palette:
- `#C8120A` red (nav, primary CTAs, quiz player bg)
- `#F0C020` gold (accent, quiz score, brand highlights)
- `#1A1008` dark brown (hero, quiz cards)
- `#F5EDD8` cream (page bg, defaults)
- `#3A2810` ink (body text)
- `#2D4A2A` green (murresana block)

Host imagery at `apps/juntti/public/hosts/hero.png` (top) and `hero-2.png`
(mid-page). Black background + `mix-blend-mode: lighten` blends them into
the dark hero naturally. Swap by overwriting the files. Real icons for
countdowns in `Juntti — Countdown Icons.pdf` (in Heikki's Downloads),
not yet processed.

## Do not touch

- `.env.local` — manually maintained secrets
- `packages/db/types.ts` — auto-generated; regenerate via Supabase MCP
  (`generate_typescript_types`) instead of editing by hand
- `apps/juntti/app/globals.css` mockup-copied sections — if mockup
  changes, re-copy whole blocks; don't refactor to Tailwind utilities.

## Where to pick up next

See `docs/PROGRESS.md`. Short version: Phase 4 shipped, Phase 2 has two
remaining items (Murresanat CRUD + manual quiz authoring), Phase 5 lines
up next (social share, AdSense, cron, sitemap, tietovisa.fi).

## KORTTISÄÄNTÖ — tekstien on mahduttava kortteihin (lukittu 2026-08-26)

Sama bugi toistui kolmesti ennen tämän säännön kirjaamista: 2.0-sivujen
otsikot leikkautuivat korttien reunaan, koska Claude Designin prototyypit
käyttävät variaabelia Archivoa (wdth 62–76) mutta tuotannon
@fontsource-Archivo on **staattinen** — `font-variation-settings: "wdth"`
ei tee mitään ja glyyfit ovat ~15–20 % CD:n mitoitusta leveämpiä.
Otsikoissa vaadittu `overflow-wrap: normal; word-break: keep-all`
(suomen sanat eivät saa katketa keskeltä) tarkoittaa, että liian iso
sana ei rivity vaan leikkautuu `overflow: hidden`iin.

1. Jokaisen kortti-/hero-/otsikkotekstin on mahduttava elementtiinsä
   kokonaan kaikilla leveyksillä 320–2560 px. Leikkautunut teksti on
   julkaisublokkeri.
2. CD-paketin fonttikokoja ei koskaan käytetä sellaisenaan — jokainen
   otsikkokoko kalibroidaan mittaamalla ennen valmiiksi raportointia.
   Lähtöarvo: max ≈ 0.95 × (leveys / (0.67 × pisimmän sanan merkkimäärä)).
3. Ainoa kelvollinen mittaus on Range-pohjainen:
   `Range.selectNodeContents(el)` → `getClientRects()` → suurin
   rivileveys vs. lähimmän block-esivanhemman `clientWidth`.
   **`scrollWidth` EI kelpaa** — inline-elementeillä (span-otsikot) se
   palauttaa 0 ja piilottaa ylivuodon.
4. Mittaus jokaiselle otsikkoselektorille vähintään leveyksillä
   320/390/768/1024/1440/1920/2450 px. "0 ylivuotoa" on osa valmiin
   työn määritelmää.
5. `text-wrap: balance` vain yhdessä `overflow-wrap: normal` +
   `word-break: keep-all` kanssa.
6. Kalibroitu koko dokumentoidaan CSS-kommenttiin (mitattu tarve +
   CD:n alkuperäinen arvo + marginaali).
