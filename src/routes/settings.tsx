import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Sun, Moon, LogOut, ChevronRight, Loader2, Bell, HelpCircle, HandHeart } from "lucide-react";
import { useReleaseNotes } from "@/hooks/useReleaseNotes";
import { APP_VERSION_LABEL } from "@/data/releaseNotes";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useReadingData } from "@/hooks/useReadingData";
import { Skeleton } from "@/components/ui/skeleton";


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
      <h2 className="mb-2.5 px-1 text-[11px] font-semibold tracking-[0.15em] text-muted-foreground">
        {title.charAt(0).toUpperCase() + title.slice(1).toLowerCase()}
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

type ActivityLog = { id: string; reading_date: string; chapters_count: number; notes: string | null };

function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const { profile, recentLogs, loading, refresh } = useReadingData();
  const [youVersion, setYouVersion] = useState("");
  const [saving, setSaving] = useState(false);

  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("20:00");
  const email = user?.email ?? "";

  useEffect(() => {
    try {
      const en = localStorage.getItem("bh_reminder_enabled") === "1";
      const t = localStorage.getItem("bh_reminder_time") || "20:00";
      setReminderEnabled(en);
      setReminderTime(t);
    } catch {}
  }, []);

  const toggleReminder = async (checked: boolean) => {
    if (checked) {
      if (!("Notification" in window)) {
        toast.error("Este navegador não suporta notificações");
        return;
      }
      let perm = Notification.permission;
      if (perm === "default") perm = await Notification.requestPermission();
      if (perm !== "granted") {
        toast.error("Permissão de notificação negada");
        return;
      }
      localStorage.setItem("bh_reminder_enabled", "1");
      localStorage.setItem("bh_reminder_time", reminderTime);
      setReminderEnabled(true);
      toast.success("Lembretes ativados");
    } else {
      localStorage.setItem("bh_reminder_enabled", "0");
      setReminderEnabled(false);
      toast.success("Lembretes desativados");
    }
  };

  const updateReminderTime = (v: string) => {
    setReminderTime(v);
    localStorage.setItem("bh_reminder_time", v);
  };

  useEffect(() => {
    if (profile?.youversion_link) {
      setYouVersion(profile.youversion_link);
    }
  }, [profile]);


  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ youversion_link: youVersion.trim() || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Perfil salvo");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Clear local cache/storage
    localStorage.removeItem("bh_last_update_seen");
    toast.success("Sessão encerrada");
    navigate({ to: "/auth" });
  };

  const logs = recentLogs;
  const { hasUnseen: hasUnseenRelease } = useReleaseNotes();
  const metaName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    "";
  const metaAvatar = (user?.user_metadata?.avatar_url as string | undefined) ?? null;
  const effectiveAvatar = profile?.avatar_url || metaAvatar;
  const displayName = profile?.name || metaName || email.split("@")[0] || "Você";
  const initial = (displayName || email || "?")[0]?.toUpperCase();

  if (loading) return (
    <AppShell title="Ajustes" subtitle="Conta, integrações e preferências">
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    </AppShell>
  );


  return (
    <AppShell title="Ajustes" subtitle="Conta, integrações e preferências">
      <Section title="Minha conta">
        <div className="p-4 flex items-center gap-4">
          <Avatar className="h-16 w-16 ring-2 ring-primary/30">
            {effectiveAvatar && <AvatarImage src={effectiveAvatar} alt={`Foto de perfil de ${displayName}`} />}
            <AvatarFallback className="gradient-primary text-primary-foreground text-xl">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display font-semibold text-lg">{displayName}</p>
            <p className="truncate text-sm text-muted-foreground">{email}</p>
          </div>
          <Link to="/profile/edit">
            <Button variant="outline" size="sm" className="rounded-xl gap-2">
              <ChevronRight className="h-4 w-4" /> Editar
            </Button>
          </Link>
        </div>
      </Section>


      <Section title="Integrações">
        <div className="p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/60 text-lg" aria-hidden="true">
              📖
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">YouVersion (Bíblia)</p>
              <p className="text-xs text-muted-foreground">Cole o link do seu perfil público</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              id="youversion-link"
              placeholder="https://bible.com/users/..."
              value={youVersion}
              onChange={(e) => setYouVersion(e.target.value)}
              className="h-10 rounded-xl"
              aria-label="Link do perfil YouVersion"
            />
            <Button className="h-10 rounded-xl" onClick={handleSave} disabled={saving}>
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
        {logs.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Nenhuma atividade recente. Registre sua primeira leitura para começar!
          </div>
        ) : (
          logs.map((l) => (
            <div key={l.id} className="p-4">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">
                  {l.notes ?? `${l.chapters_count} ${l.chapters_count === 1 ? "capítulo" : "capítulos"}`}
                </span>
                <span className="text-xs text-muted-foreground">{l.reading_date}</span>
              </div>
            </div>
          ))
        )}
      </Section>

      <Section title="Preferências">
        <div className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/60">
              <Bell className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <Label htmlFor="reminders-toggle" className="text-sm font-semibold cursor-pointer block truncate">
                Lembretes diários
              </Label>
              <p id="reminders-description" className="text-xs text-muted-foreground truncate">
                Avisamos se você ainda não leu hoje
              </p>
            </div>
          </div>
          <Switch 
            id="reminders-toggle" 
            checked={reminderEnabled} 
            onCheckedChange={toggleReminder} 
            aria-checked={reminderEnabled}
            aria-describedby="reminders-description"
          />
        </div>
        {reminderEnabled && (
          <Row>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/60 text-xs font-semibold" aria-hidden="true">
              🕗
            </div>
            <div className="flex-1">
              <Label htmlFor="reminder-time" className="text-sm font-semibold">Hora do lembrete</Label>
              <p className="text-xs text-muted-foreground">Escolha quando ser avisado</p>
            </div>
            <Input
              id="reminder-time"
              type="time"
              value={reminderTime}
              onChange={(e) => updateReminderTime(e.target.value)}
              className="h-10 w-28 rounded-xl"
              aria-label="Hora do lembrete diário"
            />
          </Row>
        )}
      </Section>

      <Section title="Informações">
        <Link to="/novidades" className="flex items-center justify-between p-4 transition-colors hover:bg-accent/50">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/60">
              <Bell className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="flex items-center gap-2 text-sm font-semibold">
                Novidades e atualizações
                {hasUnseenRelease && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                    Novo
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">O que mudou em cada versão</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Link to="/support" className="flex items-center justify-between p-4 transition-colors hover:bg-accent/50">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/60">
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Suporte</p>
              <p className="text-xs text-muted-foreground">Precisa de ajuda com o app?</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Link to="/apoie" className="flex items-center justify-between p-4 transition-colors hover:bg-accent/50">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/60">
              <HandHeart className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Apoie este app</p>
              <p className="text-xs text-muted-foreground">Contribuição voluntária via Pix</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </Section>


      <Section title="Aparência">
        <Row>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/60" aria-hidden="true">
            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">
              Tema {theme === "dark" ? "escuro" : "claro"}
            </p>
            <p className="text-xs text-muted-foreground">Alternar entre claro e escuro</p>
          </div>
          <Button size="sm" variant="outline" onClick={toggle} aria-label={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}>
            Alternar
          </Button>
        </Row>
      </Section>

      <Separator className="my-4 bg-border/60" />
      <Button
        variant="outline"
        className="h-12 w-full gap-2 rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={handleSignOut}
        aria-label="Encerrar sessão"
      >
        <LogOut className="h-4 w-4" /> Sair
      </Button>
    </AppShell>
  );
}
