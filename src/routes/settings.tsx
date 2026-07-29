import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Sun, Moon, LogOut, Link2, ChevronRight } from "lucide-react";
import { currentUser, activityLog } from "@/lib/mockData";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Ajustes — Bible Habit" },
      { name: "description", content: "Conta, integrações, atividade e tema do aplicativo." },
      { property: "og:title", content: "Ajustes — Bible Habit" },
      { property: "og:description", content: "Conta, integrações, atividade e tema do aplicativo." },
    ],
  }),
  component: SettingsPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="mb-2.5 px-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {title}
      </h2>
      <Card className="divide-y divide-border/60 border-border/60 bg-card/70 backdrop-blur-sm">
        {children}
      </Card>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-3 p-4">{children}</div>;
}

function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(user?.email ?? currentUser.email);
  const [youVersion, setYouVersion] = useState(currentUser.youVersionLink);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada");
    navigate({ to: "/auth" });
  };

  return (
    <AppShell title="Ajustes" subtitle="Conta, integrações e preferências">
      <Section title="Minha conta">
        <Row>
          <Avatar className="h-14 w-14 ring-2 ring-primary/30">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback className="gradient-primary text-primary-foreground">
              {(user?.email ?? currentUser.name)[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display font-semibold">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => toast.success("Foto atualizada (mock)")}>
            Trocar
          </Button>
        </Row>
        <div className="space-y-3 p-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-10 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">E-mail</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 rounded-xl" />
          </div>
          <Button
            className="h-11 w-full rounded-xl gradient-primary font-semibold text-primary-foreground shadow-glow hover:brightness-110"
            onClick={() => toast.success("Perfil salvo (mock)")}
          >
            Salvar alterações
          </Button>
          <Button
            variant="outline"
            className="h-11 w-full rounded-xl"
            onClick={() => toast.info("Fluxo de alteração de senha (mock)")}
          >
            Alterar senha
          </Button>
        </div>
      </Section>

      <Section title="Integrações">
        <Row>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/60">
            <Link2 className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Google</p>
            <p className="text-xs text-muted-foreground">Vincular conta para login OAuth</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => toast.success("Google vinculado (mock)")}>
            Vincular
          </Button>
        </Row>
        <div className="p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/60 text-lg">
              📖
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">YouVersion (Bíblia)</p>
              <p className="text-xs text-muted-foreground">Cole o link do seu perfil público</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="https://bible.com/users/..."
              value={youVersion}
              onChange={(e) => setYouVersion(e.target.value)}
              className="h-10 rounded-xl"
            />
            <Button
              className="h-10 rounded-xl"
              onClick={() => {
                if (!youVersion) return toast.error("Cole o link primeiro");
                toast.success("Perfil YouVersion vinculado");
              }}
            >
              Salvar
            </Button>
          </div>
          <a
            href="https://www.bible.com/"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Abrir YouVersion <ChevronRight className="h-3 w-3" />
          </a>
        </div>
      </Section>

      <Section title="Minha atividade">
        {activityLog.map((l) => (
          <div key={l.id} className="p-4">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">{l.chapters}</span>
              <span className="text-xs text-muted-foreground">{l.date}</span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{l.plan}</p>
          </div>
        ))}
      </Section>

      <Section title="Aparência">
        <Row>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/60">
            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">
              Tema {theme === "dark" ? "escuro" : "claro"}
            </p>
            <p className="text-xs text-muted-foreground">Alternar entre claro e escuro</p>
          </div>
          <Button size="sm" variant="outline" onClick={toggle}>
            Alternar
          </Button>
        </Row>
      </Section>

      <Separator className="my-4 bg-border/60" />
      <Button
        variant="outline"
        className="h-12 w-full gap-2 rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4" /> Sair
      </Button>
    </AppShell>
  );
}
