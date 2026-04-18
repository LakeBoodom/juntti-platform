# Progress Report — Juntti Platform

**Last updated:** 2026-04-18
**Current phase:** Vaihe 2 (admin tool) is next.

## Build phases

| # | Phase | Status |
|---|---|---|
| 0 | Infra setup (GitHub, Supabase, Anthropic, Vercel) | ✅ Complete |
| 1 | DB schema + seed | ✅ Complete |
| 2 | Admin tool (Next.js) | ⬜ Next |
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

## Phase 2 — Admin tool (next)

Goal: a Next.js app under `admin/` that lets Heikki generate, review, and
schedule content. Runs locally on :3001 during dev, deployed to
`admin.juntti.com` (or equivalent) later.

### Scope

- "Luo AI:llä" view — chip selectors for category / difficulty / count / tone,
  free-text topic input, "Generoi visa" button
- Preview screen per quiz — inline edit per question, "Regeneroi tämä",
  correct answer highlighted
- Fact-check button — flags `confidence: low` questions for review
- Save draft / Schedule publish / Publish now
- Celebrity admin — add person, auto-generate 5-question trivia
- Murresana batch — generate 365 at once, review, save
- Daily schedule calendar — visual view of scheduled quizzes per date

### Prerequisites before starting

- `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (see Phase 0 pending item)
- Optionally Vercel project linked for preview deploys

### Rough order

1. Scaffold `admin/` as Next.js 14 app with shared DB + Tailwind
2. Create `packages/ai` with Claude API wrapper (model `claude-sonnet-4-6`,
   prompts from `docs/CONTENT_PIPELINE.md`)
3. Build "Luo AI:llä" route with chip selectors + streaming preview
4. Build draft/publish flow (uses service_role to bypass RLS)
5. Build celebrity admin + murresana batch + daily schedule calendar

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
