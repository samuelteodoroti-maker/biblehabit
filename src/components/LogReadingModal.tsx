import { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, BookOpenCheck, Trash2, Calendar, Clock, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useReadingData } from "@/hooks/useReadingData";
import { bibleBooks, getBibleBook } from "@/lib/bibleBooks";
import { cn } from "@/lib/utils";

const FREE = "__free__";

type Plan = { id: string; title: string; completed_days: number; total_days: number };

type PassageEntry = {
  id: string;
  bookId: string;
  startChapter: number;
  startVerse: number;
  endChapter: number;
  endVerse: number;
  isFullChapters: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string;
  today: string;
  onSaved?: () => void;
};

export function LogReadingModal({ open, onOpenChange, userId, today, onSaved }: Props) {
  const { activePlan, refresh } = useReadingData();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planId, setPlanId] = useState<string>(FREE);
  const [readingDate, setReadingDate] = useState(today);
  const [duration, setDuration] = useState(15);
  const [passages, setPassages] = useState<PassageEntry[]>([
    { id: crypto.randomUUID(), bookId: "GEN", startChapter: 1, startVerse: 1, endChapter: 1, endVerse: 0, isFullChapters: true }
  ]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setReadingDate(today);
    setNotes("");
    setDuration(15);
    
    if (activePlan) {
      setPlanId(activePlan.id);
    } else {
      setPlanId(FREE);
    }

    (async () => {
      const { data } = await supabase
        .from("reading_plans")
        .select("id, title, completed_days, total_days")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });
      setPlans((data as Plan[]) ?? []);
    })();
  }, [open, userId, activePlan, today]);

  const addPassage = () => {
    const last = passages[passages.length - 1];
    setPassages([...passages, {
      id: crypto.randomUUID(),
      bookId: last?.bookId || "GEN",
      startChapter: (last?.endChapter || 1) + 1,
      startVerse: 1,
      endChapter: (last?.endChapter || 1) + 1,
      endVerse: 0,
      isFullChapters: true
    }]);
  };

  const removePassage = (id: string) => {
    if (passages.length > 1) {
      setPassages(passages.filter(p => p.id !== id));
    }
  };

  const updatePassage = (id: string, updates: Partial<PassageEntry>) => {
    setPassages(passages.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const totalChapters = useMemo(() => {
    return passages.reduce((acc, p) => acc + (p.endChapter - p.startChapter + 1), 0);
  }, [passages]);

  const save = async () => {
    setSaving(true);
    try {
      // 1. Insert Log
      const { data: log, error: logErr } = await supabase
        .from("reading_logs")
        .insert({
          user_id: userId,
          reading_date: readingDate,
          chapters_count: totalChapters,
          plan_id: planId === FREE ? null : planId,
          notes: notes.trim() || null,
          duration_minutes: duration
        })
        .select()
        .single();

      if (logErr) throw logErr;

      // 2. Insert Passages
      const passageData = passages.map(p => ({
        reading_log_id: log.id,
        user_id: userId,
        book_id: p.bookId,
        start_chapter: p.startChapter,
        start_verse: p.startVerse || 1,
        end_chapter: p.endChapter,
        end_verse: p.endVerse || 0,
        is_full_chapter: p.isFullChapters || false
      }));

      const { error: passErr } = await supabase
        .from("reading_passages")
        .insert(passageData);

      if (passErr) throw passErr;

      // 3. Update Plan Progress if applicable
      if (planId !== FREE) {
        const plan = plans.find(p => p.id === planId);
        if (plan) {
          await supabase
            .from("reading_plans")
            .update({ completed_days: (plan.completed_days ?? 0) + 1 })
            .eq("id", planId);
        }
      }

      toast.success("Leitura registrada com sucesso! 🔥");
      refresh();
      onSaved?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao salvar leitura:", error);
      toast.error(error.message || "Erro ao salvar leitura. Verifique se os dados são válidos.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] max-w-lg overflow-y-auto border-border/60 bg-card/95 p-0 backdrop-blur-xl rounded-t-[2.5rem] sm:rounded-[2rem] focus-visible:outline-none">
        <div className="sticky top-0 z-10 bg-card/95 p-6 pb-2 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Registrar Leitura</DialogTitle>
            <DialogDescription>
              {readingDate === today ? "Marque sua leitura de hoje" : `Registrando para ${new Date(readingDate + 'T12:00:00').toLocaleDateString('pt-BR')}`}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-6 px-6 pb-8 pt-2">
          {/* Quick Settings: Date & Duration */}
          <div className="grid grid-cols-2 gap-3" role="group" aria-label="Informações da sessão">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Data</Label>
              <div className="relative">
                <Input 
                  type="date" 
                  value={readingDate}
                  max={today}
                  onChange={(e) => setReadingDate(e.target.value)}
                  className="h-10 rounded-xl bg-background/40 pl-9 pr-3 text-xs"
                />
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Duração (min)</Label>
              <div className="relative">
                <Input 
                  type="number" 
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="h-10 rounded-xl bg-background/40 pl-9 pr-3 text-xs"
                />
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Plan Selection */}
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Plano de Leitura</Label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger className="h-11 rounded-xl bg-background/40">
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FREE}>Leitura Livre</SelectItem>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Passages */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Passagens Lidas</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={addPassage}
                className="h-7 gap-1 text-[10px] font-semibold text-primary"
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar
              </Button>
            </div>

            <div className="space-y-3">
              {passages.map((p, index) => {
                const book = getBibleBook(p.bookId);
                return (
                  <div key={p.id} className="relative space-y-3 rounded-2xl border border-border/40 bg-background/30 p-4 pt-5">
                    {passages.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removePassage(p.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}

                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-12">
                        <Select 
                          value={p.bookId} 
                          onValueChange={(val) => updatePassage(p.id, { bookId: val })}
                        >
                          <SelectTrigger className="h-10 rounded-xl border-none bg-background/60 shadow-none focus:ring-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {bibleBooks.map((b) => (
                              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-5 flex items-center gap-2">
                        <div className="flex-1 space-y-1">
                          <Label className="text-[9px] text-muted-foreground">Cap. Inicial</Label>
                          <Input 
                            type="number" 
                            min={1} 
                            max={book?.chapters || 150}
                            value={p.startChapter}
                            onChange={(e) => updatePassage(p.id, { startChapter: Number(e.target.value), endChapter: Number(e.target.value) })}
                            className="h-9 rounded-lg bg-background/60 text-center"
                          />
                        </div>
                      </div>

                      <div className="col-span-2 flex items-end justify-center pb-2">
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                      </div>

                      <div className="col-span-5 flex items-center gap-2">
                        <div className="flex-1 space-y-1">
                          <Label className="text-[9px] text-muted-foreground">Cap. Final</Label>
                          <Input 
                            type="number" 
                            min={p.startChapter}
                            max={book?.chapters || 150}
                            value={p.endChapter}
                            onChange={(e) => updatePassage(p.id, { endChapter: Number(e.target.value) })}
                            className="h-9 rounded-lg bg-background/60 text-center"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Observações (Opcional)</Label>
            <Textarea
              placeholder="Alguma revelação ou dúvida sobre a leitura?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] resize-none rounded-2xl bg-background/40"
            />
          </div>

          <Button
            size="lg"
            className={cn(
              "h-14 w-full gap-2 rounded-2xl font-display text-base font-bold text-primary-foreground shadow-glow transition-all hover:brightness-110",
              "gradient-primary"
            )}
            disabled={saving}
            onClick={save}
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <BookOpenCheck className="h-5 w-5" />}
            {saving ? "Registrando..." : "Registrar Leitura"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
