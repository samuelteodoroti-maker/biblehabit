# Bible Habit - Final Maintenance & Polish Plan

This plan addresses several UX, accessibility, and consistency issues identified in the technical audit.

## Proposed Changes

### 1. Data Loading & "Active Plan" Logic
- **Goal:** Centralize the logic for determining the "Active Plan" to avoid "No active plan" flicker and ensure consistency between the Home page and the Reading Log modal.
- **Implementation:** 
    - Created `useReadingData` hook to serve as the single source of truth.
    - Logic for "Active Plan":
        1. Not completed (`completed_days < total_days`).
        2. Most recently updated.
        3. Fallback to the most recent plan overall if all are completed.
    - Replace duplicate queries in `src/routes/index.tsx` and `src/components/LogReadingModal.tsx` with this hook.
    - Ensure `loading` states are handled correctly to show skeletons instead of empty/zero states.

### 2. Acessibility & UI Consistency
- **Switch Accessibility:** Update the "Lembretes diários" switch in `src/routes/settings.tsx` to include proper `<Label>` association and `aria-describedby` for descriptions.
- **Image Alt Texts:** Audit and add `alt` attributes to all `<img>` tags, especially in `src/routes/groups.$groupId.tsx` (activity feed, member list, chat).
- **UI Casing:** Standardize section headers to sentence case (e.g., "Insights pessoais" instead of "INSIGHTS PESSOAIS") across all routes.

### 3. Ranking & Tie Handling
- **Goal:** Implement a clear ranking system that handles ties using "Competition Ranking" (e.g., 1, 1, 3).
- **Implementation:**
    - Update ranking logic in `src/routes/groups.$groupId.tsx`.
    - Show an "(Empate)" indicator next to the rank for tied users.
    - Sort tied users stably by streak, then by ID.
    - Handle the "0 chapters" state with a clear "Nenhuma leitura" message.

### 4. Comprehensive Skeletons
- **Goal:** Eliminate layout shifts and flickering during data loading.
- **Implementation:**
    - Add/Improve skeletons for:
        - **Home:** Greeting, Streak Card, Stats, Buttons, Calendar.
        - **Progress:** Insights charts, Plan cards.
        - **Groups:** Group cards, Ranking list, Activity feed.
        - **Achievements:** Stats cards, Badge grid.
    - Use `aria-busy` to signal loading to screen readers.

### 5. Race Condition Protection
- **Goal:** Ensure all queries are correctly guarded by the user session.
- **Implementation:**
    - Use `enabled: !!user?.id` pattern (or equivalent state checks) for all data fetching.
    - Ensure loaders and hooks wait for the auth session to hydrate before attempting database calls.

## Technical Details
- **Hook:** `src/hooks/useReadingData.ts` (created).
- **Modified Routes:** `src/routes/index.tsx`, `src/routes/progress.tsx`, `src/routes/settings.tsx`, `src/routes/groups.index.tsx`, `src/routes/groups.$groupId.tsx`, `src/routes/achievements.tsx`.
- **Modified Components:** `src/components/LogReadingModal.tsx`, `src/components/AppShell.tsx`.
- **Ranking Formula:** `rank = current_index > 0 && chapters[i] === chapters[i-1] ? previous_rank : current_index + 1`.
