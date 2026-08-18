# Technical Audit & Hardening Plan - Bible Habit

Perform a comprehensive technical audit and hardening of the Bible Habit PWA, addressing logic, security, UI/UX, and performance issues across the entire stack.

## 1. Authentication & Security Hardening
- **MFA Enforcement**: Ensure all `super_admin` routes and functions strictly require `aal2` (MFA) at the database and server function levels.
- **Session Persistence**: Verify session persistence logic in `useAuth.ts` and `AuthGate` to prevent unexpected logouts, especially on mobile PWA environments.
- **Security Headers**: Review and tighten the Content Security Policy (CSP) in `src/routes/__root.tsx`.
- **Admin Isolation**: Audit all `src/lib/admin.functions.ts` to ensure `requireAdminRole` is applied correctly with appropriate permission levels.

## 2. Database & Data Integrity
- **Real-time Sync**: Audit `useReadingData.ts` and `LogReadingModal.tsx` for race conditions during log insertion and streak updates.
- **Trigger Optimization**: Review the `update_streak_on_log` Postgres trigger for edge cases (e.g., retro-active logs, deleting logs, timezone offsets).
- **Constraint Audit**: Add missing database constraints (e.g., `chapters_count > 0`) to prevent data corruption.
- **RLS Review**: Ensure all new tables (`admin_audit_logs`, `support_sessions`, `app_updates`) have strict RLS and correct `GRANT` statements.

## 3. UI/UX & Responsiveness
- **Fluid Layouts**: Refine `AppShell.tsx` and route layouts for seamless transition between mobile (PWA) and desktop views.
- **Hydration Mismatches**: Fix potential hydration errors in date-dependent components like `ReadingCalendar`.
- **Skeleton States**: Improve perceived performance with unified skeleton loading patterns across all data-fetching routes.
- **Accessibility (WCAG)**: Audit contrast ratios, ARIA labels in `LogReadingModal`, and keyboard navigation in the `BottomNav`.

## 4. Performance & Reliability
- **Query Optimization**: Optimize Supabase queries to prevent over-fetching, specifically in `useReadingData.ts`.
- **Error Handling**: Implement a global error boundary and improved toast feedback for failed API/Supabase calls.
- **PWA Reminders**: Fix and test the service worker/notification logic for daily reading reminders.

## Technical Details
- **Stack**: React 19, TanStack Start v1, Supabase (PostgREST + RLS).
- **Language**: Portuguese (pt-BR) for user-facing strings; English for code/logs.
- **Auth**: Supabase Auth with custom role-based middleware.
- **Validation**: Zod for server functions; Postgres check constraints for data.
