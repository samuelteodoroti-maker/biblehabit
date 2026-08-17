import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Flame, 
  BookOpenCheck, 
  CalendarDays, 
  Sparkles, 
  Check, 
  ChevronRight, 
  Book, 
  Bell, 
  X, 
  Bookmark,
  ArrowRight,
  TrendingUp
} from "lucide-react";


import { ReadingCalendar } from "@/components/ReadingCalendar";
import { LogReadingModal } from "@/components/LogReadingModal";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useReadingData } from "@/hooks/useReadingData";
import { getUpdates } from "@/lib/updates.functions";
import { APP_VERSION } from "@/lib/app-utils";
import { BibleCard, BibleReference } from "@/components/BibleUI";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bible Habit — Sua jornada diária na Palavra" },
      { name: "description", content: "Bible Habit é o seu companheiro para criar e manter o hábito da leitura bíblica diária." },
      { property: "og:title", content: "Bible Habit — Sua jornada diária na Palavra" },
      { property: "og:description", content: "Crie constância na Palavra com planos personalizados, grupos e conquistas." },
      { property: "og:type", content: "website" },
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
  const { user, isAdmin } = useAuth();
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
      {/* Update Notice Banner */}
      {showNotice && latestUpdate && (
        <div className="mb-8 overflow-hidden rounded-[1.5rem] border border-primary/20 bg-primary/5 p-4 md:p-5 backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Novidade v{latestUpdate.version}</span>
                    <Badge variant="secondary" className="h-4 bg-primary/20 text-[8px] font-bold text-primary px-1.5">Recente</Badge>
                  </div>
                  <h3 className="font-serif-title text-base font-bold text-foreground line-clamp-1">{latestUpdate.title}</h3>
                </div>
              </div>
              <button 
                onClick={dismissNotice}
                className="rounded-full p-1 text-muted-foreground hover:bg-primary/10 hover:text-foreground transition-colors"
                aria-label="Fechar aviso"
              >
                <X className="h-4 w-4" />
              </button>
           </div>
           <div className="mt-3 flex items-center justify-between pl-[3.25rem]">
              <p className="hidden text-xs text-muted-foreground md:line-clamp-1 flex-1 mr-4">{latestUpdate.summary}</p>
              <Link to="/updates/$slug" params={{ slug: latestUpdate.slug }} onClick={dismissNotice}>
                <Button size="sm" variant="ghost" className="h-8 rounded-lg text-xs font-bold text-primary hover:bg-primary/10">
                  Saber mais <ArrowRight className="ml-1.5 h-3 w-3" />
                </Button>
              </Link>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Main Progress & Action */}
        <div className="space-y-6 lg:col-span-7 xl:col-span-8">
          
          {/* Greeting Header */}
          <div className="flex items-baseline justify-between">
            <div>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-8 w-64" />
                </div>
              ) : (
                <>
                  <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    {greeting()}, {displayName}
                  </p>
                  <h1 className="mt-1 font-serif-title text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                    Sua jornada diária
                  </h1>
                </>
              )}
            </div>
          </div>

          {/* Main Streak Card */}
          <BibleCard 
            variant="editorial"
            icon={Flame}
            title="Constância na Palavra"
            subtitle="Ofensiva Diária"
            action={
              <Badge variant="secondary" className="bg-biblical-gold/10 text-biblical-gold font-bold text-[10px] tracking-wider px-2 border-biblical-gold/20">
                Recorde: {profile?.longest_streak ?? 0}
              </Badge>
            }
          >
            <div className="flex flex-col items-center py-4 md:flex-row md:justify-around md:py-6 gap-6">
              <div className="text-center md:text-left">
                <div className="flex items-baseline justify-center gap-2 md:justify-start">
                  <span className="font-display text-7xl font-bold leading-none tracking-tighter text-foreground md:text-8xl">
                    {streak}
                  </span>
                  <span className="font-serif-title text-xl font-bold italic text-muted-foreground">
                    {streak === 1 ? "dia" : "dias"}
                  </span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground max-w-[280px]">
                  {registeredToday
                    ? "Você já alimentou seu espírito hoje. Continue firme na caminhada!"
                    : streak === 0
                      ? "Acenda sua chama hoje com a primeira leitura do dia."
                      : "Mantenha sua jornada ativa com a leitura de hoje."}
                </p>
              </div>

              <div className="mt-8 flex w-full flex-col gap-3 md:mt-0 md:w-auto">
                <Button
                  size="lg"
                  className={`h-14 md:h-16 w-full gap-3 rounded-2xl text-base font-bold transition-all px-6 md:px-8 md:w-auto ${
                    registeredToday
                      ? "bg-success/15 text-success hover:bg-success/20 border border-success/20"
                      : "gradient-primary text-primary-foreground shadow-glow hover:brightness-110"
                  }`}
                  disabled={loading}
                  onClick={() => openRegister(today)}
                >
                  {registeredToday ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <BookOpenCheck className="h-6 w-6" />
                  )}
                  {registeredToday
                    ? "Leitura Concluída"
                    : "Começar Leitura"}
                </Button>
                {!registeredToday && (
                  <p className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground md:text-left">
                    {streak > 0 ? "Faltam poucas horas para o fim do dia" : "Uma jornada de mil milhas começa agora"}
                  </p>
                )}
              </div>
            </div>
          </BibleCard>

          {/* Reading Suggestion (Editorial Style) */}
          {!loading && activePlan && !registeredToday && (
            <BibleCard variant="gold" className="relative overflow-hidden">
               <div className="absolute top-0 right-0 p-3 opacity-10">
                 <Sparkles className="h-20 w-20 text-biblical-gold" />
               </div>
               <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-biblical-gold/15 text-biblical-gold">
                    <Book className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif-title text-sm font-bold uppercase tracking-widest text-biblical-gold">Leitura para hoje</h3>
                    <div className="mt-1 flex flex-wrap items-baseline gap-2">
                       <BibleReference book={activePlan.books_today?.split(' ')[0] || activePlan.title} reference={activePlan.books_today?.split(' ').slice(1).join(' ') || ""} />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground/80 line-clamp-1">Parte da sua jornada atual: <span className="font-semibold text-foreground">{activePlan.title}</span></p>
                    <div className="mt-4 flex items-center justify-between">
                       <div className="h-1.5 w-32 rounded-full bg-biblical-gold/10 overflow-hidden">
                          <div className="h-full bg-biblical-gold transition-all duration-1000" style={{ width: `${(activePlan.completed_days / activePlan.total_days) * 100}%` }} />
                       </div>
                       <Button variant="ghost" size="sm" onClick={() => openRegister(today)} className="h-8 text-xs font-bold text-biblical-gold hover:bg-biblical-gold/10 px-0">
                          Continuar Jornada <ChevronRight className="h-4 w-4 ml-1" />
                       </Button>
                    </div>
                  </div>
               </div>
            </BibleCard>
          )}

          {/* Large Calendar (Tablet/Desktop priority) */}
          <div className="hidden lg:block">
            <BibleCard title="Diário de Leitura" icon={CalendarDays} subtitle="Histórico Mensal">
              <ReadingCalendar
                year={currentYear}
                month={currentMonth}
                today={today}
                readDates={logDates}
                onDateClick={openRegister}
              />
            </BibleCard>
          </div>
        </div>

        {/* Right Column: Stats & Secondary Calendar */}
        <div className="space-y-6 lg:col-span-5 xl:col-span-4">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
            <BibleCard title="Capítulos" icon={BookOpenCheck} className="px-4 py-4 md:px-5 md:py-5 min-h-[140px]">
               <div className="flex items-baseline gap-1">
                 <span className="font-display text-3xl font-bold">{total}</span>
                 <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total</span>
               </div>
            </BibleCard>
            <BibleCard title="Progresso" icon={TrendingUp} className="px-4 py-4 md:px-5 md:py-5 min-h-[140px]">
               <div className="flex items-baseline gap-1">
                 <span className="font-display text-3xl font-bold">{logDates.size}</span>
                 <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Dias</span>
               </div>
            </BibleCard>
          </div>

          {/* Active Journey Card */}
          <BibleCard title="Jornada Atual" icon={Bookmark} variant="editorial">
             {activePlan ? (
               <div className="space-y-4">
                  <div>
                    <h4 className="font-serif-title text-base font-bold leading-tight">{activePlan.title}</h4>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{activePlan.description || "Sem descrição"}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                      <span>Progresso da Jornada</span>
                      <span>{Math.round((activePlan.completed_days / activePlan.total_days) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-primary-soft">
                      <div className="h-full gradient-primary transition-all duration-1000" style={{ width: `${(activePlan.completed_days / activePlan.total_days) * 100}%` }} />
                    </div>
                    <p className="text-[10px] font-medium text-muted-foreground italic">
                      {activePlan.completed_days} de {activePlan.total_days} dias concluídos
                    </p>
                  </div>
                  <Link to="/progress">
                    <Button variant="outline" size="sm" className="w-full h-9 rounded-xl border-border/60 text-xs font-semibold">
                      Ver detalhes do plano
                    </Button>
                  </Link>
               </div>
             ) : (
               <div className="py-2 text-center">
                 <p className="text-sm text-muted-foreground mb-4 italic">Você ainda não iniciou uma jornada de leitura personalizada.</p>
                 <Link to="/progress">
                   <Button variant="secondary" className="h-9 w-full rounded-xl text-xs font-semibold">
                     Criar Novo Plano
                   </Button>
                 </Link>
               </div>
             )}
          </BibleCard>

          {/* Mobile Calendar (Hidden on desktop as it has a larger one) */}
          <div className="lg:hidden">
            <BibleCard title="Diário de Leitura" icon={CalendarDays} subtitle="Histórico Mensal">
              <ReadingCalendar
                year={currentYear}
                month={currentMonth}
                today={today}
                readDates={logDates}
                onDateClick={openRegister}
              />
            </BibleCard>
          </div>

          {/* Version / Admin link */}
          {isAdmin && (
            <div className="flex justify-center pt-2">
              <Link to="/admin/updates">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-primary transition-colors cursor-pointer">
                  Bible Habit Admin v{APP_VERSION}
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>

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
