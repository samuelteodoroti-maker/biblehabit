import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, BookOpen, Clock, Calendar, Flame, ChevronRight } from "lucide-react";
import { useReadingData } from "@/hooks/useReadingData";
import { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell
} from "recharts";
import { getBibleBook } from "@/lib/bibleBooks";
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
  const { profile, recentLogs, loading } = useReadingData();

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
    const divisions = [
      { label: "Pentateuco", color: "bg-blue-500", books: ["GEN", "EXO", "LEV", "NUM", "DEU"] },
      { label: "Históricos", color: "bg-emerald-500", books: ["JOS", "JDG", "RUT", "1SA", "2SA", "1KI", "2KI", "1CH", "2CH", "EZR", "NEH", "EST", "ACT"] },
      { label: "Poéticos", color: "bg-amber-500", books: ["JOB", "PSA", "PRO", "ECC", "SNG"] },
      { label: "Profetas", color: "bg-purple-500", books: ["ISA", "JER", "LAM", "EZK", "DAN", "HOS", "JOL", "AMO", "OBA", "JON", "MIC", "NAM", "HAB", "ZEP", "HAG", "ZEC", "MAL"] },
      { label: "NT", color: "bg-rose-500", books: ["MAT", "MRK", "LUK", "JHN", "ROM", "1CO", "2CO", "GAL", "EPH", "PHP", "COL", "1TS", "2TS", "1TI", "2TI", "TIT", "PHM", "HEB", "JAS", "1PE", "2PE", "1JN", "2JN", "3JN", "JUD", "REV"] },
    ];


    const bookLogs = recentLogs.flatMap(l => l.reading_passages.map(p => p.book_id));
    const totalLogs = bookLogs.length || 1;

    return divisions.map(div => {
      const count = bookLogs.filter(b => div.books.includes(b)).length;
      const percent = Math.round((count / totalLogs) * 100);
      return { ...div, percent };
    });
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
              <p className="mt-2 font-display text-2xl font-bold">{profile?.current_streak ?? 0}</p>
              <p className="text-[10px] text-muted-foreground">Recorde: {profile?.longest_streak ?? 0}</p>
            </Card>
            <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                Capítulos
              </div>
              <p className="mt-2 font-display text-2xl font-bold">{profile?.total_chapters_read ?? 0}</p>
              <p className="text-[10px] text-muted-foreground">Total lido</p>
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
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Distribuição por Divisão</h3>
                <div className="space-y-4">
                  {divisionStats.map((div) => (

                    <div key={div.label} className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-medium">
                        <span className="text-muted-foreground">{div.label}</span>
                        <span>{div.percent}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/30">
                        <div className={cn("h-full opacity-70", div.color)} style={{ width: `${div.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
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
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[11px] font-medium text-muted-foreground">
                            {new Date(log.reading_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                        <h4 className="font-display text-sm font-bold">
                          {log.reading_passages.map((p, i) => {
                            const book = getBibleBook(p.book_id);
                            return `${book?.name} ${p.start_chapter}${p.start_chapter !== p.end_chapter ? '-' + p.end_chapter : ''}${i < log.reading_passages.length - 1 ? ', ' : ''}`;
                          })}
                        </h4>
                        <div className="flex items-center gap-3">
                           <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <BookOpen className="h-3 w-3" />
                            {log.chapters_count} {log.chapters_count === 1 ? 'capítulo' : 'capítulos'}
                          </div>
                          {log.duration_minutes && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {log.duration_minutes} min
                            </div>
                          )}
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
              
              <Button variant="ghost" className="w-full gap-2 text-xs text-muted-foreground">
                Ver histórico completo <ChevronRight className="h-3 w-3" />
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </AppShell>
  );
}
