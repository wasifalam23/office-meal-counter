# Office Meal Counter Project Summary

## What This App Does

This is a frontend-focused Next.js App Router app for tracking a 26-meal office lunch subscription.

The user can:

- Sign in with Supabase email magic link auth.
- Count today's lunch if it is a weekday.
- Add a missed weekday lunch by date.
- See used meals, remaining meals, and completion progress.
- Remove an individual meal after a confirmation warning.
- Start a new 26-meal pack after a confirmation warning.

Meal data is stored in Supabase, not localStorage.

## Tech Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Supabase JavaScript client
- TypeScript

## Project Shape

The app uses the optional `src/` folder:

```txt
src/
  app/
    page.tsx
    layout.tsx
    globals.css
    supabase.ts
    meal-counter/
```

There should not be an active root-level `app/` folder. If VS Code shows old `app/...` tabs, those are stale tabs from before the project was moved to `src/app`.

## Important Files

### `src/app/page.tsx`

The route shell for `/`.

It intentionally stays lean and only renders the meal counter app:

```tsx
import { MealCounterApp } from "./meal-counter/meal-counter-app";

export default function Home() {
  return <MealCounterApp />;
}
```

### `src/app/layout.tsx`

The root App Router layout.

It imports global CSS and defines app metadata:

- Title: `Meal Counter`
- Description: `Track your 26-meal office lunch subscription.`

### `src/app/globals.css`

Global Tailwind import and base page styles.

### `src/app/supabase.ts`

Creates the browser Supabase client from:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

If either variable is missing, the app throws a clear environment error.

## Meal Counter Components

### `src/app/meal-counter/meal-counter-app.tsx`

The main client component.

Responsibilities:

- Reads the current Supabase session.
- Subscribes to auth changes.
- Loads meal rows for the signed-in user.
- Adds a meal row.
- Removes a meal row.
- Clears the current user's meal rows when starting a new pack.
- Owns UI state like loading, errors, confirmation modals, selected date, and email input.

This is where most app behavior lives.

### `src/app/meal-counter/meal-counter-header.tsx`

Header UI:

- App title
- Subscription pack display
- Sign out button when signed in

### `src/app/meal-counter/status-message.tsx`

Displays success/error messages from Supabase actions.

### `src/app/meal-counter/meal-summary-card.tsx`

Shows:

- Remaining meals
- Count today button
- Progress bar
- Today date
- Lunch days
- Pack status

### `src/app/meal-counter/add-meal-panel.tsx`

Shows either:

- Email magic-link sign-in form when signed out
- Date picker, add selected date button, and new-pack button when signed in

### `src/app/meal-counter/meal-history.tsx`

Shows the meal history list.

Each row has a `Remove` button that opens a confirmation modal before deleting.

### `src/app/meal-counter/confirmation-modal.tsx`

Reusable warning modal used for:

- Removing one meal
- Starting a new 26-meal pack

### `src/app/meal-counter/date-utils.ts`

Date helpers:

- `getLocalDateKey`
- `isWeekday`
- `formatDate`

### `src/app/meal-counter/types.ts`

Shared meal types:

- `MealLog`
- `MealEntryRow`

## Supabase Setup

Expected table:

```sql
meal_entries (
  id uuid primary key,
  user_id uuid,
  date date,
  created_at timestamptz
)
```

The app queries only these fields:

- `id`
- `user_id`
- `date`

The app assumes Row Level Security allows authenticated users to:

- Select their own rows.
- Insert rows for their own `user_id`.
- Delete their own rows.

Recommended policies are conceptually:

```sql
auth.uid() = user_id
```

for select, insert, and delete.

## App Behavior Notes

### Weekday Rule

Meals can only be counted Monday through Friday.

### Duplicate Rule

The UI prevents adding the same date twice during the current loaded state.

It is still wise to add a unique database constraint if duplicate rows must be impossible:

```sql
unique (user_id, date)
```

### Start New Pack

The current implementation deletes all `meal_entries` rows for the signed-in user after confirmation.

That means it resets the visible history and count to zero.

Future improvement: create pack/cycle records instead of deleting old meal history.

### Remove Meal

Removing a history entry deletes that single Supabase row after confirmation.

## Environment Variables

Create `.env.local` with:

```txt
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

These are public browser keys by design. Do not put service role keys in this frontend app.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run start
```

## Common Development Notes

If the app was recently moved between `app/` and `src/app/`, Turbopack dev cache can get confused. If you see an error like:

```txt
app_dir must be a directory
```

stop the dev server, delete `.next`, and restart:

```bash
rm -rf .next
npm run dev
```

## Current Verification

The project has been checked with:

```bash
npm run lint
npm run build
```

