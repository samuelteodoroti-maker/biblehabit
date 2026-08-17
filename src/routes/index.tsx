import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Flame, BookOpenCheck, CalendarDays, Sparkles, Check, ChevronRight, Book, Bell, X } from "lucide-react";
import { ReadingCalendar } from "@/components/ReadingCalendar";
import { LogReadingModal } from "@/components/LogReadingModal";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useReadingData } from "@/hooks/useReadingData";
import { getUpdates } from "@/lib/updates.functions";
import { APP_VERSION } from "@/lib/app-utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Início — Bible Habit" },
      { name: "description", content: "Acompanhe sua ofensiva diária, registre capítulos lidos e visualize seu calendário de leitura bíblica no Bible Habit." },
      { property: "og:title", content: "Início — Bible Habit" },
      { property: "og:description", content: "Acompanhe sua ofensiva diária, registre capítulos lidos e visualize seu calendário de leitura bíblica no Bible Habit." },
      { property: "og:url", content: "https://biblehabit.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://biblehabit.lovable.app/" }],
  }),
  component: HomePage,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, activePlan, logDates, loading, today, refresh } = useReadingData();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today);
  const [latestUpdate, setLatestUpdate] = useState<any>(null);
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    const checkUpdates = async () => {
      try {
        const { updates } = await getUpdates({ data: { limit: 1 } });
        if (updates && updates.length > 0) {
          const update = updates[0];
          const lastSeen = localStorage.getItem("bh_last_update_seen");
          if (lastSeen !== update.version) {
            setLatestUpdate(update);
            setShowNotice(true);
          }
        }
      } catch (e) {
        console.error("Update check failed", e);
      }
    };
    checkUpdates();
  }, []);

  const dismissNotice = () => {
    if (latestUpdate) {
      localStorage.setItem("bh_last_update_seen", latestUpdate.version);
    }
    setShowNotice(false);
  };

  const registeredToday = logDates.has(today);
  const now = useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const displayName =
    profile?.name?.split(" ")[0] ??
    (user?.email ? user.email.split("@")[0] : "amigo");
  const streak = profile?.current_streak ?? 0;
  const total = profile?.total_chapters_read ?? 0;

  const openRegister = (date?: string) => {
    if (!user) {
      toast.info("Entre para registrar sua leitura");
      navigate({ to: "/auth" });
      return;
    }
    const targetDate = date || today;
    
    // Prevent future dates
    if (new Date(targetDate + "T12:00:00") > new Date()) {
      toast.error("Não é possível registrar leituras em datas futuras.");
      return;
    }

    setSelectedDate(targetDate);
    setModalOpen(true);
  };

  return (
    <AppShell>
      {/* Update Notice */}
      {showNotice && latestUpdate && (
        <Card className="mb-6 relative overflow-hidden border-primary/30 bg-primary/5 p-4 backdrop-blur-sm ring-1 ring-primary/20 animate-in fade-in slide-in-from-top-4 duration-500">
          <button 
            onClick={dismissNotice}
            className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-primary/10 hover:text-foreground"
            aria-label="Fechar aviso"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="flex items-start gap-3 pr-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary">Novidade v{latestUpdate.version}</h3>
                <Badge variant="secondary" className="h-4 bg-primary/20 text-[8px] font-bold text-primary">Novo</Badge>
              </div>
              <p className="mt-1 font-display text-base font-bold leading-tight">
                {latestUpdate.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {latestUpdate.summary}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Link 
                  to="/updates/$slug" 
                  params={{ slug: latestUpdate.slug }}
                  onClick={dismissNotice}
                >
                  <Button size="sm" className="h-8 rounded-lg gradient-primary px-4 text-[10px] font-bold">
                    Ver novidades
                  </Button>
                </Link>
                <button 
                  onClick={dismissNotice}
                  className="text-[10px] font-bold text-muted-foreground hover:text-foreground"
                >
                  Agora não
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Greeting */}
      <div className="mb-6">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-64" />
          </div>
        ) : (
          <>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
              {greeting()}, {displayName} 👋
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
              Seu hábito bíblico — Bible Habit
            </h1>
          </>
        )}
      </div>

      {/* Streak hero */}
      {loading ? (
        <Card className="mb-4 border-border/60 bg-card/70 p-6 shadow-card backdrop-blur-sm">
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-16 w-32 mb-4" />
          <Skeleton className="h-4 w-full" />
        </Card>
      ) : (
        <Card className="relative mb-4 overflow-hidden border-border/60 bg-card/70 p-6 shadow-card backdrop-blur-sm">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full gradient-primary opacity-25 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Flame className="h-4 w-4 text-[color:var(--flame)]" />
              Ofensiva atual
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-6xl font-bold leading-none gradient-text">
                {streak}
              </span>
              <span className="text-lg font-medium text-muted-foreground">
                {streak === 1 ? "dia" : "dias"}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {registeredToday
                ? "Você já leu hoje. Continue firme amanhã."
                : streak === 0
                  ? "Comece hoje sua primeira leitura para acender a chama."
                  : "Registre a leitura de hoje para manter a chama acesa."}
            </p>
          </div>
        </Card>
      )}

      {/* Reading Suggestion */}
      {!loading && activePlan && !registeredToday && (
        <Card className="mb-6 border-primary/20 bg-primary/5 p-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary/80">Sugestão de leitura</h3>
              <p className="mt-1 font-display text-lg font-bold leading-tight">
                {activePlan.books_today || `Continuar ${activePlan.title}`}
              </p>
              <button 
                onClick={() => openRegister(today)}
                className="mt-2 flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
              >
                Registrar agora <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Secondary stats */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        {loading ? (
          <>
            <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-sm">
              <Skeleton className="h-3 w-20 mb-3" />
              <Skeleton className="h-8 w-12" />
            </Card>
            <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-sm">
              <Skeleton className="h-3 w-16 mb-3" />
              <Skeleton className="h-8 w-full" />
            </Card>
          </>
        ) : (
          <>
            <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                Capítulos
              </div>
              <p className="mt-2 font-display text-2xl font-bold">{total}</p>
            </Card>
            <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <Book className="h-3.5 w-3.5" />
                Plano ativo
              </div>
              <p className="mt-2 truncate font-display text-[13px] font-semibold">
                {activePlan?.title ?? "Nenhum plano"}
              </p>
            </Card>
          </>
        )}
      </div>


      {/* CTA */}
      {loading ? (
        <Skeleton className="mb-8 h-14 w-full rounded-2xl" />
      ) : (
        <Button
          size="lg"
          className={`mb-8 h-14 w-full gap-2 rounded-2xl text-base font-semibold transition-all ${
            registeredToday
              ? "bg-success/15 text-success hover:bg-success/20"
              : "gradient-primary text-primary-foreground shadow-glow hover:brightness-110"
          }`}
          disabled={loading}
          onClick={() => openRegister(today)}
        >
          {registeredToday ? (
            <Check className="h-5 w-5" />
          ) : (
            <BookOpenCheck className="h-5 w-5" />
          )}
          {registeredToday
            ? "Leitura de hoje concluída"
            : user
              ? "Registrar leitura de hoje"
              : "Entrar para registrar"}
        </Button>
      )}

      {loading ? (
        <Card className="border-border/60 bg-card/60 p-6 backdrop-blur-sm">
          <Skeleton className="h-[200px] w-full" />
        </Card>
      ) : (
        <ReadingCalendar
          year={currentYear}
          month={currentMonth}
          today={today}
          readDates={logDates}
          onDateClick={openRegister}
        />
      )}

      {user && (
        <LogReadingModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          userId={user.id}
          today={selectedDate}
          onSaved={refresh}
        />
      )}
    </AppShell>
  );
}
