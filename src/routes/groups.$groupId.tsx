import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, Flame, Crown } from "lucide-react";
import { groups, groupLeaderboard, groupMessages, currentUser } from "@/lib/mockData";

export const Route = createFileRoute("/groups/$groupId")({
  head: () => ({
    meta: [
      { title: "Grupo — Bible Habit" },
      { name: "description", content: "Ranking e chat do grupo em tempo real." },
      { property: "og:title", content: "Grupo — Bible Habit" },
      { property: "og:description", content: "Ranking e chat do grupo em tempo real." },
    ],
  }),
  notFoundComponent: () => (
    <AppShell title="Grupo não encontrado">
      <p className="text-sm text-muted-foreground">Este grupo não existe ou foi removido.</p>
      <Link to="/groups" className="mt-4 inline-block text-sm text-primary hover:underline">
        Voltar para grupos
      </Link>
    </AppShell>
  ),
  component: GroupDetail,
});

function GroupDetail() {
  const { groupId } = Route.useParams();
  const group = groups.find((g) => g.id === groupId);
  const [messages, setMessages] = useState(groupMessages);
  const [draft, setDraft] = useState("");

  if (!group) {
    return (
      <AppShell title="Grupo não encontrado">
        <p className="text-sm text-muted-foreground">Este grupo não existe ou foi removido.</p>
        <Link to="/groups" className="mt-4 inline-block text-sm text-primary hover:underline">
          Voltar para grupos
        </Link>
      </AppShell>
    );
  }

  const send = () => {
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: "m" + Date.now(),
        userId: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        text: draft,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setDraft("");
  };

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
          {group.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-semibold">{group.name}</h1>
          <p className="text-xs text-muted-foreground">
            {group.members} {group.members === 1 ? "membro" : "membros"}
          </p>
        </div>
      </div>

      <Tabs defaultValue="leaderboard">
        <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-card/60 p-1 backdrop-blur-sm">
          <TabsTrigger value="leaderboard" className="rounded-xl">Ranking</TabsTrigger>
          <TabsTrigger value="chat" className="rounded-xl">Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="mt-5 space-y-2">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Progresso desta semana
          </p>
          {groupLeaderboard.map((m, i) => {
            const rank = i + 1;
            const podium = rank <= 3;
            return (
              <Card
                key={m.id}
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
                  <AvatarImage src={m.avatar} />
                  <AvatarFallback>{m.name[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{m.name}</p>
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
          })}
        </TabsContent>

        <TabsContent value="chat" className="mt-5">
          <Card className="mb-3 space-y-3 border-border/60 bg-card/60 p-4 backdrop-blur-sm">
            {messages.map((m) => {
              const mine = m.userId === currentUser.id;
              return (
                <div key={m.id} className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={m.avatar} />
                    <AvatarFallback>{m.name[0]}</AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                      mine
                        ? "gradient-primary text-primary-foreground shadow-glow"
                        : "bg-background/70 text-foreground"
                    }`}
                  >
                    {!mine && (
                      <p className="mb-0.5 text-[11px] font-semibold opacity-70">{m.name}</p>
                    )}
                    <p className="leading-snug">{m.text}</p>
                    <p
                      className={`mt-1 text-[10px] ${
                        mine ? "opacity-80" : "text-muted-foreground"
                      }`}
                    >
                      {m.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </Card>
          <div className="flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Escreva uma mensagem..."
              className="h-11 rounded-xl border-border/70 bg-card/60"
            />
            <Button
              onClick={send}
              size="icon"
              className="h-11 w-11 rounded-xl gradient-primary text-primary-foreground shadow-glow hover:brightness-110"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
