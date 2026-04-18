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

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database**: Supabase (Postgres) — project `pkfsdzqwfxqczirjddue`, region eu-north-1
- **Hosting**: Vercel (team `lakeboodoms-projects`)
- **AI**: Anthropic Claude API — model `claude-sonnet-4-6`
- **Icons**: Lucide React (NO emojis in UI — see docs)
- **Monorepo**: npm workspaces

## Project Structure

```
juntti-platform/
├── apps/
│   ├── juntti/          # juntti.com Next.js app
│   └── tietovisa/       # tietovisa.fi Next.js app (v2)
├── packages/
│   ├── ui/              # shared components
│   ├── db/              # typed Supabase clients + types  ✓ done
│   └── ai/              # Claude API + content generation
├── admin/               # admin tool (Next.js)
├── supabase/
│   └── migrations/      # all DB migrations  ✓ 001–003 applied
└── CLAUDE.md
```

## Core rules

1. **No emojis in UI.** Lucide React icons only (see docs/DESIGN_SYSTEM.md for map).
2. **Mobile-first** — design for 390px, desktop is bonus.
3. **One Supabase client** — always use `getSupabaseBrowser()` / `getSupabaseServer()` / `getSupabaseAdmin()` from `@juntti/db`. Never create inline clients.
4. **`platform` field on all content** — never show content from the wrong brand.
5. **Finnish UI throughout** — all copy, labels, errors in Finnish.
6. **Brand-agnostic strings** — pull from `config/brand.ts`, never hardcode.
7. **No login required for playing** — v1 is fully anonymous; localStorage for streak only.
8. **Social sharing on every quiz result** — WA, FB, Messenger, X, copy link.

## Environment variables

Required in `.env.local` (gitignored) and Vercel env:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY          # server-only, never exposed to browser
ANTHROPIC_API_KEY
NEXT_PUBLIC_SITE_NAME=Juntti
NEXT_PUBLIC_SITE_URL=https://juntti.com
NEXT_PUBLIC_BRAND_KEY=juntti
NEXT_PUBLIC_PLATFORM=juntti
```

Supabase URL is already filled in local `.env.local`. Service role key is
pending — see `docs/PROGRESS.md` for how to finish it.

## Do not touch

- `.env.local` — manually maintained secrets
- `packages/db/types.ts` — auto-generated; regenerate via Supabase MCP
  (`generate_typescript_types`) instead of editing by hand

## Where to pick up next

See `docs/PROGRESS.md` for the current phase, what's done, and the first thing
to do next session.
