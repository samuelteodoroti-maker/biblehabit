import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Flame, BookOpenCheck, CalendarDays, Loader2 } from "lucide-react";
import { currentUser, readingHeatmap, readingPlans } from "@/lib/mockData";
import { ReadingCalendar } from "@/components/ReadingCalendar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home — Bible Habit" },
      { name: "description", content: "Acompanhe sua leitura bíblica diária, ofensiva e progresso." },
      { property: "og:title", content: "Home — Bible Habit" },
      { property: "og:description", content: "Acompanhe sua leitura bíblica diária, ofensiva e progresso." },
    ],
  }),
  component: HomePage,
});

// Determinístico para SSR/CSR do calendário (mês exibido).
const CURRENT_YEAR = 2026;
const CURRENT_MONTH = 6; // July (0-indexed)

const pad = (n: number) => String(n).padStart(2, "0");
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

type Profile = {
  name: string | null;
  avatar_url: string | null;
  current_streak: number;
  total_chapters_read: number;
  last_read_date: string | null;
};

function HomePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [logDates, setLogDates] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const activePlan = readingPlans[0];

  const today = useMemo(() => todayKey(), []);
  const registeredToday = logDates.has(today);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLogDates(new Set());
      return;
    }
    let cancelled = false;
    setDataLoading(true);
    (async () => {
      const [{ data: p }, { data: logs }] = await Promise.all([
        supabase
          .from("profiles")
          .select("name, avatar_url, current_streak, total_chapters_read, last_read_date")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("reading_logs")
          .select("read_date")
          .eq("user_id", user.id)
          .order("read_date", { ascending: false })
          .limit(365),
      ]);
      if (cancelled) return;
      setProfile(p as Profile | null);
      setLogDates(new Set((logs ?? []).map((l: { read_date: string }) => l.read_date)));
      setDataLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Fallback (mock) para visitantes deslogados
  const mockReadDates = useMemo(
    () =>
      new Set(
        readingHeatmap
          .filter((d) => d.value > 0)
          .map((d) => d.date)
          .filter((d) => d.startsWith("2026-07"))
      ),
    []
  );

  const displayName = profile?.name ?? user?.email?.split("@")[0] ?? currentUser.name.split(" ")[0];
  const streak = profile?.current_streak ?? (user ? 0 : currentUser.streak);
  const total = profile?.total_chapters_read ?? (user ? 0 : currentUser.totalDays);
  const readDates = user ? logDates : mockReadDates;

  const handleRegister = async () => {
    if (!user) {
      toast.info("Entre para registrar sua leitura");
      navigate({ to: "/auth" });
      return;
    }
    if (registeredToday) return;
    setBusy(true);
    const { error } = await supabase.from("reading_logs").insert({
      user_id: user.id,
      read_date: today,
      chapters_count: 1,
    });
    if (error) {
      setBusy(false);
      toast.error(error.message);
      return;
    }
    // Refetch profile (updated by trigger) and add today locally
    const { data: p } = await supabase
      .from("profiles")
      .select("name, avatar_url, current_streak, total_chapters_read, last_read_date")
      .eq("id", user.id)
      .maybeSingle();
    setProfile(p as Profile | null);
    setLogDates((prev) => new Set(prev).add(today));
    setBusy(false);
    toast.success("Leitura de hoje registrada! 🔥");
  };

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Olá, boa manhã</p>
        <h1 className="text-2xl font-bold tracking-tight">{displayName} 👋</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hoje: <span className="font-medium text-foreground">{activePlan.booksToday}</span>
        </p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-xs">Ofensiva</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{streak} dias</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className="text-xs">Total</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{total}</p>
        </Card>
      </div>

      <Button
        size="lg"
        className="mb-6 w-full gap-2 py-6 text-base"
        disabled={busy || registeredToday || authLoading || dataLoading}
        onClick={handleRegister}
      >
        {busy ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <BookOpenCheck className="h-5 w-5" />
        )}
        {registeredToday
          ? "Leitura registrada ✓"
          : user
            ? "Registrar leitura de hoje"
            : "Entrar para registrar leitura"}
      </Button>

      <ReadingCalendar
        year={CURRENT_YEAR}
        month={CURRENT_MONTH}
        today={today}
        readDates={readDates}
        className="mb-6"
      />
    </AppShell>
  );
}
