import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type Profile = {
  name: string | null;
  avatar_url: string | null;
  current_streak: number;
  longest_streak: number;
  total_chapters_read: number;
  last_read_date: string | null;
};

export type ActivePlan = {
  id: string;
  title: string;
  books_today: string | null;
  completed_days: number;
  total_days: number;
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

export function useReadingData() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);
  const [logDates, setLogDates] = useState<Set<string>>(new Set());
  const [recentLogs, setRecentLogs] = useState<DetailedLog[]>([]);
  const [loading, setLoading] = useState(true);

  const pad = (n: number) => String(n).padStart(2, "0");
  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }, []);

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      // Fetch profile
      const { data: p } = await supabase
        .from("profiles")
        .select("name, avatar_url, current_streak, longest_streak, total_chapters_read, last_read_date")
        .eq("id", user.id)
        .maybeSingle();
        
      // Fetch logs
      const { data: logs } = await supabase
        .from("reading_logs")
        .select("id, reading_date, chapters_count, notes, duration_minutes, reading_passages(book_id, start_chapter, end_chapter)")
        .eq("user_id", user.id)
        .order("reading_date", { ascending: false })
        .limit(365);
        
      // Fetch plans to determine active one
      const { data: allPlans } = await supabase
        .from("reading_plans")
        .select("id, title, books_today, completed_days, total_days, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      // Logic: Favor uncompleted plans updated most recently
      const finalPlan = allPlans?.find(p => (p.completed_days ?? 0) < (p.total_days ?? 0)) || allPlans?.[0];
      
      setProfile(p as Profile | null);
      setRecentLogs((logs as any) ?? []);
      setLogDates(new Set((logs ?? []).map(l => l.reading_date)));
      setActivePlan(finalPlan as ActivePlan | null);
    } catch (error) {
      console.error("Error fetching reading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [user, authLoading]);

  return {
    user,
    profile,
    activePlan,
    logDates,
    recentLogs,
    loading: authLoading || loading,
    today,
    refresh: fetchData
  };
}
