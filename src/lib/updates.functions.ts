import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const getUpdates = createServerFn({ method: "GET" })
  .validator((data: any) => z.object({
    status: z.enum(['draft', 'scheduled', 'published', 'archived']).optional(),
    limit: z.number().optional().default(20),
    offset: z.number().optional().default(0),
    category: z.string().optional(),
    year: z.number().optional(),
    search: z.string().optional(),
  }).parse(data))
  .handler(async ({ data }) => {
    let query = supabase
      .from("app_updates")
      .select("*", { count: "exact" });

    if (data.status) {
      query = query.eq("status", data.status);
    } else {
      query = query.eq("status", "published");
    }

    if (data.category) {
      query = query.contains("categories", [data.category]);
    }

    if (data.search) {
      query = query.or(`title.ilike.%${data.search}%,summary.ilike.%${data.search}%`);
    }

    if (data.year) {
      const start = `${data.year}-01-01T00:00:00Z`;
      const end = `${data.year}-12-31T23:59:59Z`;
      query = query.gte("published_at", start).lte("published_at", end);
    }

    const { data: updates, count, error } = await query
      .order("published_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);

    if (error) throw new Error(error.message);
    return { updates, count };
  });

export const getUpdateBySlug = createServerFn({ method: "GET" })
  .validator((data: any) => z.object({ slug: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { data: update, error } = await supabase
      .from("app_updates")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return update;
  });
