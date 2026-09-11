import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TrendingUp, BookOpen, Library, CalendarCheck, Flame, ChevronRight, CheckCircle2 } from "lucide-react";
import { useReadingData } from "@/hooks/useReadingData";
import { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
} from "recharts";
import { formatLogPassages } from "@/lib/reading-format";
import { BIBLE_CANON } from "@/lib/bible-canon";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/statistics")({
  head: () => ({
    meta: [
      { title: "Estatísticas — Bible Habit" },
      { name: "description", content: "Acompanhe seu progresso de leitura bíblica, ofensiva e distribuição por livros no Bible Habit." },
    ],
  }),
  component: StatisticsPage,
});

function StatisticsPage() {
  const { profile, recentLogs, coverage, loading, stats } = useReadingData();

  const chartData = useMemo(() => {
    if (!recentLogs.length) return [];
    
    // Group by month for the last 6 months
    const groups: Record<string, number> = {};
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    
    const last6Months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      groups[key] = 0;
      last6Months.push(key);
    }

    recentLogs.forEach(log => {
      const d = new Date(log.reading_date + 'T12:00:00');
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      if (groups[key] !== undefined) {
        groups[key] += log.chapters_count;
      }
    });

    return last6Months.map(month => ({
      month,
      chapters: groups[month]
    }));
  }, [recentLogs]);

  const divisionStats = useMemo(() => {
    if (!coverage) return [];
    
    const divisions = [
      { label: "Pentateuco", color: "bg-blue-500", type: "AT" },
      { label: "Históricos", color: "bg-emerald-500", type: "AT" },
      { label: "Poéticos", color: "bg-amber-500", type: "AT" },
      { label: "Profetas Maiores", color: "bg-purple-500", type: "AT" },
      { label: "Profetas Menores", color: "bg-indigo-500", type: "AT" },
      { label: "Evangelhos", color: "bg-rose-500", type: "NT" },
      { label: "Histórico", color: "bg-orange-500", type: "NT" },
      { label: "Cartas Paulinas", color: "bg-pink-500", type: "NT" },
      { label: "Cartas Gerais", color: "bg-cyan-500", type: "NT" },
      { label: "Revelação", color: "bg-violet-500", type: "NT" },
    ];

    return divisions.map(div => {
      const stats = coverage.byDivision[div.label] || { unique: 0, total: 0, percent: 0 };
      const booksInDivision = BIBLE_CANON.filter(b => b.division === div.label);
      const booksCompleted = booksInDivision.filter(b => (coverage.byBook[b.id]?.chaptersCompleted || 0) === b.chapters.length).length;

      return { 
        ...div, 
        percent: stats.percent,
        unique: stats.unique,
        total: stats.total,
        booksCompleted,
        totalBooks: booksInDivision.length,
        books: booksInDivision.map(b => ({
          id: b.id,
          name: b.name,
          unique: coverage.byBook[b.id]?.unique || 0,
          total: coverage.byBook[b.id]?.total || 0,
          percent: coverage.byBook[b.id]?.percent || 0,
          chaptersCompleted: coverage.byBook[b.id]?.chaptersCompleted || 0,
          totalChapters: b.chapters.length
        }))
      };
    });
  }, [coverage]);

  const formatPercent = (val: number) => {
    if (val > 0 && val < 0.01) return "< 0,01%";
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";
  };

  const formatNumber = (val: number) => val.toLocaleString('pt-BR');

  const totalChaptersLogged = useMemo(
    () => recentLogs.reduce((acc, log) => acc + (log.chapters_count ?? 0), 0),
    [recentLogs],
  );

  const distinctBooks = useMemo(() => {
    const ids = new Set<string>();
    recentLogs.forEach((log) => {
      (log.reading_passages ?? []).forEach((p) => {
        if (p?.book_id) ids.add(p.book_id);
      });
    });
    return ids.size;
  }, [recentLogs]);



  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Estatísticas</h1>
        <TrendingUp className="h-5 w-5 text-primary" />
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-6 pb-24 md:pb-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
            <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                Ofensiva
              </div>
              <p className="mt-2 font-display text-2xl font-bold">{stats.current_streak}</p>
              <p className="text-[10px] text-muted-foreground">Recorde: {stats.longest_streak}</p>
            </Card>
            <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Progresso Bíblico
              </div>
              <p className="mt-2 font-display text-2xl font-bold">{formatPercent(coverage?.percentage || 0)}</p>
              <p className="text-[10px] text-muted-foreground">{formatNumber(coverage?.totalUnique || 0)} de {formatNumber(31102)} versículos</p>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <CalendarCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Dias com leitura
              </div>
              <p className="mt-2 font-display text-2xl font-bold">{formatNumber(stats.total_read_days)}</p>
            </Card>
            <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <Flame className="h-3.5 w-3.5 text-orange-500" aria-hidden="true" />
                Maior sequência
              </div>
              <p className="mt-2 font-display text-2xl font-bold">{formatNumber(stats.longest_streak)}</p>
            </Card>
            <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Capítulos registrados
              </div>
              <p className="mt-2 font-display text-2xl font-bold">{formatNumber(totalChaptersLogged)}</p>
            </Card>
            <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <Library className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Livros diferentes
              </div>
              <p className="mt-2 font-display text-2xl font-bold">{formatNumber(distinctBooks)}</p>
              <p className="text-[10px] text-muted-foreground">de 66 livros</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
            <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-sm">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Antigo Testamento
              </div>
              <p className="mt-1 font-display text-lg font-bold">{formatPercent(coverage?.byTestament["AT"]?.percent || 0)}</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary/30">
                <div className="h-full bg-blue-500/70" style={{ width: `${coverage?.byTestament["AT"]?.percent || 0}%` }} />
              </div>
            </Card>
            <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-sm">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Novo Testamento
              </div>
              <p className="mt-1 font-display text-lg font-bold">{formatPercent(coverage?.byTestament["NT"]?.percent || 0)}</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary/30">
                <div className="h-full bg-rose-500/70" style={{ width: `${coverage?.byTestament["NT"]?.percent || 0}%` }} />
              </div>
            </Card>

          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-card/60 p-1 backdrop-blur-sm">
              <TabsTrigger value="overview" className="rounded-xl text-xs">Geral</TabsTrigger>
              <TabsTrigger value="history" className="rounded-xl text-xs">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              <Card className="border-border/60 bg-card/70 p-5 backdrop-blur-sm">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Progresso Mensal</h3>
                <div className="h-64 w-full md:h-80 lg:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis 
                        dataKey="month" 
                        fontSize={10} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'rgba(255,255,255,0.5)' }}
                      />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="chapters" fill="url(#colorPrimary)" radius={[4, 4, 0, 0]} />
                      <defs>
                        <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="border-border/60 bg-card/70 p-5 backdrop-blur-sm">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Progresso por Divisão</h3>
                <Accordion type="single" collapsible className="space-y-4">
                  {divisionStats.map((div) => (
                    <AccordionItem key={div.label} value={div.label} className="border-none">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-medium">
                          <span className="text-muted-foreground">{div.label}</span>
                          <span>{formatPercent(div.percent)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary/30">
                            <div className={cn("h-full opacity-70", div.color)} style={{ width: `${div.percent}%` }} />
                          </div>
                          <AccordionTrigger className="py-0 hover:no-underline" />
                        </div>
                        <div className="flex justify-between text-[9px] text-muted-foreground/60">
                          <span>{formatNumber(div.unique)} de {formatNumber(div.total)} versículos</span>
                          <span>{div.booksCompleted} de {div.totalBooks} livros</span>
                        </div>
                      </div>
                      <AccordionContent className="mt-3 space-y-3 pl-2 border-l border-border/20">
                        {div.books.map(book => (
                          <div key={book.id} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-medium">
                              <span className="text-foreground/80">{book.name}</span>
                              <span className="text-muted-foreground">{formatPercent(book.percent)}</span>
                            </div>
                            <div className="h-1 w-full overflow-hidden rounded-full bg-secondary/20">
                              <div className={cn("h-full opacity-50", div.color)} style={{ width: `${book.percent}%` }} />
                            </div>
                            <div className="flex justify-between text-[8px] text-muted-foreground/50">
                              <span>{formatNumber(book.unique)} / {formatNumber(book.total)} versículos</span>
                              <span>{book.chaptersCompleted} / {book.totalChapters} caps</span>
                            </div>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>

            </TabsContent>

            <TabsContent value="history" className="mt-4 space-y-3">
              {recentLogs.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Nenhuma leitura registrada recentemente.
                </div>
              ) : (
                recentLogs.map((log) => (
                  <Card key={log.id} className="border-border/40 bg-card/40 p-4 backdrop-blur-sm">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 space-y-1">
                        <h4 className="font-display text-sm font-bold leading-snug">
                          {formatLogLine(log)}
                        </h4>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <BookOpen className="h-3 w-3" aria-hidden="true" />
                          {log.chapters_count} {log.chapters_count === 1 ? 'capítulo' : 'capítulos'}
                        </div>
                      </div>
                      <div className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        +{log.chapters_count}
                      </div>
                    </div>
                    {log.notes && (
                      <div className="mt-3 border-t border-border/20 pt-2 text-[11px] italic text-muted-foreground">
                        "{log.notes}"
                      </div>
                    )}
                  </Card>
                ))
              )}
              
              <Link to="/history" className="w-full">
                <Button variant="ghost" className="w-full gap-2 text-xs text-muted-foreground">
                  Ver histórico completo <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </AppShell>
  );
}
