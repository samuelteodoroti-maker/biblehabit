import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type ReactNode, useEffect, useRef, useState, useMemo, useCallback } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Flame, Crown, Copy, Loader2, Send, BookOpen, Users, MessageCircle, Trophy, Heart, Medal, Award, ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/groups/$groupId")({
  head: () => ({
    meta: [
      { title: "Detalhes do grupo — Bible Habit" },
      { name: "description", content: "Veja as atividades recentes do grupo, o ranking semanal de capítulos lidos e converse com os membros no chat do Bible Habit." },
      { property: "og:title", content: "Detalhes do grupo — Bible Habit" },
      { property: "og:description", content: "Veja as atividades recentes do grupo, o ranking semanal de capítulos lidos e converse com os membros no chat do Bible Habit." },
      { property: "og:type", content: "article" },
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
  rank?: number;
};

type Activity = {
  id: string;
  user_id: string;
  created_at: string;
  reading_date: string;
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
  d.setDate(d.getDate() - d.getDay()); 
  return d.toISOString().split('T')[0];
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
  const navigate = useNavigate();
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
        .gte("reading_date", wkStart);
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
      
      // Enhanced ranking logic with streak and activity timestamp as tie-breakers
      stats.sort((a, b) => {
        if (b.chapters !== a.chapters) return b.chapters - a.chapters;
        if (b.streak !== a.streak) return b.streak - a.streak;
        return a.user_id.localeCompare(b.user_id);
      });
      
      const rankedStats = stats.map((s, idx) => {
        let rank = idx + 1;
        if (idx > 0) {
          const prev = stats[idx - 1];
          if (prev.chapters === s.chapters) {
            rank = (stats as any)[idx - 1].rank;
          }
        }
        (s as any).rank = rank;
        return s;
      });
      
      if (cancelled) return;
      setMembers(rankedStats);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [groupId, user]);

  useEffect(() => {
    if (!user || members.length === 0) return;
    let cancelled = false;
    (async () => {
      setLoadingActivities(true);
      const ids = members.map((m) => m.user_id);
      const { data: logs } = await supabase
        .from("reading_logs")
        .select("id, user_id, created_at, reading_date, chapters_count, notes, plan_id")
        .in("user_id", ids)
        .order("created_at", { ascending: false })
        .limit(50);

      const planIds = Array.from(
        new Set(((logs ?? []) as any[]).map((l) => l.plan_id).filter((x): x is string => !!x)),
      );
      const planMap = new Map<string, string>();
      if (planIds.length > 0) {
        const { data: plans } = await supabase
          .from("reading_plans")
          .select("id, title")
          .in("id", planIds);
        (plans ?? []).forEach((p) => planMap.set(p.id, p.title));
      }

      const feed: Activity[] = ((logs ?? []) as any[]).map((l) => ({
        id: l.id,
        user_id: l.user_id,
        created_at: l.created_at,
        reading_date: l.reading_date,
        chapters_count: l.chapters_count,
        notes: l.notes,
        plan_title: l.plan_id ? planMap.get(l.plan_id) ?? null : null,
      }));
      if (cancelled) return;
      setActivities(feed);
      setLoadingActivities(false);

      const logIds = feed.map((f) => f.id);
      if (logIds.length > 0) {
        const { data: rx } = await supabase
          .from("reactions")
          .select("log_id, type, user_id")
          .in("log_id", logIds);
        if (cancelled) return;
        const map = new Map<string, { fire: number; amen: number; myFire: boolean; myAmen: boolean }>();
        (rx ?? []).forEach((r: any) => {
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
    const tempId = `tmp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      user_id: user.id,
      message: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    const { data, error } = await supabase
      .from("group_messages")
      .insert({ group_id: groupId, user_id: user.id, message: text })
      .select("id, user_id, message, created_at")
      .maybeSingle();
    setSending(false);
    if (error) {
      toast.error(error.message);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setDraft(text);
      return;
    }
    if (data) {
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempId);
        if (withoutTemp.some((m) => m.id === (data as Message).id)) return withoutTemp;
        return [...withoutTemp, data as Message];
      });
    }
  };

  const toggleReaction = useCallback(async (logId: string, type: "fire" | "amen") => {
    if (!user) return;
    const cur = reactions.get(logId) ?? { fire: 0, amen: 0, myFire: false, myAmen: false };
    const mine = type === "fire" ? cur.myFire : cur.myAmen;
    const next = { ...cur };
    if (mine) {
      if (type === "fire") { next.myFire = false; next.fire = Math.max(0, cur.fire - 1); }
      else { next.myAmen = false; next.amen = Math.max(0, cur.amen - 1); }
    } else {
      if (type === "fire") { next.myFire = true; next.fire = cur.fire + 1; }
      else { next.myAmen = true; next.amen = cur.amen + 1; }
    }
    setReactions((prev) => new Map(prev).set(logId, next));
    
    try {
      if (mine) {
        const { error } = await supabase
          .from("reactions")
          .delete()
          .eq("log_id", logId)
          .eq("user_id", user.id)
          .eq("type", type);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("reactions")
          .insert({ log_id: logId, user_id: user.id, type });
        if (error) throw error;
      }
    } catch (error: any) {
      toast.error(error.message);
      setReactions((prev) => new Map(prev).set(logId, cur));
    }
  }, [user, reactions]);

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
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full border border-border/60 bg-card/60 text-foreground transition-colors hover:bg-accent"
          onClick={() => navigate({ to: "/groups" })}
          aria-label="Voltar para grupos"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {loading ? (
          <>
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
          </>
        ) : (
          <>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent/60 text-2xl" aria-hidden="true">
              {group?.avatar ?? "📖"}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-lg font-semibold">{group?.name ?? "..."}</h1>
              <p className="text-xs text-muted-foreground">
                {members.length} {members.length === 1 ? "membro" : "membros"}
              </p>
            </div>
          </>
        )}
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
          <TabsTrigger value="invite" className="rounded-xl gap-1.5 text-xs" aria-label="Gerar código de convite">
            <Copy className="h-3.5 w-3.5" /> Convite
          </TabsTrigger>
        </TabsList>

        {/* ATIVIDADES */}
        <TabsContent value="activities" className="mt-5">
          {loadingActivities ? (
            <div className="space-y-4 py-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="border-border/60 bg-card/70 p-4">
                  <div className="flex gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                </Card>
              ))}
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
                          <AvatarImage src={p?.avatar_url ?? undefined} alt={`Foto de ${name}`} />
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
                      {(() => {
                        const r = reactions.get(a.id) ?? { fire: 0, amen: 0, myFire: false, myAmen: false };
                        return (
                          <div className="mt-3 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleReaction(a.id, "fire")}
                              aria-label={r.myFire ? "Remover reação de fogo" : "Reagir com fogo"}
                              className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition ${
                                r.myFire
                                  ? "border-transparent bg-orange-500/20 text-orange-300"
                                  : "border-border/60 bg-background/40 text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <Flame className="h-3.5 w-3.5" />
                              {r.fire > 0 && <span>{r.fire}</span>}
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleReaction(a.id, "amen")}
                              aria-label={r.myAmen ? "Remover reação de amém" : "Reagir com amém"}
                              className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition ${
                                r.myAmen
                                  ? "border-transparent bg-primary/20 text-primary-glow"
                                  : "border-border/60 bg-background/40 text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <Heart className="h-3.5 w-3.5" />
                              {r.amen > 0 && <span>{r.amen}</span>}
                            </button>
                          </div>
                        );
                      })()}
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
                <div className="space-y-3 py-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-10 w-2/3 rounded-2xl" />
                    </div>
                  ))}
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
                          <AvatarImage src={p?.avatar_url ?? undefined} alt={`Avatar de ${name}`} />
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
                aria-label="Escreva sua mensagem"
              />
              <Button
                type="submit"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full gradient-primary text-primary-foreground"
                disabled={sending || !draft.trim()}
                aria-label="Enviar mensagem"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </Card>
        </TabsContent>

        {/* RANKING */}
        <TabsContent value="leaderboard" className="mt-5 space-y-2">
          <div className="mb-3">
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Ranking da semana
            </h3>
            <p className="text-[11px] text-muted-foreground/80">Zera todo domingo</p>
          </div>
          {loading ? (
            <div className="space-y-2 py-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <Card className="border-dashed border-border/70 bg-card/40 p-8 text-center text-sm text-muted-foreground">
              Ainda sem membros nesse grupo.
            </Card>
          ) : (
            members.map((m, i) => {
              const rank = (m as any).rank ?? (i + 1);
              const displayName = m.name ?? "Sem nome";
              const podiumStyles: Record<number, { bg: string; ring: string; icon: ReactNode }> = {
                1: {
                  bg: "bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-glow",
                  ring: "ring-1 ring-yellow-400/40",
                  icon: <Crown className="h-4 w-4" aria-hidden="true" />,
                },
                2: {
                  bg: "bg-gradient-to-br from-slate-300 to-slate-500 text-white",
                  ring: "ring-1 ring-slate-300/30",
                  icon: <Medal className="h-4 w-4" aria-hidden="true" />,
                },
                3: {
                  bg: "bg-gradient-to-br from-amber-700 to-orange-800 text-white",
                  ring: "ring-1 ring-amber-700/30",
                  icon: <Award className="h-4 w-4" aria-hidden="true" />,
                },
              };
              const style = podiumStyles[rank];
              const isTied = i > 0 && (members[i-1] as any).rank === rank;
              const chapterText = m.chapters === 0 
                ? "Nenhuma leitura nesta semana" 
                : `${m.chapters} ${m.chapters === 1 ? 'capítulo' : 'capítulos'}`;
              
              return (
                <Card
                  key={m.user_id}
                  className={`flex items-center gap-3 border-border/60 bg-card/70 p-3 backdrop-blur-sm ${
                    style?.ring ?? ""
                  }`}
                  aria-label={`${rank}º lugar, ${displayName}, ${isTied ? 'empate, ' : ''}${chapterText}`}
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                      style ? style.bg : "bg-accent/60 text-muted-foreground"
                    }`}
                    aria-hidden="true"
                  >
                    {style ? style.icon : rank}
                  </span>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={m.avatar_url ?? undefined} alt={`Avatar de ${displayName}`} />
                    <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{displayName}</p>
                      {isTied && <span className="text-[10px] text-muted-foreground">(Empate)</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {chapterText}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-background/60 px-2 py-1 text-xs font-medium">
                    <Flame className="h-3.5 w-3.5 text-[color:var(--flame)]" aria-hidden="true" />
                    {m.streak}
                  </div>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="invite" className="mt-5">
          <Card className="border-border/60 bg-card/70 p-5 backdrop-blur-sm">
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Código de convite
            </h3>
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
              aria-label="Copiar código de convite para área de transferência"
            >
              <Copy className="h-4 w-4" /> Copiar código
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
