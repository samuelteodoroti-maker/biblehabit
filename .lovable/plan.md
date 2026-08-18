# Comprehensive Corrective Maintenance

Addressing urgent statistics errors, improving history logging, and hardening administrative areas.

## User-facing changes
- **Statistics Fix**: Resolved a critical React error (hook violation) on the Statistics page.
- **Improved Registration**: Retrospective readings can now be registered from the calendar without date mismatches.
- **Detailed History**: Verse-level tracking is now supported in reading logs.
- **Deterministic Suggestions**: Reading suggestions are now personalized and consistent.
- **PDF Fix**: Modernized the update summary PDF generator with better layout and branding.
- **Admin Hardening**: New "System Logs" area for technical auditing.

## Technical details
- Fixed "Rendered more hooks than during previous render" by moving `useMemo` out of loops in `statistics.tsx`.
- Implemented `log_reading_atomic` Postgres function for consistent saving of logs, passages, and plan updates in one transaction.
- Standardized `LogReadingModal` to support `initialDate` prop for accurate calendar-driven logging.
- Expanded `useReadingData` to fetch full history without arbitrary limits.
- Isolated administrative routes and middleware to strictly enforce `super_admin` privileges for `samuelteodoro.ti@gmail.com`.
- Updated `__root.tsx` to correctly handle public paths and dynamic route patterns (e.g., `/updates/$slug`).
