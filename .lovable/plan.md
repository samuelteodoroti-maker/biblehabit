# Plan: Bible Habit Admin Panel Implementation

Implement a secure, multi-role admin system for Bible Habit with RLS protection, audit logging, and specialized support tools.

## Phase 1: Database & Security Hardening
- **Migrations**:
    - Update `app_role` enum to include: `super_admin`, `admin`, `support`, `analyst`, `user`.
    - Enhance `user_roles` table: add `created_by`, `updated_at`.
    - Create `admin_audit_logs` table: `id`, `admin_id`, `role`, `action`, `resource_type`, `resource_id`, `affected_user_id`, `reason`, `details` (JSONB), `created_at`.
    - Create `user_access_events` table: `id`, `user_id`, `event_type`, `metadata` (device, version, browser), `created_at`.
    - Create `support_sessions` table: `id`, `admin_id`, `target_user_id`, `reason`, `status`, `expires_at`, `created_at`.
- **Functions & RLS**:
    - `has_role(uid, role)`: Security definer to check permissions.
    - RLS policies for all admin tables (deny by default, only super_admin/admin can read/write as appropriate).
    - Trigger to auto-log role changes.

## Phase 2: Server-Side Logic
- **Middleware**: Create `requireAdminRole(roles[])` middleware for server functions.
- **Server Functions** (`src/lib/admin.functions.ts`):
    - `getAdminDashboardStats`: Aggregated metrics (active users, readings, errors).
    - `listAdminUsers`: Paginated list with filtering/sorting.
    - `getAdminUserProfile`: Comprehensive user diagnostic data.
    - `logAdminAction`: Helper to write to `admin_audit_logs`.
    - `manageSupportSession`: Create/expire support contexts.
    - `performControlledCorrection`: Safe stats/streak recalculations.
    - `manageUserStatus`: Suspend/reactivate accounts.

## Phase 3: Administrative UI (Private & Responsive)
- **Layout**: `AdminLayout.tsx` with sidebar (desktop) and adapted mobile navigation.
- **Routes** (`src/routes/admin/`):
    - `/admin`: Dashboard with charts (aggregated data only).
    - `/admin/users`: User management list.
    - `/admin/users/$id`: Deep diagnostic profile.
    - `/admin/audit`: Searchable audit logs.
    - `/admin/access`: Security event monitoring.
    - `/admin/support`: Active session management.
- **Components**:
    - `AdminGuard`: Route-level gate that redirects non-admins.
    - `SupportBanner`: Sticky UI when in "Support Mode".
    - `ConfirmationDialog`: Required for sensitive actions (suspension, data correction).

## Phase 4: Integration & Visibility
- **Privacy**: Update Privacy Policy in `settings.tsx` or dedicated route.
- **Discovery**: Ensure admin links are hidden from non-admin users.
- **SEO**: Add `noindex, nofollow` meta tags to all admin routes.
- **Logging**: Ensure logout cleans up admin state.

## Technical Details
- **Tech Stack**: TanStack Start v1, React 19, Supabase RLS, Tailwind CSS v4, Lucide Icons, Recharts.
- **Auth**: Leverages existing `useAuth` hook, extending it for detailed role checks.
- **Audit**: Every write operation in the admin panel will require a `reason` field and be logged to the immutable audit table.
- **Data Safety**: PII is masked or hidden by default; specialized "Support Mode" requires explicit start/end flow.
