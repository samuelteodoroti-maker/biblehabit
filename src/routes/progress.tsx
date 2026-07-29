import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Share2, Pencil, Trash2, Loader2, BookOpen, CalendarHeart, TrendingUp } from "lucide-react";
import { bibleBooks, chaptersBetween } from "@/lib/bibleBooks";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Planos — Bible Habit" },
      { name: "description", content: "Gerencie seus planos de leitura personalizados." },
      { property: "og:title", content: "Planos — Bible Habit" },
      { property: "og:description", content: "Gerencie seus planos de leitura personalizados." },
    ],
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

function CircularProgress({ value }: { value: number }) {
  const safe = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  const r = 32;
  const c = 2 * Math.PI * r;
  const offset = c - (safe / 100) * c;
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      className="shrink-0"
      aria-label={`Progresso ${Math.round(safe)}%`}
    >
      <defs>
        <linearGradient id="progGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.55 0.22 275)" />
          <stop offset="100%" stopColor="oklch(0.75 0.19 275)" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r={r} className="fill-none stroke-muted/60" strokeWidth="7" />
      <circle
        cx="40"
        cy="40"
        r={r}
        stroke="url(#progGrad)"
        className="fill-none transition-all"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 40 40)"
      />
      <text
        x="40"
        y="46"
        textAnchor="middle"
        className="fill-foreground font-display text-base font-bold"
      >
        {Math.round(safe)}%
      </text>
    </svg>
  );
}

function buildLast7(dayMap: Map<string, number>) {
  const out: { day: string; chapters: number }[] = [];
  const labels = ["D", "S", "T", "Q", "Q", "S", "S"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ day: labels[d.getDay()], chapters: dayMap.get(key) ?? 0 });
  }
  return out;
}


function ProgressPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [insights, setInsights] = useState<{
    favoriteDay: string | null;
    avgChapters: number;
    last7: { day: string; chapters: number }[];
    hasData: boolean;
  }>({ favoriteDay: null, avgChapters: 0, last7: [], hasData: false });
  const [form, setForm] = useState({
    title: "",
    totalDays: 30,
    fromIdx: 0,
    toIdx: 0,
    daysTouched: false,
  });

  const totalChapters = useMemo(
    () => chaptersBetween(form.fromIdx, form.toIdx),
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

  // Insights
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - 89);
      const sinceStr = since.toISOString().slice(0, 10);
      const { data } = await supabase
        .from("reading_logs")
        .select("read_date, chapters_count")
        .eq("user_id", user.id)
        .gte("read_date", sinceStr);
      if (cancelled) return;
      const logs = (data ?? []) as { read_date: string; chapters_count: number }[];
      if (logs.length === 0) {
        setInsights({ favoriteDay: null, avgChapters: 0, last7: buildLast7(new Map()), hasData: false });
        return;
      }
      const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
      const dayCounts = new Array(7).fill(0);
      let totalChapters = 0;
      const dayMap = new Map<string, number>();
      for (const l of logs) {
        const d = new Date(l.read_date + "T00:00:00");
        dayCounts[d.getDay()]++;
        totalChapters += l.chapters_count ?? 0;
        dayMap.set(l.read_date, (dayMap.get(l.read_date) ?? 0) + (l.chapters_count ?? 0));
      }
      let favIdx = 0;
      for (let i = 1; i < 7; i++) if (dayCounts[i] > dayCounts[favIdx]) favIdx = i;
      setInsights({
        favoriteDay: dayCounts[favIdx] > 0 ? dayNames[favIdx] : null,
        avgChapters: totalChapters / logs.length,
        last7: buildLast7(dayMap),
        hasData: true,
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
    <AppShell title="Planos de leitura" subtitle="Crie e acompanhe suas jornadas">
      <Button
        onClick={openNew}
        className="mb-6 h-12 w-full gap-2 rounded-2xl gradient-primary font-semibold text-primary-foreground shadow-glow hover:brightness-110"
        disabled={!user}
      >
        <Plus className="h-4 w-4" /> Novo plano
      </Button>

      {loading && (
        <div className="flex justify-center py-10 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}

      {!loading && plans.length === 0 && user && (
        <Card className="border-dashed border-border/70 bg-card/40 p-8 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-display text-base font-semibold">Sem planos ainda</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie o primeiro para começar sua jornada.
          </p>
        </Card>
      )}

      <div className="space-y-3">
        {plans.map((p) => {
          const pct = p.total_days > 0 ? (p.completed_days / p.total_days) * 100 : 0;
          return (
            <Card
              key={p.id}
              className="border-border/60 bg-card/70 p-5 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-card"
            >
              <div className="flex items-start gap-4">
                <CircularProgress value={pct} />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display text-base font-semibold">{p.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {p.description ?? "—"}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px]">
                    <span className="rounded-full border border-border/60 bg-background/50 px-2 py-0.5 font-medium text-muted-foreground">
                      {p.completed_days}/{p.total_days} dias
                    </span>
                    {p.books_today ? (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 font-medium text-primary">
                        Hoje: {p.books_today}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1 gap-1.5 rounded-xl"
                  onClick={() => share(p)}
                >
                  <Share2 className="h-3.5 w-3.5" /> Compartilhar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => openEdit(p)}
                  aria-label="Editar"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => remove(p.id)}
                  aria-label="Remover"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl border-border/60 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editing ? "Editar plano" : "Novo plano"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Título</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex.: Novo Testamento em 90 dias"
                className="h-10 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">De</Label>
                <Select
                  value={String(form.fromIdx)}
                  onValueChange={(v) => {
                    const from = Number(v);
                    setForm((f) => ({ ...f, fromIdx: from, toIdx: Math.max(from, f.toIdx) }));
                  }}
                >
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {bibleBooks.map((b, i) => (
                      <SelectItem key={b.name} value={String(i)}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Até</Label>
                <Select
                  value={String(form.toIdx)}
                  onValueChange={(v) => setForm((f) => ({ ...f, toIdx: Number(v) }))}
                >
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {bibleBooks.map((b, i) => (
                      <SelectItem key={b.name} value={String(i)} disabled={i < form.fromIdx}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {totalChapters > 0 && (
              <div className="rounded-xl border border-border/60 bg-background/50 px-3 py-2.5 text-xs text-muted-foreground">
                Total: <span className="font-semibold text-foreground">{totalChapters}</span>{" "}
                capítulos · Sugestão:{" "}
                <span className="font-semibold text-foreground">{suggestedDays}</span> dias (1
                capítulo/dia).
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs">Dias</Label>
              <Input
                type="number"
                min={1}
                value={form.totalDays}
                onChange={(e) =>
                  setForm({ ...form, totalDays: Number(e.target.value), daysTouched: true })
                }
                className="h-10 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              className="rounded-xl gradient-primary font-semibold text-primary-foreground shadow-glow hover:brightness-110"
              onClick={save}
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
