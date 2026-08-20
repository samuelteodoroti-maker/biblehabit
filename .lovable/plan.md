# Technical Audit & Maintenance Plan - Bible Habit

Perform a comprehensive technical audit and maintenance sweep to identify and correct bugs, logic errors, and security/performance issues across the PWA.

## Technical Details

### 1. Data Integrity & Logic
- **Canonical Alignment**: Ensure `src/lib/bible-canon.ts` (the source of truth) and `src/lib/bibleBooks.ts` (UI metadata) are perfectly synchronized.
- **Coverage Calculation**: Fix `src/lib/bible-calculations.ts` to strictly handle Protestant versification and merge overlapping reading logs correctly.
- **Log Registration**: Update `src/components/LogReadingModal.tsx` to use `BIBLE_CANON` exclusively and validate chapter/verse ranges against the actual book structures.

### 2. User Experience & Routing
- **History Route**: Enhance `/history` with better state management and robust delete/edit flows.
- **Updates System**: Fix nested routing for `/updates` and `/updates/$slug` to ensure SEO metadata and deep links work correctly.
- **PWA Manifest & Icons**: Verify and fix any broken links to favicons or social images in `src/routes/__root.tsx`.

### 3. Security & Database
- **Admin Hardening**: Standardize `super_admin` checks across all admin sub-routes.
- **RLS & Grants**: Perform a final check on Supabase migrations to ensure all tables have proper RLS policies and `authenticated` grants.
- **MFA Enforcement**: Ensure that critical admin operations require `aal2` (MFA) where supported.

### 4. Performance & Reliability
- **Query Caching**: Review `useReadingData.ts` and `useDailyVerse.ts` for potential race conditions or redundant invalidations.
- **PDF Generation**: Fix the `src/lib/pdf-generator.ts` to ensure clean downloads in mobile browsers.
- **Responsive Layouts**: Audit `AppShell.tsx` and core routes for safe-area-inset issues and layout shifts on small mobile devices.

## Implementation Steps

1. **Step 1: Core Data & Logic**
   - Synchronize `bible-canon.ts` and `bibleBooks.ts`.
   - Fix coverage calculation in `bible-calculations.ts`.
   - Update `LogReadingModal.tsx` validation.

2. **Step 2: Routing & UX**
   - Refactor updates routing and SEO metadata.
   - Fix PDF generator for mobile.
   - Audit responsiveness in `AppShell.tsx`.

3. **Step 3: Security Audit**
   - Review admin routes (`/admin/*`) for consistent role checks.
   - Validate Supabase RLS and GRANTs.

4. **Step 4: Final Validation**
   - Run type checks and build verification.
   - Verify PWA behavior (manifest, icons, theme).
