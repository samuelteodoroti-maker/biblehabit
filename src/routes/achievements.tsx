import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { achievements, currentUser } from "@/lib/mockData";
import { Trophy, Flame, CalendarDays } from "lucide-react";

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
    <AppShell title="Conquistas">
      <div className="mb-5 grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <Trophy className="mx-auto h-5 w-5 text-primary" />
          <p className="mt-1 text-lg font-bold">{unlocked}/{achievements.length}</p>
          <p className="text-[11px] text-muted-foreground">Emblemas</p>
        </Card>
        <Card className="p-3 text-center">
          <Flame className="mx-auto h-5 w-5 text-orange-500" />
          <p className="mt-1 text-lg font-bold">{currentUser.streak}</p>
          <p className="text-[11px] text-muted-foreground">Ofensiva</p>
        </Card>
        <Card className="p-3 text-center">
          <CalendarDays className="mx-auto h-5 w-5 text-primary" />
          <p className="mt-1 text-lg font-bold">{currentUser.totalDays}</p>
          <p className="text-[11px] text-muted-foreground">Total</p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {achievements.map((a) => (
          <Card
            key={a.id}
            className={`p-4 text-center transition ${a.unlocked ? "" : "opacity-40 grayscale"}`}
          >
            <div className="text-4xl">{a.icon}</div>
            <p className="mt-2 text-sm font-semibold">{a.title}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{a.description}</p>
            {a.unlocked && a.unlockedAt && (
              <p className="mt-1 text-[10px] text-primary">Desbloqueado {a.unlockedAt}</p>
            )}
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
