# Juntti Platform

Finnish trivia and entertainment platform. Two brands sharing one backend:
**juntti.com** (30–50yo, humor/nostalgia) and **tietovisa.fi** (50–70yo,
history/classic). Frontend is two separate Next.js apps; one shared admin tool
manages content via AI generation.

## Status

Early setup phase. See [`docs/PROGRESS.md`](./docs/PROGRESS.md) for where
we're at and what's next.

## Repo layout

```
apps/juntti/        juntti.com frontend
apps/tietovisa/     tietovisa.fi frontend (v2)
packages/ui/        shared components
packages/db/        typed Supabase client + DB types
packages/ai/        Claude API wrapper + content generation
admin/              content admin tool
supabase/
  migrations/       DB migrations (applied in order 001..)
docs/               PRD, design system, progress
```

## Local development

```bash
npm install
npm run dev:juntti     # :3000
npm run dev:admin      # :3001
```

## Stack

Next.js 14 · Supabase (Postgres) · Vercel · Anthropic Claude API · Tailwind · TypeScript
