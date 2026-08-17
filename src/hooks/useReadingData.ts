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
    
    try {
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
        
      // Fetch plans to determine active one
      const { data: allPlans } = await supabase
        .from("reading_plans")
        .select("id, title, books_today, completed_days, total_days")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      const finalPlan = allPlans?.find(p => (p.completed_days ?? 0) < (p.total_days ?? 0)) || allPlans?.[0];
      
      setProfile(p as Profile | null);
      setLogDates(new Set((logs ?? []).map(l => l.read_date)));
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
    loading: authLoading || loading,
    today,
    refresh: fetchData
  };
}
