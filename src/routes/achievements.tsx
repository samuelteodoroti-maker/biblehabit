import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { achievements, currentUser } from "@/lib/mockData";
import { Trophy, Flame, CalendarDays, Lock } from "lucide-react";

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

function AchievementsPage() {
  const unlocked = achievements.filter((a) => a.unlocked).length;
  return (
    <AppShell title="Conquistas" subtitle="Seus emblemas e recordes">
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Card className="border-border/60 bg-card/70 p-4 text-center backdrop-blur-sm">
          <Trophy className="mx-auto h-5 w-5 text-primary" />
          <p className="mt-2 font-display text-xl font-bold">
            {unlocked}
            <span className="text-sm text-muted-foreground">/{achievements.length}</span>
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Emblemas
          </p>
        </Card>
        <Card className="border-border/60 bg-card/70 p-4 text-center backdrop-blur-sm">
          <Flame className="mx-auto h-5 w-5 text-[color:var(--flame)]" />
          <p className="mt-2 font-display text-xl font-bold">{currentUser.streak}</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Ofensiva
          </p>
        </Card>
        <Card className="border-border/60 bg-card/70 p-4 text-center backdrop-blur-sm">
          <CalendarDays className="mx-auto h-5 w-5 text-primary" />
          <p className="mt-2 font-display text-xl font-bold">{currentUser.totalDays}</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Total
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {achievements.map((a) => (
          <Card
            key={a.id}
            className={`relative overflow-hidden border-border/60 p-5 text-center backdrop-blur-sm transition-all ${
              a.unlocked
                ? "bg-card/70 shadow-card hover:-translate-y-0.5 hover:shadow-glow"
                : "bg-card/40 opacity-60"
            }`}
          >
            {!a.unlocked && (
              <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-background/60 text-muted-foreground">
                <Lock className="h-3 w-3" />
              </span>
            )}
            <div className={`text-4xl ${a.unlocked ? "" : "grayscale"}`}>{a.icon}</div>
            <p className="mt-3 font-display text-sm font-semibold">{a.title}</p>
            <p className="mt-1 text-[11px] leading-tight text-muted-foreground">{a.description}</p>
            {a.unlocked && a.unlockedAt && (
              <p className="mt-2 text-[10px] font-medium text-primary">
                Desbloqueado {a.unlockedAt}
              </p>
            )}
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
