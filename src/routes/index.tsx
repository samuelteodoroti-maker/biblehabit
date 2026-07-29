import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Flame, BookOpenCheck, CalendarDays, Sparkles, Check } from "lucide-react";
import { ReadingCalendar } from "@/components/ReadingCalendar";
import { LogReadingModal } from "@/components/LogReadingModal";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bible Habit" },
      { name: "description", content: "Acompanhe sua leitura bíblica diária, ofensiva e progresso." },
      { property: "og:title", content: "Bible Habit" },
      { property: "og:description", content: "Acompanhe sua leitura bíblica diária, ofensiva e progresso." },
    ],
  }),
  component: HomePage,
});

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

type ActivePlan = {
  id: string;
  title: string;
  books_today: string | null;
};

function HomePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);
  const [logDates, setLogDates] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);


  const today = useMemo(() => todayKey(), []);
  const now = useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const registeredToday = logDates.has(today);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setActivePlan(null);
      setLogDates(new Set());
      return;
    }
    let cancelled = false;
    setDataLoading(true);
    (async () => {
      // Ensure profile enrichment from OAuth metadata (name / avatar) if missing.
      const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
      const metaName =
        (meta.full_name as string | undefined) ??
        (meta.name as string | undefined) ??
        null;
      const metaAvatar =
        (meta.avatar_url as string | undefined) ??
        (meta.picture as string | undefined) ??
        null;

      const { data: existing } = await supabase
        .from("profiles")
        .select("name, avatar_url, current_streak, total_chapters_read, last_read_date")
        .eq("id", user.id)
        .maybeSingle();

      let p = existing as Profile | null;

      if (!p) {
        const { data: inserted } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email ?? null,
            name: metaName,
            avatar_url: metaAvatar,
          })
          .select("name, avatar_url, current_streak, total_chapters_read, last_read_date")
          .maybeSingle();
        p = (inserted as Profile | null) ?? {
          name: metaName,
          avatar_url: metaAvatar,
          current_streak: 0,
          total_chapters_read: 0,
          last_read_date: null,
        };
      } else if ((!p.name && metaName) || (!p.avatar_url && metaAvatar)) {
        const patch: { name?: string; avatar_url?: string } = {};
        if (!p.name && metaName) patch.name = metaName;
        if (!p.avatar_url && metaAvatar) patch.avatar_url = metaAvatar;
        const { data: updated } = await supabase
          .from("profiles")
          .update(patch)
          .eq("id", user.id)
          .select("name, avatar_url, current_streak, total_chapters_read, last_read_date")
          .maybeSingle();
        if (updated) p = updated as Profile;
      }

      const [{ data: logs }, { data: plans }] = await Promise.all([
        supabase
          .from("reading_logs")
          .select("read_date")
          .eq("user_id", user.id)
          .order("read_date", { ascending: false })
          .limit(365),
        supabase
          .from("reading_plans")
          .select("id, title, books_today")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(1),
      ]);

      if (cancelled) return;
      setProfile(p);
      setLogDates(new Set((logs ?? []).map((l: { read_date: string }) => l.read_date)));
      setActivePlan((plans?.[0] as ActivePlan | undefined) ?? null);
      setDataLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Daily reminder: if enabled and past reminder time with no reading today, notify once/day.
  useEffect(() => {
    if (!user || dataLoading) return;
    try {
      const enabled = localStorage.getItem("bh_reminder_enabled") === "1";
      if (!enabled) return;
      const time = localStorage.getItem("bh_reminder_time") || "20:00";
      const [hh, mm] = time.split(":").map(Number);
      const now = new Date();
      const trigger = new Date();
      trigger.setHours(hh || 20, mm || 0, 0, 0);
      if (now < trigger) return;
      if (registeredToday) return;
      const key = `bh_reminded_${today}`;
      if (localStorage.getItem(key) === "1") return;
      localStorage.setItem(key, "1");
      const msg = "Que tal registrar sua leitura de hoje? 📖";
      if ("Notification" in window && Notification.permission === "granted") {
        try { new Notification("Bible Habit", { body: msg }); } catch {}
      }
      toast(msg, { duration: 6000 });
    } catch {}
  }, [user, dataLoading, registeredToday, today]);

  const displayName =
    profile?.name?.split(" ")[0] ??
    (user?.email ? user.email.split("@")[0] : "amigo");
  const streak = profile?.current_streak ?? 0;
  const total = profile?.total_chapters_read ?? 0;

  const openRegister = () => {
    if (!user) {
      toast.info("Entre para registrar sua leitura");
      navigate({ to: "/auth" });
      return;
    }
    if (registeredToday) return;
    setModalOpen(true);
  };

  const refreshAfterLog = async () => {
    if (!user) return;
    const { data: p } = await supabase
      .from("profiles")
      .select("name, avatar_url, current_streak, total_chapters_read, last_read_date")
      .eq("id", user.id)
      .maybeSingle();
    setProfile(p as Profile | null);
    setLogDates((prev) => new Set(prev).add(today));
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
              : streak === 0
                ? "Comece hoje sua primeira leitura para acender a chama."
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
            {activePlan?.books_today ?? "Sem plano ativo"}
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
        disabled={registeredToday || authLoading || dataLoading}
        onClick={openRegister}
      >
        {registeredToday ? (
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
        year={currentYear}
        month={currentMonth}
        today={today}
        readDates={logDates}
      />

      {user && (
        <LogReadingModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          userId={user.id}
          today={today}
          onSaved={refreshAfterLog}
        />
      )}

    </AppShell>
  );
}
