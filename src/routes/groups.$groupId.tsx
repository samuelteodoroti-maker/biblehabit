import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Flame, Crown, Copy, Loader2, Send, BookOpen, Users, MessageCircle, Trophy, Heart, Medal, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/groups/$groupId")({
  head: () => ({
    meta: [
      { title: "Grupo — Bible Habit" },
      { name: "description", content: "Atividades, ranking e chat do grupo." },
      { property: "og:title", content: "Grupo — Bible Habit" },
      { property: "og:description", content: "Atividades, ranking e chat do grupo." },
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

type ProfileLite = { id: string; name: string | null; avatar_url: string | null; current_streak: number };

type MemberStat = {
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  chapters: number;
  streak: number;
};

type Activity = {
  id: string;
  user_id: string;
  created_at: string;
  read_date: string;
  chapters_count: number;
  notes: string | null;
  plan_title: string | null;
};

type Message = {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
};

function weekStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Sunday
  return d.toISOString().slice(0, 10);
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "agora";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

function GroupDetail() {
  const { groupId } = Route.useParams();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<MemberStat[]>([]);
  const [profilesMap, setProfilesMap] = useState<Map<string, ProfileLite>>(new Map());
  const [activities, setActivities] = useState<Activity[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [reactions, setReactions] = useState<
    Map<string, { fire: number; amen: number; myFire: boolean; myAmen: boolean }>
  >(new Map());
  const chatEndRef = useRef<HTMLDivElement | null>(null);

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
      const pmap = new Map<string, ProfileLite>();
      (profiles ?? []).forEach((p) => pmap.set(p.id, p as ProfileLite));
      setProfilesMap(pmap);

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

  // Load activities feed
  useEffect(() => {
    if (!user || members.length === 0) return;
    let cancelled = false;
    (async () => {
      setLoadingActivities(true);
      const ids = members.map((m) => m.user_id);
      const { data: logs } = await supabase
        .from("reading_logs")
        .select("id, user_id, created_at, read_date, chapters_count, notes, plan_id")
        .in("user_id", ids)
        .order("created_at", { ascending: false })
        .limit(50);

      const planIds = Array.from(
        new Set(((logs ?? []) as Array<{ plan_id: string | null }>).map((l) => l.plan_id).filter((x): x is string => !!x)),
      );
      const planMap = new Map<string, string>();
      if (planIds.length > 0) {
        const { data: plans } = await supabase
          .from("reading_plans")
          .select("id, title")
          .in("id", planIds);
        (plans ?? []).forEach((p) => planMap.set(p.id, p.title));
      }

      const feed: Activity[] = ((logs ?? []) as Array<{
        id: string; user_id: string; created_at: string; read_date: string;
        chapters_count: number; notes: string | null; plan_id: string | null;
      }>).map((l) => ({
        id: l.id,
        user_id: l.user_id,
        created_at: l.created_at,
        read_date: l.read_date,
        chapters_count: l.chapters_count,
        notes: l.notes,
        plan_title: l.plan_id ? planMap.get(l.plan_id) ?? null : null,
      }));
      if (cancelled) return;
      setActivities(feed);
      setLoadingActivities(false);

      // Load reactions for these activities
      const logIds = feed.map((f) => f.id);
      if (logIds.length > 0) {
        const { data: rx } = await supabase
          .from("reactions")
          .select("log_id, type, user_id")
          .in("log_id", logIds);
        if (cancelled) return;
        const map = new Map<string, { fire: number; amen: number; myFire: boolean; myAmen: boolean }>();
        (rx ?? []).forEach((r: { log_id: string; type: string; user_id: string }) => {
          const cur = map.get(r.log_id) ?? { fire: 0, amen: 0, myFire: false, myAmen: false };
          if (r.type === "fire") {
            cur.fire++;
            if (r.user_id === user.id) cur.myFire = true;
          } else if (r.type === "amen") {
            cur.amen++;
            if (r.user_id === user.id) cur.myAmen = true;
          }
          map.set(r.log_id, cur);
        });
        setReactions(map);
      }
    })();
    return () => { cancelled = true; };
  }, [members, user]);

  // Load and subscribe messages
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoadingMessages(true);
    (async () => {
      const { data } = await supabase
        .from("group_messages")
        .select("id, user_id, message, created_at")
        .eq("group_id", groupId)
        .order("created_at", { ascending: true })
        .limit(200);
      if (cancelled) return;
      setMessages((data as Message[]) ?? []);
      setLoadingMessages(false);
    })();

    const channel = supabase
      .channel(`group_messages:${groupId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "group_messages", filter: `group_id=eq.${groupId}` },
        (payload) => {
          const m = payload.new as Message;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [groupId, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendMessage = async () => {
    if (!user || !draft.trim()) return;
    setSending(true);
    const text = draft.trim();
    setDraft("");
    const { error } = await supabase.from("group_messages").insert({
      group_id: groupId,
      user_id: user.id,
      message: text,
    });
    setSending(false);
    if (error) {
      toast.error(error.message);
      setDraft(text);
    }
  };

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

      <Tabs defaultValue="activities">
        <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-card/60 p-1 backdrop-blur-sm">
          <TabsTrigger value="activities" className="rounded-xl gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" /> Atividades
          </TabsTrigger>
          <TabsTrigger value="chat" className="rounded-xl gap-1.5 text-xs">
            <MessageCircle className="h-3.5 w-3.5" /> Chat
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="rounded-xl gap-1.5 text-xs">
            <Trophy className="h-3.5 w-3.5" /> Ranking
          </TabsTrigger>
          <TabsTrigger value="invite" className="rounded-xl gap-1.5 text-xs">
            <Copy className="h-3.5 w-3.5" /> Convite
          </TabsTrigger>
        </TabsList>

        {/* ATIVIDADES */}
        <TabsContent value="activities" className="mt-5">
          {loadingActivities ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : activities.length === 0 ? (
            <Card className="border-dashed border-border/70 bg-card/40 p-8 text-center text-sm text-muted-foreground">
              Ainda sem leituras registradas nesse grupo.
            </Card>
          ) : (
            <div className="relative space-y-3 pl-6">
              <span className="pointer-events-none absolute left-[11px] top-2 bottom-2 w-px bg-border/60" />
              {activities.map((a) => {
                const p = profilesMap.get(a.user_id);
                const name = p?.name ?? "Sem nome";
                return (
                  <div key={a.id} className="relative">
                    <span className="absolute -left-[22px] top-4 h-3 w-3 rounded-full gradient-primary ring-4 ring-background" />
                    <Card className="border-border/60 bg-card/70 p-4 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={p?.avatar_url ?? undefined} />
                          <AvatarFallback>{name[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{name}</p>
                          <p className="text-[11px] text-muted-foreground">{timeAgo(a.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                          <BookOpen className="h-3.5 w-3.5" />
                          {a.chapters_count} {a.chapters_count === 1 ? "cap" : "caps"}
                        </div>
                      </div>
                      {a.plan_title && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Plano: <span className="text-foreground">{a.plan_title}</span>
                        </p>
                      )}
                      {a.notes && (
                        <div className="mt-3 rounded-xl border border-border/60 bg-background/40 p-3 text-sm italic text-foreground/90">
                          "{a.notes}"
                        </div>
                      )}
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* CHAT */}
        <TabsContent value="chat" className="mt-5">
          <Card className="flex h-[60vh] flex-col overflow-hidden border-border/60 bg-card/60 backdrop-blur-sm">
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {loadingMessages ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nenhuma mensagem ainda. Diga um oi 👋
                </p>
              ) : (
                messages.map((m) => {
                  const mine = m.user_id === user?.id;
                  const p = profilesMap.get(m.user_id);
                  const name = p?.name ?? "Sem nome";
                  return (
                    <div key={m.id} className={`flex gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                      {!mine && (
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={p?.avatar_url ?? undefined} />
                          <AvatarFallback>{name[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${
                        mine
                          ? "gradient-primary text-primary-foreground"
                          : "bg-background/70 text-foreground border border-border/60"
                      }`}>
                        {!mine && (
                          <p className="mb-0.5 text-[11px] font-semibold opacity-80">{name}</p>
                        )}
                        <p className="whitespace-pre-wrap break-words text-sm">{m.message}</p>
                        <p className={`mt-1 text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {timeAgo(m.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
              className="flex gap-2 border-t border-border/60 bg-background/40 p-3"
            >
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Escreva uma mensagem..."
                className="rounded-full"
                disabled={sending}
              />
              <Button
                type="submit"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full gradient-primary text-primary-foreground"
                disabled={sending || !draft.trim()}
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </Card>
        </TabsContent>

        {/* RANKING */}
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
