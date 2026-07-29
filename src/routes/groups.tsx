import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, ChevronRight } from "lucide-react";
import { groups } from "@/lib/mockData";
import { toast } from "sonner";

export const Route = createFileRoute("/groups")({
  head: () => ({
    meta: [
      { title: "Grupos — Bible Tracker" },
      { name: "description", content: "Leia junto com seus grupos e acompanhe o ranking semanal." },
      { property: "og:title", content: "Grupos — Bible Tracker" },
      { property: "og:description", content: "Leia junto com seus grupos e acompanhe o ranking semanal." },
    ],
  }),
  component: GroupsPage,
});

function GroupsPage() {
  const matches = useMatches();
  const isChild = matches.some((m) => m.routeId.includes("groups/$groupId"));
  if (isChild) return <Outlet />;

  return (
    <AppShell title="Grupos">
      <Button className="mb-5 w-full gap-2" onClick={() => toast.success("Grupo criado (mock)")}>
        <Plus className="h-4 w-4" /> Criar novo grupo
      </Button>
      <div className="space-y-3">
        {groups.map((g) => (
          <Link key={g.id} to="/groups/$groupId" params={{ groupId: g.id }}>
            <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-accent">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-2xl">
                {g.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold">{g.name}</h3>
                <p className="text-xs text-muted-foreground">{g.members} membros</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
