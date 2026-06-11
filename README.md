# Office Meal Counter

Frontend app for tracking a 26-meal office lunch subscription with Supabase auth and Supabase-backed meal entries.

See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for the project map, data flow, Supabase table assumptions, and file-by-file notes.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The app uses the Next.js App Router under `src/app`.

Main entry file:

```txt
src/app/page.tsx
```

## Checks

```bash
npm run lint
npm run build
```

## Environment

Create `.env.local` with:

```txt
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Expected Supabase table:

```sql
meal_entries (
  id uuid primary key,
  user_id uuid,
  date date,
  created_at timestamptz
)
```
