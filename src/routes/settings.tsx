import { createFileRoute } from "@tanstack/react-router";
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
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <Card className="divide-y divide-border">{children}</Card>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-3 p-4">{children}</div>;
}

function SettingsPage() {
  const { theme, toggle } = useTheme();
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [youVersion, setYouVersion] = useState(currentUser.youVersionLink);

  return (
    <AppShell title="Ajustes">
      <Section title="Minha conta">
        <Row>
          <Avatar className="h-14 w-14">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => toast.success("Foto atualizada (mock)")}>
            Trocar foto
          </Button>
        </Row>
        <div className="space-y-3 p-4">
          <div>
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button variant="secondary" className="w-full" onClick={() => toast.success("Perfil salvo (mock)")}>
            Salvar alterações
          </Button>
          <Button variant="outline" className="w-full" onClick={() => toast.info("Fluxo de alteração de senha (mock)")}>
            Alterar senha
          </Button>
        </div>
      </Section>

      <Section title="Integrações">
        <Row>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <Link2 className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Google</p>
            <p className="text-xs text-muted-foreground">Vincular conta para login OAuth</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => toast.success("Google vinculado (mock)")}>
            Vincular
          </Button>
        </Row>
        <div className="p-4">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-lg">📖</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">YouVersion (Bíblia)</p>
              <p className="text-xs text-muted-foreground">Cole o link do seu perfil público</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="https://bible.com/users/..."
              value={youVersion}
              onChange={(e) => setYouVersion(e.target.value)}
            />
            <Button
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
            className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Abrir YouVersion <ChevronRight className="h-3 w-3" />
          </a>
        </div>
      </Section>

      <Section title="Minha atividade">
        {activityLog.map((l, i) => (
          <div key={l.id} className={`p-4 ${i > 0 ? "" : ""}`}>
            <div className="flex justify-between text-sm">
              <span className="font-medium">{l.chapters}</span>
              <span className="text-xs text-muted-foreground">{l.date}</span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{l.plan}</p>
          </div>
        ))}
      </Section>

      <Section title="Aparência">
        <Row>
          {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          <div className="flex-1">
            <p className="text-sm font-medium">Tema {theme === "dark" ? "escuro" : "claro"}</p>
            <p className="text-xs text-muted-foreground">Alternar entre claro e escuro</p>
          </div>
          <Button size="sm" variant="outline" onClick={toggle}>
            Alternar
          </Button>
        </Row>
      </Section>

      <Separator className="my-4" />
      <Button
        variant="destructive"
        className="w-full gap-2"
        onClick={() => toast.info("Logout (mock)")}
      >
        <LogOut className="h-4 w-4" /> Sair
      </Button>
    </AppShell>
  );
}
