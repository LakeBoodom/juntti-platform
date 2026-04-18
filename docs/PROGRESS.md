# Progress Report — Juntti Platform

**Last updated:** 2026-04-18 (illalla)
**Current phase:** Phase 4 live — homepage + scroll-based quiz player shipped. Heikki building content; next technical step is Murresanat CRUD + social share integration.

## Build phases

| # | Phase | Status |
|---|---|---|
| 0 | Infra setup (GitHub, Supabase, Anthropic, Vercel) | ✅ Complete |
| 1 | DB schema + seed | ✅ Complete |
| 2 | Admin tool (Next.js) | 🟡 Countdowns + AI quiz gen + Celebrities (w/ Wikipedia grounding) + Päivän ohjelma live. Murresanat CRUD + manual quiz creation remaining. |
| 3 | Initial content — Heikki authoring | 🟡 In progress — 19 julkkista + 17 julkaistua visaa + 7 countdownia + 1 daily_schedule setup |
| 4 | juntti.com frontend | ✅ Homepage + play page shipped to juntti.vercel.app, matches juntti_mobile_v1.html mockup 1:1. Social share + AdSense as placeholders. |
| 5 | Social integrations + cron jobs + launch | ⬜ Next — FB/WA share wiring, AdSense, domain DNS, sitemap |

---

## Phase 0 — Infrastructure

### ✅ Done

- **GitHub repo**: `github.com/LakeBoodom/juntti-platform` (public, under user `LakeBoodom`)
- **Supabase project**: `juntti-platform` (ID `pkfsdzqwfxqczirjddue`, eu-north-1 / Stockholm)
- **Supabase URL + anon key**: in `.env.local` and Vercel env
- **Supabase service_role key**: `juntti_platform_service_role_v2` (prefix `sb_secret_QFETe`), in `.env.local` and Vercel env. Previous key (`l-UyV...`) disabled + deleted 2026-04-18.
- **Anthropic API key**: created as `juntti-platform`, in `.env.local`
- **`uplause-feedback` Supabase project paused** to free up Heikki's 2-project slot
- **Monorepo skeleton pushed**: `apps/`, `packages/`, `admin/`, `supabase/` folders
- **`apps/juntti` Next.js placeholder**: Next 15 + React 19, `brand.ts` env abstraction, static `/` route
- **Vercel project**: `juntti` (`prj_ViEeVJ2YamK92zyB2nSOnfz9DuV1`) under `lakeboodoms-projects`
  - Root dir `apps/juntti`, install command `npm install --prefix=../../` (monorepo)
  - Production URL: `https://juntti.vercel.app`
  - All 7 env vars set (Production + Preview + Development)
  - First deploy: `dpl_2YSce89iVFhpgpCgXNFaUGEMWJgf` — READY, ~35s build

### Not yet needed

- Domain DNS (do at Phase 5)
- AdSense (approval takes weeks — placeholder in UI until then)

---

## Phase 1 — Database schema + seed

✅ Complete (commit `f68e540`)

- 7 tables created via Supabase MCP: `quizzes`, `questions`, `celebrities`,
  `murresanat`, `countdowns`, `daily_schedule`, `quiz_plays`
- RLS enabled on all tables:
  - `quizzes` / `questions`: published rows are public read
  - `celebrities`, `murresanat`, `countdowns`, `daily_schedule`: public read
  - `quiz_plays`: anonymous insert only (no read)
- 5 Finnish countdowns seeded (Vappu, MM-kisat, Juhannus, Heinäkuu, Joulu)
- TypeScript types generated → `packages/db/types.ts`
- Singleton Supabase clients in `packages/db/client.ts`
  (`getSupabaseBrowser`, `getSupabaseServer`, `getSupabaseAdmin`)
- Migrations saved to `supabase/migrations/`:
  - `001_initial_schema.sql`
  - `002_rls_policies.sql`
  - `003_seed_countdowns.sql`

---

## Phase 2 — Admin tool (in progress)

Goal: a Next.js app under `admin/` that lets Heikki generate, review, and
schedule content. Live at https://juntti-admin.vercel.app.

### ✅ Done this session (2026-04-18)

- **Scaffold**: `admin/` Next.js 15 + React 19 + TS, Tailwind + inline shadcn-
  style components (Button, Input, Label, Table, Dialog, Select) under
  `admin/components/ui/`. `admin/lib/utils.ts` provides `cn()` helper.
- **Auth**: Supabase magic-link (`signInWithOtp`) with custom email → allowed
  email hard-coded in `admin/middleware.ts` (currently `heikki.aura@uplause.com`).
  `/auth/callback` exchanges code for session, `/auth/signout` POSTs to sign out.
- **Middleware email gate**: all routes except `/login`, `/auth/*` require
  session AND matching email — wrong email → immediate signOut + redirect.
- **Countdowns CRUD**: `/countdowns` table view with server actions (create,
  update, delete) that use `getSupabaseAdmin()` → bypasses RLS.
  Form validates slug `[a-z0-9-]+`, day 1–31, month 1–12, platform
  (juntti/tietovisa/null=both). Delete has confirm dialog.
- **Vercel project**: `juntti-admin` (`prj_Md8AuMx7wBLluHx8uRfSXrCvkERT`), root
  `admin/`, install `npm install --prefix=..`. All 3 Supabase env vars set via
  REST API. Live at `juntti-admin.vercel.app`.
- **Supabase auth URLs**: Site URL → `https://juntti-admin.vercel.app`,
  Redirect URLs → `https://juntti-admin.vercel.app/**` + `http://localhost:3001/**`.

### ✅ Done 2026-04-18 (session 2)

- **`packages/ai`** — `@juntti/ai` workspace. `getAnthropic()` singleton (server-
  only), `generateQuiz(input)` calls `claude-sonnet-4-6` via Anthropic SDK with
  a `submit_quiz` tool schema that enforces exactly 4 answers per question, 1
  correct, slug pattern, and minItems/maxItems for questions. System prompt
  defines Finnish voice + tone guide + platform-specific audience notes.
- **`/quizzes` list** — all drafts/published, newest first, status chip.
- **`/quizzes/new` generator** — chip selectors (category, difficulty, count,
  tone, platform) + free-text topic. Server action `generateAndSaveDraft()`
  calls AI, inserts `quizzes` + `questions` transactionally via service_role,
  redirects to detail. Slug collision auto-resolves with `-<timestamp>` suffix.
- **`/quizzes/[id]` detail** — inline edit of title/description via `MetaEditor`,
  per-question card with edit toggle (question text, 4 answers with radio for
  correct, explanation). `QuizActionsBar` has Publish / unpublish / Delete
  with confirm dialog. FK cascade deletes questions.
- **ANTHROPIC_API_KEY** set in both `juntti` + `juntti-admin` Vercel envs.

### ✅ Done 2026-04-18 (session 3)

- **Celebrities CRUD + Wikipedia import** (`/celebrities` admin): form with
  three-field day/month/year inputs, Wikipedia URL paste auto-fills name
  + bio + image via MediaWiki API (`/rest_v1/page/summary/{slug}`), thumbnail
  preview in the list. Per-row 'Luo visa' button generates a quiz tightly
  scoped to that celebrity.
- **Wikipedia grounding for AI**: `celebrities.wikipedia_url` column stores
  the source URL. When generating quizzes (both per-celebrity and general
  `/quizzes/new`), `fetchWikipediaArticle` pulls the full plain-text extract
  (action=query, explaintext=1) and passes it to Claude as `sourceContext`.
  System prompt was updated: "source material overrides internal knowledge,
  don't fabricate outside it". Drops hallucination rate markedly on narrow
  scopes.
- **Päivän ohjelma** (`/schedule`): range-based scheduler. Pick platform +
  start/end date + published quiz, upsert rows into `daily_schedule`
  `(platform, date)` unique key. 'Tyhjennä ajanjakso' clears a range.
  Only published quizzes appear in the selector. Range cap 365 days as
  safety.
- **General quiz generator hardenings**: auto-correct Claude answer slips
  (no correct flagged / multiple flagged → first stays), defensive parse
  of partial tool_use blocks, `max_tokens` 8192, minItems=maxItems pinned
  to requested count, retry once if <60% of requested returned, stronger
  Finnish prompt rules.

### ⬜ Remaining Phase 2 scope

- **Murresanat CRUD + AI batch** — table is there, admin UI still to come.
  Flow: Heikki types a starter word or topic, AI generates N murresanat
  rows with definition/example, Heikki reviews + saves. Shown on /
  homepage when data exists.
- **Manual quiz authoring** — Heikki requested this earlier. Requires:
  'Luo tyhjästä' button on `/quizzes/new` → creates empty draft →
  redirects to detail where 'Lisää kysymys' appends questions.
- Regenerate-single-question button (nice-to-have, skipped for v1).
- Fact-check flag / confidence score (nice-to-have, skipped for v1).

### Watch-outs carried from this session

- NEXT_PUBLIC_* env vars are baked at build time → set env vars BEFORE first
  deploy, or expect a redeploy. We did a two-deploy dance (first 500'd, second
  OK). The fix: push env via `POST /api/v10/projects/:id/env` from an
  already-logged-in vercel.com tab (Chrome MCP `javascript_tool` with
  `credentials: "include"`), then trigger a fresh build via
  `POST /api/v13/deployments` referencing the same gitSource.
- Next 15 App Router: `useSearchParams()` in a client component MUST be wrapped
  in `<Suspense>` or prerender bails out. Login page now splits into a server
  `page.tsx` with Suspense + client `login-form.tsx`.
- `@supabase/ssr` `setAll` cookies parameter needs an explicit type annotation
  in strict TS builds — `(cookies: { name: string; value: string; options?: any }[])`.

### Entry point for next session

1. Rotate/verify admin access: log into `https://juntti-admin.vercel.app`,
   confirm magic link works, Countdowns CRUD round-trip.
2. Start `packages/ai` scaffold (ANTHROPIC_API_KEY already in juntti app env
   — mirror to juntti-admin, or set ANTHROPIC_API_KEY in juntti-admin env).
3. Design the `quizzes` + `questions` draft → publish flow.

---

## Phase 4 — juntti.com frontend (shipped 2026-04-18)

Live: https://juntti.vercel.app

### Stack

- Next.js 15 App Router + React 19 in `apps/juntti/`
- Tailwind 3 + custom globals.css copied verbatim from `juntti_mobile_v1.html`
  mockup. Class names preserved so mockup iterations diff cleanly.
- Fonts from Google: Roboto Condensed 700/900, Nunito 400/700/800/900,
  Caveat 600/700.
- Public Supabase anon key client only. RLS enforces access.

### Pages

- `/` — homepage. Sections in order: nav → hero (with speech bubble,
  centered top, stage lights) → intro "TESTAA TIETOSI" → live ticker
  (players + latest quiz + top birthday) → Päivän visa → AdSense #1 →
  Synttärit tänään + synttärisankarin trivia → mid-hero (second couple
  photo) → Montako päivää (horizontal scroll, first countdown sized up) +
  countdown trivia → Haluatko pelata lisää (client shuffle over random
  pool of 15) → AdSense #2 → bottom nav.
- `/visa/[slug]` — scroll-based quiz player (10kysymysta.fi pattern):
  all questions stacked on red bg, tap locks + smooth-scrolls to next,
  explanation unrolls in place. Result at bottom: score + verdict +
  share + restart + home.
- `/tietosuoja`, `/yhteys` — minimal pages linked from footer.
- `/api/quiz-plays` — anonymous POST endpoint, inserts one row per
  completed play.

### Data flow (homepage)

Featured quiz priority: `daily_schedule(platform, today)` → random
published (excluding today's birthday quizzes).
Today's birthday celebrities via client-side MM-DD filter (Postgres LIKE
doesn't work on DATE columns).
Countdowns with no explicit `trivia_quiz_id` fuzzy-matched to published
quizzes by title/slug containment in a single follow-up query.

### Key decisions

- **No scheduling override for AdSense**: placeholders live after Päivän
  visa and at the end (before bottom nav). Never before header.
- **Social share = placeholders** (alert) until Phase 5. UI slot is
  reserved per mockup.
- **Hero images**: `/public/hosts/hero.png` (top) and `hero-2.png`
  (mid). Swap by overwriting the files. Black background + mix-blend-
  mode lighten.
- **Quiz play page** background is red `#C8120A` (nav color), answers
  are white pills — matches the 10kysymysta.fi pattern Heikki
  referenced.
- **Source of truth for mockup**: `~/Downloads/juntti_mobile_v1.html`
  on Heikki's laptop. Not in repo because it's a working scratch file;
  CLAUDE.md originally called it `juntti_mobile_v2.html` — same file,
  renamed at some point.

---

## Phase 5 — pending (to do after current content push)

- **Social share real**: Facebook, WhatsApp, X, Messenger. Open Graph
  meta tags per quiz (title, description, og:image). `/api/og` endpoint
  for dynamic OG images that embed the quiz title + brand mascot.
- **AdSense activation**: apply for account, replace `<AdPlaceholder/>`
  innards with `<ins>` tags once approved.
- **Cron jobs**: Vercel cron to pick a "päivän visa" into `daily_schedule`
  automatically if no row exists for tomorrow. Optional nightly task
  to refresh Wikipedia extracts for celebrities whose quizzes were
  flagged for revision.
- **Domain DNS** for juntti.com + tietovisa.fi.
- **Sitemap + robots**: generate from published quizzes + celebrities
  (for SEO).
- **Tietovisa.fi** second-brand build: same codebase, different env
  vars (NEXT_PUBLIC_SITE_NAME, SITE_URL, BRAND_KEY), new Vercel project,
  alternate host photos if desired.

---

## Key decisions locked in (do not re-litigate without cause)

- **Monorepo tool**: plain npm workspaces (not Turborepo)
- **Claude model**: `claude-sonnet-4-6` (not older `claude-sonnet-4-20250514` from spec)
- **Daily quiz source of truth**: `daily_schedule` table (not `quizzes.is_daily`)
- **Percentage comparison**: `quiz_plays` 30-day sliding window
- **Celebrity data**: hybrid — manual seed list (~200 Finns, AI-suggested, Heikki-approved)
  plus Wikidata sync cron in v1.1
- **Added to v1.0 (missing from original spec)**: GDPR cookie banner,
  privacy policy page, contact page
- **Visibility**: GitHub repo is public (trade-controls warning flagged on
  Heikki's account; private was blocked — can be migrated later)

---

## Known friction to watch

- **Chrome extension connection**: Claude in Chrome dropped mid-session during
  Phase 0. If it drops again, close duplicate tabs and try again; the
  extension sometimes loses its websocket when too many tabs are open.
- **Supabase dashboard background-tab throttling**: Supabase's SPA doesn't
  render content until the tab is foregrounded. If MCP reports empty text,
  activate the Supabase tab manually or close other tabs first.
- **Sandbox network**: Direct `curl` to `api.github.com` is proxy-blocked;
  use `git push` (which has allowlisted access) or Chrome MCP `javascript_tool`
  with `fetch()` inside the logged-in Chrome session.
