# Plan - Bible Habit Comprehensive Fixes

Implementation of fixes for the Biblical canon, progress calculation, history route, updates, PDF generation, YouVersion integration, accessibility, and admin security.

## Biblical Canon and Calculations
- **Bible Canon Update**: Replace `src/lib/bible-canon.ts` with accurate verse counts for all 66 books (Total: 31,102 verses).
- **Progress Logic**: Update `src/lib/bible-calculations.ts` to use verse-based percentages and handle overlapping passages correctly.

## New and Fixed Routes
- **History Route**: Create `src/routes/history.tsx` to list reading logs with filtering and editing/deletion capabilities.
- **Admin Access**: Standardize access control in `src/routes/admin/` routes to consistently show "Access Denied" or redirect based on role.
- **Updates Routing**: Fix nesting and slug handling in `src/routes/updates.tsx` and `src/routes/updates.$slug.tsx`.

## Feature Fixes
- **PDF Generation**: Implement actual Blob-based download for update summaries in `src/lib/pdf-generator.ts`.
- **Registration Modal**: Fix close button, Escape key handling, and focus management. Add accessible labels and validation for chapter/verse ranges.
- **YouVersion**: Sync translation display with link parameters based on user locale.
- **Reading Suggestions**: Add a deterministic suggestion card on the Home screen for users without active plans.

## Accessibility and Responsiveness
- **Aria Labels**: Add descriptive labels to all icon buttons and expand/collapse controls.
- **Mobile Fixes**: Adjust safe area insets and fluid typography to prevent layout breaks on small screens.

## Technical Details
- **Tables and Data**: Ensure all calculations use the centralized `BIBLE_CANON`.
- **Database**: Add `reading_passages` fallback logic in history views.
- **Security**: Verify super_admin logic at the middleware/database level.

## Verification
- Run tests for reading overlaps and progress totals.
- Manual check of mobile responsiveness and PDF download.
- Verify admin route protection for non-admin users.
