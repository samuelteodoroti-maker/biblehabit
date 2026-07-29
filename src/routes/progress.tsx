import { createFileRoute } from "@tanstack/react-router";
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
import { Plus, Share2, Pencil, Trash2 } from "lucide-react";
import { readingPlans } from "@/lib/mockData";
import { bibleBooks, chaptersBetween } from "@/lib/bibleBooks";
import { toast } from "sonner";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progresso — Bible Tracker" },
      { name: "description", content: "Gerencie seus planos de leitura personalizados." },
      { property: "og:title", content: "Progresso — Bible Tracker" },
      { property: "og:description", content: "Gerencie seus planos de leitura personalizados." },
    ],
  }),
  component: ProgressPage,
});

type Plan = (typeof readingPlans)[number];

function CircularProgress({ value }: { value: number }) {
  const safe = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  const r = 32;
  const c = 2 * Math.PI * r;
  const offset = c - (safe / 100) * c;
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0" aria-label={`Progresso ${Math.round(safe)}%`}>
      <circle cx="40" cy="40" r={r} className="fill-none stroke-muted" strokeWidth="8" />
      <circle
        cx="40" cy="40" r={r}
        className="fill-none stroke-primary transition-all"
        strokeWidth="8" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={offset}
        transform="rotate(-90 40 40)"
      />
      <text x="40" y="45" textAnchor="middle" className="fill-foreground text-sm font-bold">
        {Math.round(safe)}%
      </text>
    </svg>
  );
}

function ProgressPage() {
  const [plans, setPlans] = useState<Plan[]>(readingPlans);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
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
    if (!open || editing) return;
    if (totalChapters <= 0) return;
    if (form.daysTouched) return;
    setForm((f) => ({ ...f, totalDays: suggestedDays }));
  }, [open, editing, totalChapters, suggestedDays, form.daysTouched]);

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", description: "", totalDays: 30, fromIdx: 0, toIdx: 0, daysTouched: false });
    setOpen(true);
  };
  const openEdit = (p: Plan) => {
    setEditing(p);
    setForm({ title: p.title, description: p.description, totalDays: p.totalDays, fromIdx: 0, toIdx: 0, daysTouched: true });
    setOpen(true);
  };
  const save = () => {
    if (!form.title.trim()) return toast.error("Título obrigatório");
    const description = editing
      ? form.description
      : totalChapters > 0
        ? `${bibleBooks[form.fromIdx].name} — ${bibleBooks[form.toIdx].name} (${totalChapters} capítulos)`
        : form.description;
    const payload = { title: form.title, description, totalDays: form.totalDays };
    if (editing) {
      setPlans((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...payload } : p)));
      toast.success("Plano atualizado");
    } else {
      const id = "p" + Date.now();
      setPlans((prev) => [
        ...prev,
        { id, ...payload, completedDays: 0, booksToday: "—", shareLink: `https://biblereader.app/join/${id}` },
      ]);
      toast.success("Plano criado");
    }
    setOpen(false);
  };
  const remove = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    toast.success("Plano removido");
  };
  const share = (p: Plan) => {
    navigator.clipboard?.writeText(p.shareLink).catch(() => {});
    toast.success("Link de convite copiado");
  };

  return (
    <AppShell title="Planos de leitura">
      <Button onClick={openNew} className="mb-5 w-full gap-2">
        <Plus className="h-4 w-4" /> Novo plano
      </Button>

      <div className="space-y-3">
        {plans.map((p) => {
          const pct = p.totalDays > 0 ? (p.completedDays / p.totalDays) * 100 : 0;
          return (
            <Card key={p.id} className="p-4">
              <div className="flex items-start gap-4">
                <CircularProgress value={pct} />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{p.title}</h3>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {p.completedDays}/{p.totalDays} dias · Hoje: {p.booksToday}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary" className="flex-1 gap-1.5" onClick={() => share(p)}>
                  <Share2 className="h-3.5 w-3.5" /> Compartilhar
                </Button>
                <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => remove(p.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar plano" : "Novo plano"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Título</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Livro Inicial (De)</Label>
                <Select
                  value={String(form.fromIdx)}
                  onValueChange={(v) => {
                    const from = Number(v);
                    setForm((f) => ({ ...f, fromIdx: from, toIdx: Math.max(from, f.toIdx) }));
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    {bibleBooks.map((b, i) => (
                      <SelectItem key={b.name} value={String(i)}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Livro Final (Até)</Label>
                <Select
                  value={String(form.toIdx)}
                  onValueChange={(v) => setForm((f) => ({ ...f, toIdx: Number(v) }))}
                >
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
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
              <p className="text-xs text-muted-foreground">
                Total: {totalChapters} capítulos. Sugestão: {suggestedDays} dias (1 capítulo/dia).
              </p>
            )}
            <div>
              <Label>Dias</Label>
              <Input
                type="number"
                min={1}
                value={form.totalDays}
                onChange={(e) =>
                  setForm({ ...form, totalDays: Number(e.target.value), daysTouched: true })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
