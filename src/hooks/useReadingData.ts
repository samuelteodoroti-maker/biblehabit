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
  reading_passages: {
    book_id: string;
    start_chapter: number;
    end_chapter: number;
  }[];
};

import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useReadingData() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const pad = (n: number) => String(n).padStart(2, "0");
  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }, []);

  const readingQuery = useQuery({
    queryKey: ["reading-data", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const [profileRes, logsRes, plansRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("name, avatar_url, current_streak, longest_streak, total_chapters_read, last_read_date, status")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("reading_logs")
          .select("id, reading_date, chapters_count, notes, duration_minutes, reading_passages(book_id, start_chapter, end_chapter)")
          .eq("user_id", user.id)
          .order("reading_date", { ascending: false })
          .limit(365),
        supabase
          .from("reading_plans")
          .select("id, title, books_today, completed_days, total_days, description, updated_at")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
      ]);
        
      if (profileRes.error) throw profileRes.error;
      if (logsRes.error) throw logsRes.error;
      if (plansRes.error) throw plansRes.error;

      const allPlans = plansRes.data || [];
      const activePlan = allPlans.find(p => (p.completed_days ?? 0) < (p.total_days ?? 0)) || allPlans[0];
      
      return {
        profile: profileRes.data as Profile,
        recentLogs: (logsRes.data as any) as DetailedLog[],
        logDates: new Set((logsRes.data ?? []).map(l => l.reading_date)),
        activePlan: activePlan as ActivePlan,
      };
    },
    enabled: !!user && !authLoading,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  return {
    user,
    profile: readingQuery.data?.profile ?? null,
    activePlan: readingQuery.data?.activePlan ?? null,
    logDates: readingQuery.data?.logDates ?? new Set<string>(),
    recentLogs: readingQuery.data?.recentLogs ?? [],
    loading: authLoading || readingQuery.isLoading,
    error: readingQuery.error,
    today,
    refresh: () => queryClient.invalidateQueries({ queryKey: ["reading-data", user?.id] })
  };
}
