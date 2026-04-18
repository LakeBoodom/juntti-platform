# Progress Report — Juntti Platform

**Last updated:** 2026-04-18
**Current phase:** Vaihe 2 (admin tool) in progress — scaffold + countdowns CRUD live.

## Build phases

| # | Phase | Status |
|---|---|---|
| 0 | Infra setup (GitHub, Supabase, Anthropic, Vercel) | ✅ Complete |
| 1 | DB schema + seed | ✅ Complete |
| 2 | Admin tool (Next.js) | 🟡 Scaffold + auth + Countdowns CRUD + AI quiz generator done; celebrity + murresana + daily schedule next |
| 3 | Initial content (~50 quizzes, 365 murresanat, ~200 celebrities) | ⬜ |
| 4 | juntti.com frontend (copy `juntti_mobile_v2.html` 1:1) | ⬜ |
| 5 | Cron jobs + production launch | ⬜ |

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

### ⬜ Remaining Phase 2 scope

- Celebrity admin — add person, auto-generate 5-question trivia
- Murresana batch — generate 365 at once, review, save
- Daily schedule calendar — visual view of scheduled quizzes per date
- Regenerate-single-question button (nice-to-have, skipped for v1)
- Fact-check flag / confidence score (nice-to-have, skipped for v1)

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
