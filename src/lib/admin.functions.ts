import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { requireAdminRole } from "./admin-middleware.server";

// Helper to log admin actions
async function logAdminAction({
  adminId,
  role,
  action,
  resourceType,
  resourceId,
  affectedUserId,
  reason,
  details = {}
}: {
  adminId: string;
  role: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  affectedUserId?: string;
  reason?: string;
  details?: any;
}) {
  await supabase.from("admin_audit_logs").insert({
    admin_id: adminId,
    role: role as any,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    affected_user_id: affectedUserId,
    reason,
    details
  });
}

export const getAdminDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireAdminRole(['super_admin', 'admin', 'support', 'analyst'])])
  .handler(async () => {
    // Basic counts
    const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true });
    const { count: totalReadings } = await supabase.from("reading_logs").select("*", { count: "exact", head: true });
    const { count: totalPlans } = await supabase.from("reading_plans").select("*", { count: "exact", head: true });
    const { count: totalGroups } = await supabase.from("groups").select("*", { count: "exact", head: true });

    // Active today (users who read today)
    const today = new Date().toISOString().split('T')[0];
    const { count: activeToday } = await supabase
      .from("reading_logs")
      .select("user_id", { count: "exact", head: true })
      .eq("reading_date", today);

    return {
      totalUsers: totalUsers || 0,
      totalReadings: totalReadings || 0,
      totalPlans: totalPlans || 0,
      totalGroups: totalGroups || 0,
      activeToday: activeToday || 0,
      status: "online"
    };
  });

export const listAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireAdminRole(['super_admin', 'admin', 'support'])])
  .validator((data: any) => z.object({
    limit: z.number().optional().default(20),
    offset: z.number().optional().default(0),
    search: z.string().optional(),
    status: z.string().optional()
  }).parse(data))
  .handler(async ({ data }) => {
    let query = supabase
      .from("profiles")
      .select("id, name, email, avatar_url, status, created_at, last_read_date, current_streak, total_chapters_read", { count: "exact" });

    if (data.search) {
      query = query.or(`name.ilike.%${data.search}%,email.ilike.%${data.search}%`);
    }

    if (data.status) {
      query = query.eq("status", data.status);
    }

    const { data: users, count, error } = await query
      .order("created_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);

    if (error) throw new Error(error.message);
    return { users, count };
  });

export const getAdminUserProfile = createServerFn({ method: "GET" })
  .middleware([requireAdminRole(['super_admin', 'admin', 'support'])])
  .validator((data: any) => z.object({ userId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.userId)
      .single();

    if (profileError) throw new Error(profileError.message);

    // Get user roles
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.userId);

    // Get activity summary
    const { count: readingCount } = await supabase
      .from("reading_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", data.userId);

    const { data: plans } = await supabase
      .from("reading_plans")
      .select("id, title, status:completed_days, total_days")
      .eq("user_id", data.userId);

    return {
      profile,
      roles: roles?.map(r => r.role) || [],
      stats: {
        readingCount: readingCount || 0,
        plansCount: plans?.length || 0
      },
      plans
    };
  });

export const manageUserStatus = createServerFn({ method: "POST" })
  .middleware([requireAdminRole(['super_admin'])])
  .validator((data: any) => z.object({
    userId: z.string(),
    status: z.enum(['active', 'suspended']),
    reason: z.string()
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: { user: admin } } = await supabase.auth.getUser();
    if (!admin) throw new Error("Unauthorized");

    const { error } = await supabase
      .from("profiles")
      .update({ 
        status: data.status,
        suspension_reason: data.status === 'suspended' ? data.reason : null 
      })
      .eq("id", data.userId);

    if (error) throw new Error(error.message);

    // Get admin role for logging
    const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", admin.id).limit(1).maybeSingle();

    await logAdminAction({
      adminId: admin.id,
      role: roleData?.role || 'admin',
      action: data.status === 'suspended' ? 'SUSPEND_USER' : 'REACTIVATE_USER',
      resourceType: 'USER',
      resourceId: data.userId,
      affectedUserId: data.userId,
      reason: data.reason
    });

    return { success: true };
  });

export const performControlledCorrection = createServerFn({ method: "POST" })
  .middleware([requireAdminRole(['super_admin'])])
  .validator((data: any) => z.object({
    userId: z.string(),
    action: z.enum(['reset_streak', 'correct_reading_count', 'sync_profile']),
    details: z.any(),
    reason: z.string()
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: { user: admin } } = await supabase.auth.getUser();
    if (!admin) throw new Error("Unauthorized");

    let result;
    if (data.action === 'reset_streak') {
      result = await supabase
        .from("profiles")
        .update({ current_streak: 0 })
        .eq("id", data.userId);
    } else if (data.action === 'sync_profile') {
      const { count } = await supabase.from("reading_logs").select("*", { count: "exact", head: true }).eq("user_id", data.userId);
      result = await supabase
        .from("profiles")
        .update({ total_chapters_read: count || 0 })
        .eq("id", data.userId);
    }

    if (result?.error) throw new Error(result.error.message);

    const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", admin.id).limit(1).maybeSingle();

    await logAdminAction({
      adminId: admin.id,
      role: roleData?.role || 'admin',
      action: `CORRECTION_${data.action.toUpperCase()}`,
      resourceType: 'USER',
      resourceId: data.userId,
      affectedUserId: data.userId,
      reason: data.reason,
      details: data.details
    });

    return { success: true };
  });

export const manageSupportSession = createServerFn({ method: "POST" })
  .middleware([requireAdminRole(['super_admin', 'support'])])
  .validator((data: any) => z.object({
    userId: z.string(),
    action: z.enum(['start', 'end']),
    notes: z.string().optional()
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: { user: admin } } = await supabase.auth.getUser();
    if (!admin) throw new Error("Unauthorized");

    if (data.action === 'start') {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);
      
      const { error } = await supabase.from("support_sessions").insert({
        admin_id: admin.id,
        target_user_id: data.userId,
        status: 'active',
        reason: data.notes || 'Suporte técnico',
        expires_at: expiresAt.toISOString()
      });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("support_sessions")
        .update({ status: 'closed', closed_at: new Date().toISOString() })
        .eq("admin_id", admin.id)
        .eq("target_user_id", data.userId)
        .eq("status", 'active');
      
      if (error) throw new Error(error.message);
    }

    const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", admin.id).limit(1).maybeSingle();

    await logAdminAction({
      adminId: admin.id,
      role: roleData?.role || 'support',
      action: `SUPPORT_SESSION_${data.action.toUpperCase()}`,
      resourceType: 'SUPPORT_SESSION',
      affectedUserId: data.userId,
      reason: data.notes
    });

    return { success: true };
  });
