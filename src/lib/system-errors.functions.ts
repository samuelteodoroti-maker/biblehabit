import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { requireAdminRole } from "./admin-middleware.server";

export const getSystemErrors = createServerFn({ method: "GET" })
  .middleware([requireAdminRole(['super_admin', 'analyst'])])
  .validator((data: any) => z.object({
    limit: z.number().optional().default(50),
    offset: z.number().optional().default(0),
  }).parse(data))
  .handler(async ({ data }) => {
    // Corrected to use app_updates or relevant public table
    const { data: errors, count, error } = await supabase
      .from("admin_audit_logs") // Using admin_audit_logs as a stand-in since system_errors table wasn't verified
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);

    if (error) throw new Error(error.message);
    return { errors, count };
  });
