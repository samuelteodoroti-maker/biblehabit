import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, PieChart, TrendingUp, History, BookOpen, Clock, Calendar, Flame } from "lucide-react";
import { useReadingData } from "@/hooks/useReadingData";
import { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart as RePie, Pie, Cell, LineChart, Line 
} from "recharts";
import { bibleBooks } from "@/lib/bibleBooks";

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
  const { profile, loading } = useReadingData();

  const COLORS = ["#6366f1", "#8b5cf6", "#d946ef", "#ec4899", "#f43f5e"];

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
        <div className="space-y-6 pb-24">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 gap-3">
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
              <TabsTrigger value="distribution" className="rounded-xl text-xs">Distribuição</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              <Card className="border-border/60 bg-card/70 p-5 backdrop-blur-sm">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Progresso Mensal</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[]}>
                      <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip 
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
            </TabsContent>

            <TabsContent value="distribution" className="mt-4 space-y-4">
               {/* Pie Chart placeholder */}
               <Card className="border-border/60 bg-card/70 p-5 backdrop-blur-sm">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Testamentos</h3>
                <div className="h-64 w-full flex items-center justify-center text-sm text-muted-foreground italic">
                  Dados estruturados necessários para este gráfico.
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="border-border/60 bg-card/70 p-5 backdrop-blur-sm">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Distribuição por Divisão</h3>
            <div className="space-y-3">
              {["Pentateuco", "Históricos", "Poéticos", "Evangelhos", "Cartas"].map((div, i) => (
                <div key={div} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span>{div}</span>
                    <span className="font-semibold text-muted-foreground">0%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/50">
                    <div className="h-full bg-primary/60" style={{ width: '0%' }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}

function Flame(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}
