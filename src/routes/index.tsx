import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Flame, BookOpenCheck, CalendarDays, Loader2, Sparkles, Check } from "lucide-react";
import { currentUser, readingHeatmap, readingPlans } from "@/lib/mockData";
import { ReadingCalendar } from "@/components/ReadingCalendar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Início — Bible Habit" },
      { name: "description", content: "Acompanhe sua leitura bíblica diária, ofensiva e progresso." },
      { property: "og:title", content: "Início — Bible Habit" },
      { property: "og:description", content: "Acompanhe sua leitura bíblica diária, ofensiva e progresso." },
    ],
  }),
  component: HomePage,
});

const CURRENT_YEAR = 2026;
const CURRENT_MONTH = 6;

const pad = (n: number) => String(n).padStart(2, "0");
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
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

  const mockReadDates = useMemo(
    () =>
      new Set(
        readingHeatmap
          .filter((d) => d.value > 0)
          .map((d) => d.date)
          .filter((d) => d.startsWith("2026-07")),
      ),
    [],
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
    const { data: p } = await supabase
      .from("profiles")
      .select("name, avatar_url, current_streak, total_chapters_read, last_read_date")
      .eq("id", user.id)
      .maybeSingle();
    setProfile(p as Profile | null);
    setLogDates((prev) => new Set(prev).add(today));
    setBusy(false);
    toast.success("Leitura registrada! 🔥");
  };

  return (
    <AppShell>
      {/* Greeting */}
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
          {greeting()}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
          {displayName} <span className="inline-block">👋</span>
        </h1>
      </div>

      {/* Streak hero */}
      <Card className="relative mb-4 overflow-hidden border-border/60 bg-card/70 p-6 shadow-card backdrop-blur-sm">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full gradient-primary opacity-25 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Flame className="h-4 w-4 text-[color:var(--flame)]" />
            Ofensiva atual
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-6xl font-bold leading-none gradient-text">
              {streak}
            </span>
            <span className="text-lg font-medium text-muted-foreground">
              {streak === 1 ? "dia" : "dias"}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {registeredToday
              ? "Você já leu hoje. Continue firme amanhã."
              : "Registre a leitura de hoje para manter a chama acesa."}
          </p>
        </div>
      </Card>

      {/* Secondary stats */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            Capítulos
          </div>
          <p className="mt-2 font-display text-2xl font-bold">{total}</p>
        </Card>
        <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            Hoje
          </div>
          <p className="mt-2 truncate font-display text-base font-semibold">
            {activePlan.booksToday}
          </p>
        </Card>
      </div>

      {/* CTA */}
      <Button
        size="lg"
        className={`mb-8 h-14 w-full gap-2 rounded-2xl text-base font-semibold transition-all ${
          registeredToday
            ? "bg-success/15 text-success hover:bg-success/20"
            : "gradient-primary text-primary-foreground shadow-glow hover:brightness-110"
        }`}
        disabled={busy || registeredToday || authLoading || dataLoading}
        onClick={handleRegister}
      >
        {busy ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : registeredToday ? (
          <Check className="h-5 w-5" />
        ) : (
          <BookOpenCheck className="h-5 w-5" />
        )}
        {registeredToday
          ? "Leitura de hoje concluída"
          : user
            ? "Registrar leitura de hoje"
            : "Entrar para registrar"}
      </Button>

      <ReadingCalendar
        year={CURRENT_YEAR}
        month={CURRENT_MONTH}
        today={today}
        readDates={readDates}
      />
    </AppShell>
  );
}
