import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, Flame } from "lucide-react";
import { groups, groupLeaderboard, groupMessages, currentUser } from "@/lib/mockData";

export const Route = createFileRoute("/groups/$groupId")({
  head: () => ({
    meta: [
      { title: "Grupo — Bible Tracker" },
      { name: "description", content: "Ranking e chat do grupo em tempo real." },
      { property: "og:title", content: "Grupo — Bible Tracker" },
      { property: "og:description", content: "Ranking e chat do grupo em tempo real." },
    ],
  }),
  component: GroupDetail,
});

function GroupDetail() {
  const { groupId } = Route.useParams();
  const group = groups.find((g) => g.id === groupId) ?? groups[0];
  const [messages, setMessages] = useState(groupMessages);
  const [draft, setDraft] = useState("");

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
      <div className="mb-4 flex items-center gap-3">
        <Link to="/groups" className="rounded-md p-1.5 hover:bg-accent">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xl">
          {group.avatar}
        </div>
        <div>
          <h1 className="font-semibold">{group.name}</h1>
          <p className="text-xs text-muted-foreground">{group.members} membros</p>
        </div>
      </div>

      <Tabs defaultValue="leaderboard">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="mt-4 space-y-2">
          <p className="mb-2 text-xs text-muted-foreground">Progresso desta semana</p>
          {groupLeaderboard.map((m, i) => (
            <Card key={m.id} className="flex items-center gap-3 p-3">
              <span className="w-6 text-center text-sm font-bold text-muted-foreground">#{i + 1}</span>
              <Avatar className="h-9 w-9">
                <AvatarImage src={m.avatar} />
                <AvatarFallback>{m.name[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.chapters} capítulos</p>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                {m.streak}
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="chat" className="mt-4">
          <div className="mb-3 space-y-3 rounded-lg border border-border bg-card p-3">
            {messages.map((m) => {
              const mine = m.userId === currentUser.id;
              return (
                <div key={m.id} className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={m.avatar} />
                    <AvatarFallback>{m.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    mine ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    {!mine && <p className="mb-0.5 text-[11px] font-semibold opacity-70">{m.name}</p>}
                    <p>{m.text}</p>
                    <p className={`mt-0.5 text-[10px] ${mine ? "opacity-70" : "text-muted-foreground"}`}>{m.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Escreva uma mensagem..."
            />
            <Button onClick={send} size="icon"><Send className="h-4 w-4" /></Button>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
