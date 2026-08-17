import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy,
  Flame,
  CalendarDays,
  Lock,
  Sprout,
  Zap,
  Book,
  BookOpen,
  Library,
  Star,
  Crown,
  BookMarked,
  ScrollText,
  Lightbulb,
  Music,
  Clock,
  Users,
  UserPlus,
  HeartHandshake,
  Share2,
  Megaphone,
  type LucideIcon,
} from "lucide-react";
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
  icon: LucideIcon;
  unlocked: (s: Stats) => boolean;
};

const ACHIEVEMENTS: Achievement[] = [
  { id: "a1", title: "Primeiro Passo", description: "Registre sua primeira leitura", icon: Sprout, unlocked: (s) => s.total_chapters_read >= 1 },
  { id: "a2", title: "Chama Inicial", description: "Uma semana de ofensiva (7 dias)", icon: Flame, unlocked: (s) => s.longest_streak >= 7 },
  { id: "a3", title: "Dedicado", description: "14 dias seguidos sem falhar", icon: Zap, unlocked: (s) => s.longest_streak >= 14 },
  { id: "a4", title: "Consistente", description: "30 dias seguidos de ofensiva", icon: CalendarDays, unlocked: (s) => s.longest_streak >= 30 },
  { id: "a5", title: "Incansável", description: "100 dias seguidos de ofensiva", icon: Trophy, unlocked: (s) => s.longest_streak >= 100 },
  { id: "a6", title: "Pequeno Início", description: "Leu 10 capítulos no total", icon: Book, unlocked: (s) => s.total_chapters_read >= 10 },
  { id: "a7", title: "Estudioso", description: "Leu 50 capítulos no total", icon: BookOpen, unlocked: (s) => s.total_chapters_read >= 50 },
  { id: "a8", title: "Conhecedor", description: "Leu 100 capítulos no total", icon: Library, unlocked: (s) => s.total_chapters_read >= 100 },
  { id: "a9", title: "Leitor Ávido", description: "Leu 500 capítulos no total", icon: Star, unlocked: (s) => s.total_chapters_read >= 500 },
  { id: "a10", title: "Bíblia Completa", description: "Leu todos os 1189 capítulos", icon: Crown, unlocked: (s) => s.total_chapters_read >= 1189 },
  { id: "a11", title: "Novo Testamento", description: "Terminou todo o NT", icon: BookMarked, unlocked: () => false },
  { id: "a12", title: "Antigo Testamento", description: "Terminou todo o AT", icon: ScrollText, unlocked: () => false },
  { id: "a13", title: "Sábio", description: "Leu todo o livro de Provérbios", icon: Lightbulb, unlocked: () => false },
  { id: "a14", title: "Adorador", description: "Leu todo o livro de Salmos", icon: Music, unlocked: () => false },
  { id: "a15", title: "Dia Intensivo", description: "Leu um livro inteiro em um único dia", icon: Clock, unlocked: () => false },
  { id: "a16", title: "Hábito em Grupo", description: "Entrou em um grupo de leitura", icon: Users, unlocked: () => false },
  { id: "a17", title: "Amigo na Leitura", description: "Leu junto com seu grupo", icon: UserPlus, unlocked: () => false },
  { id: "a18", title: "Companheiros", description: "Completou 7 dias lendo em grupo", icon: HeartHandshake, unlocked: () => false },
  { id: "a19", title: "Mentor Júnior", description: "Convidou 3 amigos para o app", icon: Share2, unlocked: () => false },
  { id: "a20", title: "Mentor Sênior", description: "Convidou 5 amigos para o app", icon: Megaphone, unlocked: () => false },
];

function AchievementsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ current_streak: 0, longest_streak: 0, total_chapters_read: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("current_streak, longest_streak, total_chapters_read")
        .eq("id", user.id)
        .maybeSingle();
      if (!cancelled && data) setStats(data as Stats);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const unlockedCount = ACHIEVEMENTS.filter((a) => a.unlocked(stats)).length;

  return (
    <AppShell title="Conquistas" subtitle="Seus emblemas e recordes">
      <div className="mb-6 grid grid-cols-3 gap-3">
        {loading ? (
          <>
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </>
        ) : (
          <>
            <Card className="border-border/60 bg-card/70 p-4 text-center backdrop-blur-sm">
              <Trophy className="mx-auto h-5 w-5 text-primary" aria-hidden="true" />
              <p className="mt-2 font-display text-xl font-bold">
                {unlockedCount}
                <span className="text-sm text-muted-foreground">/{ACHIEVEMENTS.length}</span>
              </p>
              <h3 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Emblemas
              </h3>
            </Card>
            <Card className="border-border/60 bg-card/70 p-4 text-center backdrop-blur-sm">
              <Flame className="mx-auto h-5 w-5 text-[color:var(--flame)]" aria-hidden="true" />
              <p className="mt-2 font-display text-xl font-bold">{stats.current_streak}</p>
              <h3 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Ofensiva
              </h3>
            </Card>
            <Card className="border-border/60 bg-card/70 p-4 text-center backdrop-blur-sm">
              <CalendarDays className="mx-auto h-5 w-5 text-primary" aria-hidden="true" />
              <p className="mt-2 font-display text-xl font-bold">{stats.total_chapters_read}</p>
              <h3 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Capítulos
              </h3>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 pb-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border-border/60 bg-card/70 p-5 text-center">
              <Skeleton className="mx-auto h-10 w-10 rounded-full" />
              <Skeleton className="mt-3 h-4 w-20 mx-auto" />
              <Skeleton className="mt-1 h-3 w-24 mx-auto" />
            </Card>
          ))
        ) : (
          ACHIEVEMENTS.map((a) => {
            const isUnlocked = a.unlocked(stats);
            const Icon = a.icon;
            return (
              <Card
                key={a.id}
                className={`relative overflow-hidden border-border/60 p-5 text-center backdrop-blur-sm transition-all ${
                  isUnlocked
                    ? "bg-card/70 shadow-card hover:-translate-y-0.5 hover:shadow-glow"
                    : "bg-card/40 opacity-60"
                }`}
                aria-label={`${a.title}: ${a.description}. ${isUnlocked ? 'Desbloqueado' : 'Bloqueado'}`}
              >
                {!isUnlocked && (
                  <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-background/60 text-muted-foreground">
                    <Lock className="h-3 w-3" />
                  </span>
                )}
                <div className="flex justify-center">
                  <Icon className={`h-10 w-10 ${isUnlocked ? "text-primary" : "grayscale"}`} aria-hidden="true" />
                </div>
                <h4 className="mt-3 font-display text-sm font-semibold">{a.title}</h4>
                <p className="mt-1 text-[11px] leading-tight text-muted-foreground">{a.description}</p>
              </Card>
            );
          })
        )}
      </div>
    </AppShell>
  );
}
