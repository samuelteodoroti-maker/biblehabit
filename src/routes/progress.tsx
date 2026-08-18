import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Share2, Pencil, Trash2, Loader2, BookOpen, CalendarHeart, TrendingUp, BookOpenCheck } from "lucide-react";
import { useReadingData } from "@/hooks/useReadingData";
import { bibleBooks, getChaptersBetween } from "@/lib/bibleBooks";

import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Planos de leitura — Bible Habit" },
      { name: "description", content: "Crie e acompanhe planos de leitura bíblica personalizados, visualize seus insights e o gráfico de capítulos lidos nos últimos 7 dias." },
      { property: "og:title", content: "Planos de leitura — Bible Habit" },
      { property: "og:description", content: "Crie e acompanhe planos de leitura bíblica personalizados, visualize seus insights e o gráfico de capítulos lidos nos últimos 7 dias." },
      { property: "og:url", content: "https://biblehabit.lovable.app/progress" },
    ],
    links: [{ rel: "canonical", href: "https://biblehabit.lovable.app/progress" }],
  }),
  component: ProgressPage,
});

type Plan = {
  id: string;
  title: string;
  description: string | null;
  start_book: string | null;
  end_book: string | null;
  total_days: number;
  completed_days: number;
  books_today: string | null;
  share_code: string | null;
};

import { ProgressRing } from "@/components/BibleUI";

function CircularProgress({ value }: { value: number }) {
  return <ProgressRing progress={value} size={80} strokeWidth={7} />;
}

const pad2 = (n: number) => String(n).padStart(2, "0");
function localDateKey(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function buildLast7(dayMap: Map<string, number>) {
  const out: { day: string; chapters: number }[] = [];
  const labels = ["D", "S", "T", "Q", "Q", "S", "S"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = localDateKey(d);
    out.push({ day: labels[d.getDay()], chapters: dayMap.get(key) ?? 0 });
  }
  return out;
}

function ProgressPage() {
  const navigate = useNavigate();
  const { user, profile, coverage, loading: dataLoading } = useReadingData();
  const authLoading = dataLoading;

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [insights, setInsights] = useState<{
    favoriteDay: string | null;
    avgChapters: number;
    last7: { day: string; chapters: number }[];
    hasData: boolean;
    loading: boolean;
  }>({ favoriteDay: null, avgChapters: 0, last7: [], hasData: false, loading: true });
  const [form, setForm] = useState({
    title: "",
    totalDays: 30,
    fromIdx: 0,
    toIdx: 0,
    daysTouched: false,
  });

  const totalChapters = useMemo(
    () => getChaptersBetween(form.fromIdx, form.toIdx),
    [form.fromIdx, form.toIdx],
  );
  const suggestedDays = Math.max(1, totalChapters);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!open || editing) return;
    if (totalChapters <= 0) return;
    if (form.daysTouched) return;
    setForm((f) => ({ ...f, totalDays: suggestedDays }));
  }, [open, editing, totalChapters, suggestedDays, form.daysTouched]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from("reading_plans")
        .select("id, title, description, start_book, end_book, total_days, goal_days, completed_days, books_today, share_code")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) toast.error(error.message);
      setPlans(
        (data ?? []).map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          start_book: p.start_book,
          end_book: p.end_book,
          total_days: p.total_days ?? p.goal_days ?? 30,
          completed_days: p.completed_days ?? 0,
          books_today: p.books_today,
          share_code: p.share_code,
        })),
      );
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setInsights(prev => ({ ...prev, loading: true }));
    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - 89);
      const sinceStr = since.toISOString().slice(0, 10);
      const { data } = await supabase
        .from("reading_logs")
        .select("reading_date, chapters_count")
        .eq("user_id", user.id)
        .gte("reading_date", sinceStr);
      if (cancelled) return;
      const logs = (data ?? []) as { reading_date: string; chapters_count: number }[];
      if (logs.length === 0) {
        setInsights({ favoriteDay: null, avgChapters: 0, last7: buildLast7(new Map()), hasData: false, loading: false });
        return;
      }
      const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
      const dayCounts = new Array(7).fill(0);
      let totalRead = 0;
      const dayMap = new Map<string, number>();
      for (const l of logs) {
        const d = new Date(l.reading_date + "T12:00:00");
        dayCounts[d.getDay()]++;
        totalRead += l.chapters_count ?? 0;
        dayMap.set(l.reading_date, (dayMap.get(l.reading_date) ?? 0) + (l.chapters_count ?? 0));
      }
      let favIdx = 0;
      for (let i = 1; i < 7; i++) if (dayCounts[i] > dayCounts[favIdx]) favIdx = i;
      setInsights({
        favoriteDay: dayCounts[favIdx] > 0 ? dayNames[favIdx] : null,
        avgChapters: totalRead / logs.length,
        last7: buildLast7(dayMap),
        hasData: true,
        loading: false,
      });
    })();
    return () => { cancelled = true; };
  }, [user]);

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", totalDays: 30, fromIdx: 0, toIdx: 0, daysTouched: false });
    setOpen(true);
  };

  const openEdit = (p: Plan) => {
    const fromIdx = Math.max(0, bibleBooks.findIndex((b) => b.name === p.start_book));
    const toIdx = Math.max(fromIdx, bibleBooks.findIndex((b) => b.name === p.end_book));
    setEditing(p);
    setForm({
      title: p.title,
      totalDays: p.total_days,
      fromIdx: fromIdx < 0 ? 0 : fromIdx,
      toIdx: toIdx < 0 ? 0 : toIdx,
      daysTouched: true,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!user) return;
    if (!form.title.trim()) return toast.error("Título obrigatório");
    setSaving(true);
    const startBook = bibleBooks[form.fromIdx]?.name ?? null;
    const endBook = bibleBooks[form.toIdx]?.name ?? null;
    const description =
      totalChapters > 0 ? `${startBook} — ${endBook} (${totalChapters} capítulos)` : null;

    if (editing) {
      const { data, error } = await supabase
        .from("reading_plans")
        .update({
          title: form.title,
          description,
          start_book: startBook,
          end_book: endBook,
          total_days: form.totalDays,
          goal_days: form.totalDays,
        })
        .eq("id", editing.id)
        .select("id, title, description, start_book, end_book, total_days, completed_days, books_today, share_code")
        .maybeSingle();
      setSaving(false);
      if (error) return toast.error(error.message);
      if (data) setPlans((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...data } as Plan : p)));
      toast.success("Plano atualizado");
    } else {
      const { data, error } = await supabase
        .from("reading_plans")
        .insert({
          user_id: user.id,
          title: form.title,
          description,
          start_book: startBook,
          end_book: endBook,
          total_days: form.totalDays,
          goal_days: form.totalDays,
        })
        .select("id, title, description, start_book, end_book, total_days, completed_days, books_today, share_code")
        .maybeSingle();
      setSaving(false);
      if (error) return toast.error(error.message);
      if (data) setPlans((prev) => [{ ...(data as Plan) }, ...prev]);
      toast.success("Plano criado");
    }
    setOpen(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este plano?")) return;
    const { error } = await supabase.from("reading_plans").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setPlans((prev) => prev.filter((p) => p.id !== id));
    toast.success("Plano removido");
  };

  const share = (p: Plan) => {
    const link = p.share_code
      ? `${window.location.origin}/join/${p.share_code}`
      : `${window.location.origin}/plan/${p.id}`;
    navigator.clipboard?.writeText(link).catch(() => {});
    toast.success("Link de convite copiado");
  };

  return (
    <AppShell title="Jornadas" subtitle="Crie e acompanhe seus planos de leitura">
      <div className="mb-8 space-y-4">
        <h2 className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Sua evolução
        </h2>


        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
          {insights.loading ? (
            <>
              <Skeleton className="h-[88px] rounded-2xl" />
              <Skeleton className="h-[88px] rounded-2xl" />
            </>
          ) : (
            <>
              <Card className="border-border/50 bg-card/80 p-6 backdrop-blur-xl rounded-[2rem] shadow-card hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-2.5 small-label text-muted-foreground">
                  <CalendarHeart className="h-4 w-4 text-primary/70" /> Dia favorito
                </div>
                <p className="mt-3 font-display text-2xl font-bold tracking-tight">
                  {insights.favoriteDay ?? "—"}
                </p>
              </Card>
              <Card className="border-border/50 bg-card/80 p-6 backdrop-blur-xl rounded-[2rem] shadow-card hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-2.5 small-label text-muted-foreground">
                  <TrendingUp className="h-4 w-4 text-primary/70" /> Média por leitura
                </div>
                <p className="mt-3 font-display text-2xl font-bold tracking-tight">
                  {insights.avgChapters.toFixed(1)}{" "}
                  <span className="text-sm font-bold text-muted-foreground/50 uppercase tracking-widest">caps</span>
                </p>
              </Card>
            </>
          )}
        </div>
        
        {insights.loading ? (
          <Skeleton className="h-[176px] rounded-2xl" />
        ) : insights.hasData ? (
          <Card className="border-border/50 bg-card/80 p-8 backdrop-blur-xl rounded-[2.5rem] shadow-card">
            <p className="mb-4 small-label text-muted-foreground/60">
              Últimos 7 dias
            </p>
            <div className="h-40 md:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={insights.last7} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    contentStyle={{
                      background: "rgba(20,20,30,0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="chapters" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        ) : (
          <Card className="border-dashed border-border/70 bg-card/40 p-6 text-center text-xs text-muted-foreground">
            Registre leituras para ver seus insights.
          </Card>
        )}
      </div>

      <Button
        onClick={openNew}
        className="mb-10 h-16 w-full gap-3 rounded-[1.5rem] gradient-primary text-lg font-bold text-primary-foreground shadow-glow-lg hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
        disabled={!user || loading}
        aria-label="Criar novo plano de leitura"
        aria-haspopup="dialog"
      >
        <Plus className="h-6 w-6" /> Novo plano
      </Button>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/60 bg-card/70 p-5 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <Card className="border-dashed border-border/70 bg-card/40 p-8 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-display text-base font-semibold">Sem planos ainda</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie o primeiro para começar sua jornada.
          </p>
        </Card>
      ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => {
            const pct = p.total_days > 0 ? (p.completed_days / p.total_days) * 100 : 0;
            const biblePct = coverage?.percentage || 0;
            
            return (
              <Card
                key={p.id}
                className="paper-texture flex flex-col justify-between border-border/50 bg-card/80 p-8 backdrop-blur-xl transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl hover:border-primary/20 rounded-[2.5rem]"
              >

                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-serif-title text-xl font-bold tracking-tight">{p.title}</h2>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full"
                      onClick={() => share(p)}
                      title="Compartilhar"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-5">
                    <CircularProgress value={pct} />
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-xs text-muted-foreground italic">
                        {p.description ?? "Jornada de leitura bíblica"}
                      </p>
                      <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                        {p.books_today ? `Hoje: ${p.books_today}` : "Meta concluída"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <span>Progresso do Plano</span>
                      <span>{p.completed_days} de {p.total_days} dias</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/30">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-primary/70">
                      <span>Progresso Bíblico</span>
                      <span>{biblePct.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
                      <div className="h-full bg-primary/50" style={{ width: `${biblePct}%` }} />
                    </div>
                  </div>

                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1 rounded-xl text-xs font-semibold"
                      onClick={() => openEdit(p)}
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" /> Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-xl px-3 text-destructive hover:bg-destructive/10"
                      onClick={() => remove(p.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
          </div>

      )}


      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md border-border/60 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editing ? "Editar plano" : "Novo plano de leitura"}
            </DialogTitle>
            <DialogDescription>
              Defina o que você quer ler e em quantos dias.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="plan-title" className="text-xs uppercase tracking-wider text-muted-foreground">Título</Label>
              <Input
                id="plan-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Ex: Novo Testamento"
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Início</Label>
                <Select
                  value={String(form.fromIdx)}
                  onValueChange={(v) => setForm((f) => ({ ...f, fromIdx: Number(v), toIdx: Math.max(Number(v), f.toIdx) }))}
                >
                  <SelectTrigger className="rounded-xl" aria-label="Livro de início">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bibleBooks.map((b, i) => (
                      <SelectItem key={b.name} value={String(i)}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Fim</Label>
                <Select
                  value={String(form.toIdx)}
                  onValueChange={(v) => setForm((f) => ({ ...f, toIdx: Number(v) }))}
                >
                  <SelectTrigger className="rounded-xl" aria-label="Livro de fim">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bibleBooks.slice(form.fromIdx).map((b, i) => (
                      <SelectItem key={b.name} value={String(i + form.fromIdx)}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="plan-days" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Duração (dias)
                </Label>
                <span className="text-[10px] text-primary">Sugestão: {suggestedDays} dias</span>
              </div>
              <Input
                id="plan-days"
                type="number"
                value={form.totalDays}
                onChange={(e) => setForm((f) => ({ ...f, totalDays: Number(e.target.value), daysTouched: true }))}
                className="rounded-xl"
              />
            </div>

            {totalChapters > 0 && (
              <div className="rounded-xl bg-accent/30 p-3 text-center">
                <p className="text-xs text-muted-foreground">
                  Meta diária estimada:
                </p>
                <p className="mt-1 font-display text-lg font-bold text-primary">
                  {Math.ceil(totalChapters / form.totalDays)} capítulos/dia
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              className="h-12 w-full rounded-2xl gradient-primary font-semibold text-primary-foreground shadow-glow"
              onClick={save}
              disabled={saving}
              aria-label={editing ? "Salvar alterações no plano" : "Criar novo plano de leitura"}
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : editing ? "Salvar alterações" : "Criar plano"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
