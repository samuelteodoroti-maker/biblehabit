import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Trophy, Flame, CalendarDays, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Conquistas — Bible Habit" },
      { name: "description", content: "Emblemas, recordes e placar pessoal de leitura bíblica." },
      { property: "og:title", content: "Conquistas — Bible Habit" },
      { property: "og:description", content: "Emblemas, recordes e placar pessoal de leitura bíblica." },
    ],
  }),
  component: AchievementsPage,
});

type Stats = {
  current_streak: number;
  longest_streak: number;
  total_chapters_read: number;
};

type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: (s: Stats) => boolean;
};

const ACHIEVEMENTS: Achievement[] = [
  { id: "a1", title: "Primeiro Passo", description: "Registre sua primeira leitura", icon: "🌱", unlocked: (s) => s.total_chapters_read >= 1 },
  { id: "a2", title: "7 Dias Seguidos", description: "Uma semana de ofensiva", icon: "🔥", unlocked: (s) => s.longest_streak >= 7 },
  { id: "a3", title: "30 Dias Seguidos", description: "Um mês inteiro sem falhar", icon: "⚡", unlocked: (s) => s.longest_streak >= 30 },
  { id: "a4", title: "50 Capítulos", description: "Leu 50 capítulos no total", icon: "📖", unlocked: (s) => s.total_chapters_read >= 50 },
  { id: "a5", title: "100 Capítulos", description: "Leu 100 capítulos no total", icon: "💯", unlocked: (s) => s.total_chapters_read >= 100 },
  { id: "a6", title: "100 Dias", description: "Ofensiva de 100 dias", icon: "🏆", unlocked: (s) => s.longest_streak >= 100 },
  { id: "a7", title: "500 Capítulos", description: "Leu 500 capítulos no total", icon: "🌟", unlocked: (s) => s.total_chapters_read >= 500 },
  { id: "a8", title: "Bíblia Completa", description: "Leu 1189 capítulos", icon: "👑", unlocked: (s) => s.total_chapters_read >= 1189 },
];

function AchievementsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ current_streak: 0, longest_streak: 0, total_chapters_read: 0 });

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("current_streak, longest_streak, total_chapters_read")
        .eq("id", user.id)
        .maybeSingle();
      if (!cancelled && data) setStats(data as Stats);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const unlocked = ACHIEVEMENTS.filter((a) => a.unlocked(stats)).length;

  return (
    <AppShell title="Conquistas" subtitle="Seus emblemas e recordes">
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Card className="border-border/60 bg-card/70 p-4 text-center backdrop-blur-sm">
          <Trophy className="mx-auto h-5 w-5 text-primary" />
          <p className="mt-2 font-display text-xl font-bold">
            {unlocked}
            <span className="text-sm text-muted-foreground">/{ACHIEVEMENTS.length}</span>
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Emblemas
          </p>
        </Card>
        <Card className="border-border/60 bg-card/70 p-4 text-center backdrop-blur-sm">
          <Flame className="mx-auto h-5 w-5 text-[color:var(--flame)]" />
          <p className="mt-2 font-display text-xl font-bold">{stats.current_streak}</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Ofensiva
          </p>
        </Card>
        <Card className="border-border/60 bg-card/70 p-4 text-center backdrop-blur-sm">
          <CalendarDays className="mx-auto h-5 w-5 text-primary" />
          <p className="mt-2 font-display text-xl font-bold">{stats.total_chapters_read}</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Capítulos
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = a.unlocked(stats);
          return (
            <Card
              key={a.id}
              className={`relative overflow-hidden border-border/60 p-5 text-center backdrop-blur-sm transition-all ${
                isUnlocked
                  ? "bg-card/70 shadow-card hover:-translate-y-0.5 hover:shadow-glow"
                  : "bg-card/40 opacity-60"
              }`}
            >
              {!isUnlocked && (
                <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-background/60 text-muted-foreground">
                  <Lock className="h-3 w-3" />
                </span>
              )}
              <div className={`text-4xl ${isUnlocked ? "" : "grayscale"}`}>{a.icon}</div>
              <p className="mt-3 font-display text-sm font-semibold">{a.title}</p>
              <p className="mt-1 text-[11px] leading-tight text-muted-foreground">{a.description}</p>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
