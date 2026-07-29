import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, ChevronRight, Users } from "lucide-react";
import { groups } from "@/lib/mockData";
import { toast } from "sonner";

export const Route = createFileRoute("/groups/")({
  head: () => ({
    meta: [
      { title: "Grupos — Bible Habit" },
      { name: "description", content: "Leia junto com seus grupos e acompanhe o ranking semanal." },
      { property: "og:title", content: "Grupos — Bible Habit" },
      { property: "og:description", content: "Leia junto com seus grupos e acompanhe o ranking semanal." },
    ],
  }),
  component: GroupsPage,
});

function GroupsPage() {
  return (
    <AppShell title="Grupos" subtitle="Leia junto e compare o progresso">
      <Button
        className="mb-6 h-12 w-full gap-2 rounded-2xl gradient-primary font-semibold text-primary-foreground shadow-glow hover:brightness-110"
        onClick={() => toast.success("Grupo criado (mock)")}
      >
        <Plus className="h-4 w-4" /> Criar novo grupo
      </Button>

      {groups.length === 0 ? (
        <Card className="border-dashed border-border/70 bg-card/40 p-8 text-center">
          <Users className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-display text-base font-semibold">Sem grupos ainda</p>
          <p className="mt-1 text-sm text-muted-foreground">Crie o primeiro para começar.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => (
            <Link key={g.id} to="/groups/$groupId" params={{ groupId: g.id }}>
              <Card className="group flex items-center gap-3 border-border/60 bg-card/70 p-4 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent/60 text-2xl">
                  {g.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display font-semibold">{g.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {g.members} {g.members === 1 ? "membro" : "membros"}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
