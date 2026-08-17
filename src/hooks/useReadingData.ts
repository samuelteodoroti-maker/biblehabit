import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type Profile = {
  name: string | null;
  avatar_url: string | null;
  current_streak: number;
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

export function useReadingData() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);
  const [logDates, setLogDates] = useState<Set<string>>(new Set());
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
    
    // Fetch profile
    const { data: p } = await supabase
      .from("profiles")
      .select("name, avatar_url, current_streak, total_chapters_read, last_read_date")
      .eq("id", user.id)
      .maybeSingle();
      
    // Fetch logs
    const { data: logs } = await supabase
      .from("reading_logs")
      .select("read_date")
      .eq("user_id", user.id)
      .order("read_date", { ascending: false })
      .limit(365);
      
    // Fetch active plan:
    // 1. Plan marked as active (if we had a field, but we don't yet in current schema)
    // 2. Most recently updated plan that is NOT completed
    const { data: plans } = await supabase
      .from("reading_plans")
      .select("id, title, books_today, completed_days, total_days")
      .eq("user_id", user.id)
      .lt("completed_days", supabase.raw("total_days")) // Not completed
      .order("updated_at", { ascending: false })
      .limit(1);
      
    // If no uncompleted plans, try most recent plan overall
    let finalPlan = plans?.[0];
    if (!finalPlan) {
      const { data: lastPlan } = await supabase
        .from("reading_plans")
        .select("id, title, books_today, completed_days, total_days")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1);
      finalPlan = lastPlan?.[0];
    }
    
    setProfile(p as Profile | null);
    setLogDates(new Set((logs ?? []).map(l => l.read_date)));
    setActivePlan(finalPlan as ActivePlan | null);
    setLoading(false);
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
    loading: authLoading || loading,
    today,
    refresh: fetchData
  };
}
