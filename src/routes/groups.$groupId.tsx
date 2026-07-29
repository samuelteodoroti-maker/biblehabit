import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Flame, Crown, Copy, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/groups/$groupId")({
  head: () => ({
    meta: [
      { title: "Grupo — Bible Habit" },
      { name: "description", content: "Ranking do grupo e progresso semanal." },
      { property: "og:title", content: "Grupo — Bible Habit" },
      { property: "og:description", content: "Ranking do grupo e progresso semanal." },
    ],
  }),
  component: GroupDetail,
});

type Group = {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  invite_code: string;
};

type MemberStat = {
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  chapters: number;
  streak: number;
};

function weekStart() {
  const d = new Date();
  const day = d.getDay(); // 0 sun
  const diff = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function GroupDetail() {
  const { groupId } = Route.useParams();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<MemberStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: g } = await supabase
        .from("groups")
        .select("id, name, description, avatar, invite_code")
        .eq("id", groupId)
        .maybeSingle();
      if (cancelled) return;
      if (!g) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setGroup(g as Group);

      const { data: mems } = await supabase
        .from("group_members")
        .select("user_id")
        .eq("group_id", groupId);
      const ids = (mems ?? []).map((m) => m.user_id);
      if (ids.length === 0) {
        setMembers([]);
        setLoading(false);
        return;
      }
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, current_streak")
        .in("id", ids);
      const wkStart = weekStart();
      const { data: logs } = await supabase
        .from("reading_logs")
        .select("user_id, chapters_count")
        .in("user_id", ids)
        .gte("read_date", wkStart);
      const chapterMap = new Map<string, number>();
      (logs ?? []).forEach((l) => {
        chapterMap.set(l.user_id, (chapterMap.get(l.user_id) ?? 0) + (l.chapters_count ?? 0));
      });
      const stats: MemberStat[] = (profiles ?? []).map((p) => ({
        user_id: p.id,
        name: p.name,
        avatar_url: p.avatar_url,
        chapters: chapterMap.get(p.id) ?? 0,
        streak: p.current_streak ?? 0,
      }));
      stats.sort((a, b) => b.chapters - a.chapters || b.streak - a.streak);
      if (cancelled) return;
      setMembers(stats);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [groupId, user]);

  if (notFound) {
    return (
      <AppShell title="Grupo não encontrado">
        <p className="text-sm text-muted-foreground">Este grupo não existe ou você não tem acesso.</p>
        <Link to="/groups" className="mt-4 inline-block text-sm text-primary hover:underline">
          Voltar para grupos
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/groups"
          className="grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-card/60 text-foreground transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent/60 text-2xl">
          {group?.avatar ?? "📖"}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-semibold">{group?.name ?? "..."}</h1>
          <p className="text-xs text-muted-foreground">
            {members.length} {members.length === 1 ? "membro" : "membros"}
          </p>
        </div>
      </div>

      <Tabs defaultValue="leaderboard">
        <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-card/60 p-1 backdrop-blur-sm">
          <TabsTrigger value="leaderboard" className="rounded-xl">Ranking</TabsTrigger>
          <TabsTrigger value="invite" className="rounded-xl">Convite</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="mt-5 space-y-2">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Progresso desta semana
          </p>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : members.length === 0 ? (
            <Card className="border-dashed border-border/70 bg-card/40 p-8 text-center text-sm text-muted-foreground">
              Ainda sem membros nesse grupo.
            </Card>
          ) : (
            members.map((m, i) => {
              const rank = i + 1;
              const podium = rank <= 3;
              const displayName = m.name ?? "Sem nome";
              return (
                <Card
                  key={m.user_id}
                  className={`flex items-center gap-3 border-border/60 bg-card/70 p-3 backdrop-blur-sm ${
                    rank === 1 ? "ring-1 ring-primary/40" : ""
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                      podium
                        ? "gradient-primary text-primary-foreground shadow-glow"
                        : "bg-accent/60 text-muted-foreground"
                    }`}
                  >
                    {rank === 1 ? <Crown className="h-4 w-4" /> : rank}
                  </span>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={m.avatar_url ?? undefined} />
                    <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.chapters} {m.chapters === 1 ? "capítulo" : "capítulos"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-background/60 px-2 py-1 text-xs font-medium">
                    <Flame className="h-3.5 w-3.5 text-[color:var(--flame)]" />
                    {m.streak}
                  </div>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="invite" className="mt-5">
          <Card className="border-border/60 bg-card/70 p-5 backdrop-blur-sm">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Código de convite
            </p>
            <p className="mt-2 font-mono text-2xl font-bold tracking-widest">
              {group?.invite_code ?? "..."}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Compartilhe este código para que outras pessoas entrem no grupo.
            </p>
            <Button
              variant="outline"
              className="mt-4 gap-2"
              onClick={() => {
                if (!group?.invite_code) return;
                navigator.clipboard.writeText(group.invite_code);
                toast.success("Código copiado");
              }}
            >
              <Copy className="h-4 w-4" /> Copiar código
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
