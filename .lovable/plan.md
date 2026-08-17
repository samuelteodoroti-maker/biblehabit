# Plan: Full Responsiveness and Legibility Overhaul

Improve responsiveness, legibility, and usability across all devices (mobile, tablet, desktop) for the Bible Habit PWA, following a mobile-first approach.

## User Review Required

> [!IMPORTANT]
> - I will apply a global responsive typography scale using `clamp()`. This might slightly change the look of some headings on very large screens.
> - Bottom navigation will be adjusted to respect safe areas (notches/home indicators).
> - Cards on the home page will be refactored to prevent content clipping on small devices (320px).

## Proposed Changes

### Global Configuration & Layout
- Confirm `viewport-fit=cover` in `src/routes/__root.tsx`.
- Add global box-sizing and root container fluid constraints in `src/styles.css`.
- Implement a responsive typography scale using `clamp()` for titles and body text.
- Standardize `.page-container` and main content padding.

### Component-Level Fixes
- **BottomNav.tsx**: Apply `env(safe-area-inset-bottom)` and ensure 5 tabs fit comfortably.
- **AppShell.tsx**: Fix main content padding to account for the bottom nav on mobile and ensure it doesn't cover content.
- **BibleUI.tsx (BibleCard)**: Reduce padding on mobile (from `p-7` to `p-5`) and ensure titles allow wrapping.
- **LogReadingModal.tsx**: Ensure the modal is a bottom-sheet style on mobile with `max-height` and internal scroll.

### Page-Specific Improvements
- **Home (index.tsx)**: 
  - Fix "Capítulos" and "Progresso" cards grid to prevent title clipping.
  - Refactor "Constância na Palavra" card for narrow screens (320px).
  - Ensure "Jornada Atual" is fully visible above the navigation.
- **Progress.tsx**: Grid adjustment for plans (1 column on mobile, 2 on tablet, 3 on desktop).
- **Statistics.tsx**: Ensure Recharts use `ResponsiveContainer` with appropriate heights per breakpoint.
- **Achievements.tsx**: Fix achievement grid layout for small screens.
- **Updates & Support**: Ensure editorial content doesn't overflow and images are fluid.

### Verification & Documentation
- Perform a "scrollWidth" audit to find and fix any horizontal overflow.
- Test zoom up to 200%.
- Create a new update note "Melhorias de responsividade e legibilidade".
- Update `CHANGELOG.md`.

## Technical Details
- **Breakpoints**: 
  - Small Mobile: 320px - 374px
  - Mobile: 375px - 599px
  - Tablet: 600px - 1023px
  - Desktop: 1024px+
- **CSS Units**: Use `rem` for accessibility and `clamp()` for fluid scaling.
- **Safe Areas**: Use `env(safe-area-inset-bottom)` for iOS/Android home indicators.
