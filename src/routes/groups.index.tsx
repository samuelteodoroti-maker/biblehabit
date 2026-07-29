import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, ChevronRight, Users, Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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

type Group = {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  member_count: number;
};

function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const loadGroups = async () => {
    if (!user) return;
    setLoading(true);
    const { data: memberships } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id);
    const ids = (memberships ?? []).map((m) => m.group_id);
    if (ids.length === 0) {
      setGroups([]);
      setLoading(false);
      return;
    }
    const { data: gs } = await supabase
      .from("groups")
      .select("id, name, description, avatar")
      .in("id", ids);
    const { data: counts } = await supabase
      .from("group_members")
      .select("group_id")
      .in("group_id", ids);
    const countMap = new Map<string, number>();
    (counts ?? []).forEach((c) => {
      countMap.set(c.group_id, (countMap.get(c.group_id) ?? 0) + 1);
    });
    setGroups(
      (gs ?? []).map((g) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        avatar: g.avatar,
        member_count: countMap.get(g.id) ?? 0,
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCreate = async () => {
    if (!user || !newName.trim()) return;
    setBusy(true);
    const { data: g, error } = await supabase
      .from("groups")
      .insert({ name: newName.trim(), description: newDesc.trim() || null, created_by: user.id })
      .select("id")
      .maybeSingle();
    if (error || !g) {
      setBusy(false);
      toast.error(error?.message ?? "Erro ao criar grupo");
      return;
    }
    await supabase.from("group_members").insert({ group_id: g.id, user_id: user.id });
    setBusy(false);
    setCreateOpen(false);
    setNewName("");
    setNewDesc("");
    toast.success("Grupo criado!");
    loadGroups();
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    setBusy(true);
    const { error } = await supabase.rpc("join_group_by_code", { _code: inviteCode.trim() });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setJoinOpen(false);
    setInviteCode("");
    toast.success("Você entrou no grupo!");
    loadGroups();
  };

  return (
    <AppShell title="Grupos" subtitle="Leia junto e compare o progresso">
      <div className="mb-6 grid grid-cols-2 gap-3">
        <Button
          className="h-12 gap-2 rounded-2xl gradient-primary font-semibold text-primary-foreground shadow-glow hover:brightness-110"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-4 w-4" /> Criar grupo
        </Button>
        <Button
          variant="outline"
          className="h-12 gap-2 rounded-2xl"
          onClick={() => setJoinOpen(true)}
        >
          <LogIn className="h-4 w-4" /> Entrar com código
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : groups.length === 0 ? (
        <Card className="border-dashed border-border/70 bg-card/40 p-8 text-center">
          <Users className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-display text-base font-semibold">Sem grupos ainda</p>
          <p className="mt-1 text-sm text-muted-foreground">Crie um grupo ou entre com um código de convite.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => (
            <Link key={g.id} to="/groups/$groupId" params={{ groupId: g.id }}>
              <Card className="group flex items-center gap-3 border-border/60 bg-card/70 p-4 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent/60 text-2xl">
                  {g.avatar ?? "📖"}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display font-semibold">{g.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {g.member_count} {g.member_count === 1 ? "membro" : "membros"}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo grupo</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Nome</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex.: Célula Jovens" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Descrição (opcional)</Label>
              <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Sobre o grupo" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={busy || !newName.trim()}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entrar em um grupo</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label className="text-xs">Código de convite</Label>
            <Input value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="Ex.: a1b2c3d4" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJoinOpen(false)}>Cancelar</Button>
            <Button onClick={handleJoin} disabled={busy || !inviteCode.trim()}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
