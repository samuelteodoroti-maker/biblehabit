# Security Audit and Implementation Plan - Bible Habit

Perform a comprehensive security audit of Bible Habit across frontend, database (RLS, Migrations, Functions), and hosting, implementing all necessary fixes to reach production-grade security while preserving existing data.

## Phase 1: Security Headers (Hosting Layer)

Configure modern security headers in the application's root route to protect against clickjacking, XSS, and unauthorized resource access.

- **Content Security Policy (CSP)**: Implement a strict CSP in `Report-Only` mode first, then finalize.
    - Authorized domains: Supabase, Google Fonts, Lovable, WhatsApp.
    - Remove inline scripts or use hashes/nonces.
- **X-Frame-Options**: Set to `DENY` to prevent clickjacking.
- **Permissions-Policy**: Restrict access to unused features (camera, microphone, geolocation, etc.).
- **Cross-Origin-Opener-Policy**: Set to `same-origin-allow-popups`.
- **HSTS**: Ensure `Strict-Transport-Security` is active.

## Phase 2: Database Security (RLS & Functions)

Review and harden all database tables and functions to ensure the principle of least privilege.

- **RLS Policies**:
    - `profiles`: Restrict email exposure; ensure users only update their own records.
    - `reading_logs`, `reading_passages`, `reading_plans`: Enforce strict `auth.uid() = user_id` checks.
    - `groups`, `group_members`, `group_messages`: Verify membership for access; prevent non-members from reading chat or activity.
    - `user_roles`: Lock down so users cannot read or modify their own or others' roles.
- **Security Definer Functions**:
    - Verify `search_path=public`.
    - Revoke `EXECUTE` from `PUBLIC` and `anon`.
    - Validate `auth.uid()` inside every critical function.
- **Admin Protection**:
    - Ensure administrative actions (like posting updates) are verified server-side via `has_role(auth.uid(), 'admin')`.

## Phase 3: Authentication & Privacy

Refine the authentication flow and data privacy practices.

- **Auth Flow**: Ensure PKCE is used (default in Supabase JS v2).
- **Session Security**: 
    - Clear sensitive URL parameters after OAuth.
    - Implement a clean logout that clears local state and caches.
- **XSS Protection**:
    - Audit all `dangerouslySetInnerHTML` usage.
    - Implement server-side and client-side validation for lengths and formats.

## Phase 4: Validation & Rate Limiting

Add integrity checks and protective limits.

- **Schema Constraints**: Add check constraints for valid Bible references (non-negative chapters, valid ranges).
- **Rate Limiting**: Implement basic protection for sensitive endpoints like group creation or login attempts.

## Technical Details

- **CSP Implementation**: Added via `HeadContent` in `src/routes/__root.tsx`.
- **Database Migrations**: Created using `supabase--migration` with explicit `GRANT` statements and hardened `USING` clauses.
- **Validation**: Integrated `zod` schema validation in critical components and server functions.
- **Testing**: End-to-end verification using Playwright to test RLS boundaries between multiple users.

## User Review Required

> [!IMPORTANT]
> A notice will be created: "Melhorias de segurança e proteção de dados" explaining the changes in general terms once implemented.
