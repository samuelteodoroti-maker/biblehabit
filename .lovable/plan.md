# Plan for Bible Habit Enhancements

Comprehensive technical audit and improvement of the Bible Habit application, focusing on user experience, accessibility, data consistency, and performance.

## 1. Initial Data Loading & Skeletons
Fix the "flicker" of zeroed/default data by implementing proper loading states and skeletons across all main views.

- **Global**: Create a `Skeleton` wrapper or specific skeleton components for common UI patterns (cards, greeting, lists).
- **Home (`src/routes/index.tsx`)**: Use skeletons for greeting, streak card, stats cards, and calendar while `authLoading` or `dataLoading` is true.
- **Progress (`src/routes/progress.tsx`)**: Skeleton for Insights cards and plans list.
- **Groups (`src/routes/groups.index.tsx`, `src/routes/groups.$groupId.tsx`)**: Skeleton for groups list, activity feed, ranking, and chat history.
- **Achievements (`src/routes/achievements.tsx`)**: Skeleton for the grid of badges.
- **Settings (`src/routes/settings.tsx`)**: Skeleton for account info and activity log.
- **Rule**: Never show "Sem plano", "Nenhum grupo", or "0" stats until the fetch completes and explicitly confirms zero data.

## 2. Active Plan Logic & Sync
Ensure the Home page correctly identifies and displays the most relevant active plan.

- **Home Logic**: Fetch the user's most recently updated plan (`updated_at` descending) and set it as `activePlan`.
- **Sync**: Use `useQuery` (TanStack Query) or ensure manual invalidation/refetching occurs after creating, editing, or deleting plans to keep the Home page reactive.
- **Selection**: The `LogReadingModal` should default to the `activePlan` if it exists.

## 3. Accessibility Audit (Aria & Landmarks)
Improve screen reader support and keyboard navigation.

- **Icon Buttons**: Add `aria-label` to all icon-only buttons (Back, Share, Pencil, Trash, Rebuild, React/Amen, Send).
- **Form Fields**: Ensure all `Input`, `Select`, `Textarea`, and `Switch` components are associated with a `<Label>` or have `aria-label`.
- **Settings**: Add `alt` text to avatars, `aria-checked` to the Daily Reminder switch, and an accessible name to the theme toggle.
- **Landmarks**: Ensure every main view is wrapped in a `<main>` landmark (already partially in `AppShell`, but verify `/auth`).

## 4. Modal Accessibility & Warnings
Resolve console warnings and improve modal focus/context.

- **Shadcn Dialogs**: Add `DialogDescription` to all modals (Log Reading, New/Edit Plan, Create/Join Group, Confirm Delete).
- **Aria**: Ensure `DialogTitle` and `DialogDescription` are correctly associated via `aria-describedby`.
- **Focus**: Verify focus trapping and return-of-focus behavior.

## 5. Group Ranking Logic
Handle ties in the weekly leaderboard gracefully.

- **Ranking Calculation**: 
  1. Primary: Chapters read (descending).
  2. Secondary: Streak (descending).
  3. Tertiary: Last read timestamp (earlier = better).
- **UI**: Display the same rank number for users with identical stats (e.g., two users at #1).

## 6. Text & UI Standardization
Standardize section titles and ensure natural casing.

- **Headings**: Change "INSIGHTS PESSOAIS" to "Insights pessoais" in code (CSS can handle uppercase if desired for design, but HTML should be natural).
- **Consistency**: Apply this to "Minha conta", "Integrações", "Minha atividade", "Preferências", "Aparência".

## 7. Performance & Data Reliability
- **Optimistic Updates**: Use with caution. Implement rollback on error for Chat and Log Reading.
- **Race Conditions**: Use TanStack Query (if possible) or proper cancellation/timestamp checks in `useEffect` to prevent old data from overwriting new data.
- **Responsiveness**: Audit layouts at 360px, 390px, 768px, and 1024px.

## Technical Details

- **Framework**: TanStack Start v1.
- **Database**: Supabase (RLS enabled).
- **Styling**: Tailwind CSS v4 (oklch palette).
- **Components**: shadcn/ui.
- **Icons**: Lucide React.
- **Charts**: Recharts.

I will start by addressing the loading states and accessibility fixes across all routes.
