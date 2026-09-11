import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type Profile = {
  name: string | null;
  avatar_url: string | null;
  current_streak: number;
  longest_streak: number;
  total_chapters_read: number;
  last_read_date: string | null;
  status: 'active' | 'suspended';
  youversion_link: string | null;
};


export type ActivePlan = {
  id: string;
  title: string;
  books_today: string | null;
  completed_days: number;
  total_days: number;
  description: string | null;
};


export type DetailedLog = {
  id: string;
  reading_date: string;
  chapters_count: number;
  notes: string | null;
  duration_minutes: number | null;
  created_at?: string | null;
  plan_id?: string | null;
  reading_passages: {
    book_id: string;
    start_chapter: number;
    start_verse: number;
    end_chapter: number;
    end_verse: number;
    is_full_chapter: boolean;
  }[];
};



import { useQuery, useQueryClient } from "@tanstack/react-query";
import { calculateBibleCoverage } from "@/lib/bible-calculations";
import {
  DEFAULT_TIMEZONE,
  computeReadingStats,
  getLocalDateKey,
  type ReadingStats,
} from "@/lib/reading-days";

export type { ReadingStats };

export function useReadingData() {

  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const readingQuery = useQuery({
    queryKey: ["reading-data", user?.id || null],
    queryFn: async () => {
      if (!user) return null;

      const [profileRes, logsRes, plansRes, statsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("name, avatar_url, current_streak, longest_streak, total_chapters_read, last_read_date, status, youversion_link, timezone")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("reading_logs")
          .select("id, reading_date, chapters_count, notes, duration_minutes, plan_id, created_at, reading_passages(book_id, start_chapter, start_verse, end_chapter, end_verse, is_full_chapter)")
          .eq("user_id", user.id)
          .order("reading_date", { ascending: false }),


        supabase
          .from("reading_plans")
          .select("id, title, books_today, completed_days, total_days, description, updated_at")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false }),

        (supabase as any).rpc("get_reading_stats", { _user_id: user.id }),
      ]);

      if (profileRes.error) throw profileRes.error;
      if (logsRes.error) throw logsRes.error;
      if (plansRes.error) throw plansRes.error;

      const allPlans = plansRes.data || [];
      const activePlan = allPlans.find(p => (p.completed_days ?? 0) < (p.total_days ?? 0)) || allPlans[0];

      const recentLogs = (logsRes.data as any) as DetailedLog[];
      const passages = recentLogs.flatMap(l => l.reading_passages ?? []);
      const coverage = calculateBibleCoverage(passages);

      const profile = profileRes.data as (Profile & { timezone?: string | null }) | null;
      const timezone = profile?.timezone || DEFAULT_TIMEZONE;
      const logDates = new Set((logsRes.data ?? []).map(l => l.reading_date));

      // Fonte de verdade: função do banco. Fallback local com a mesma fórmula.
      const row = Array.isArray(statsRes?.data) ? statsRes.data[0] : statsRes?.data;
      const today = row?.today_local || getLocalDateKey(timezone);
      const stats: ReadingStats = row
        ? {
            current_streak: row.current_streak ?? 0,
            longest_streak: row.longest_streak ?? 0,
            total_read_days: row.total_read_days ?? 0,
            first_read_date: row.first_read_date ?? null,
            last_read_date: row.last_read_date ?? null,
            longest_gap: row.longest_gap ?? 0,
            weekly_average: Number(row.weekly_average ?? 0),
            monthly_average: Number(row.monthly_average ?? 0),
          }
        : computeReadingStats(logDates, today);

      return {
        profile: profile as Profile,
        recentLogs,
        logDates,
        activePlan: activePlan as ActivePlan,
        coverage,
        stats,
        timezone,
        today,
      };

    },
    enabled: !!user && !authLoading,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  const fallbackToday = useMemo(() => getLocalDateKey(DEFAULT_TIMEZONE), []);

  const emptyStats: ReadingStats = useMemo(
    () => ({
      current_streak: 0,
      longest_streak: 0,
      total_read_days: 0,
      first_read_date: null,
      last_read_date: null,
      longest_gap: 0,
      weekly_average: 0,
      monthly_average: 0,
    }),
    [],
  );

  return {
    user,
    profile: readingQuery.data?.profile ?? null,
    activePlan: readingQuery.data?.activePlan ?? null,
    coverage: readingQuery.data?.coverage ?? null,
    logDates: readingQuery.data?.logDates ?? new Set<string>(),
    recentLogs: readingQuery.data?.recentLogs ?? [],
    stats: readingQuery.data?.stats ?? emptyStats,
    timezone: readingQuery.data?.timezone ?? DEFAULT_TIMEZONE,
    loading: authLoading || readingQuery.isLoading,

    error: readingQuery.error,
    today: readingQuery.data?.today ?? fallbackToday,
    refresh: () => queryClient.invalidateQueries({ queryKey: ["reading-data", user?.id || null] })
  };
}
