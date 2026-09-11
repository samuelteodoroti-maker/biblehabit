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
import { bibleBooks } from "@/lib/bibleBooks";
import { BIBLE_CANON } from "@/lib/bible-canon";
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
  initialDate?: string;
  initialPassage?: {
    bookId: string;
    chapter: number;
    startVerse?: number;
    endVerse?: number;
  };
  onSaved?: () => void;
};

export function LogReadingModal({ open, onOpenChange, userId, today, initialDate, initialPassage, onSaved }: Props) {
  const { activePlan, refresh } = useReadingData();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planId, setPlanId] = useState<string>(FREE);
  const [readingDate, setReadingDate] = useState(initialDate || today);
  const [duration, setDuration] = useState(15);
  const [passages, setPassages] = useState<PassageEntry[]>([
    { id: crypto.randomUUID(), bookId: "GEN", startChapter: 1, startVerse: 1, endChapter: 1, endVerse: 1, isFullChapters: false }
  ]);

  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setReadingDate(initialDate || today);
    setNotes("");
    setDuration(15);

    if (initialPassage) {
      setPassages([{
        id: crypto.randomUUID(),
        bookId: initialPassage.bookId,
        startChapter: initialPassage.chapter,
        startVerse: initialPassage.startVerse || 1,
        endChapter: initialPassage.chapter,
        endVerse: initialPassage.endVerse || initialPassage.startVerse || 0,
        isFullChapters: !initialPassage.startVerse
      }]);
    } else {
      setPassages([
        { id: crypto.randomUUID(), bookId: "GEN", startChapter: 1, startVerse: 1, endChapter: 1, endVerse: 1, isFullChapters: false }
      ]);
    }

    
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
  }, [open, userId, activePlan, today, initialDate]);

  const addPassage = () => {
    const last = passages[passages.length - 1];
    setPassages([...passages, {
      id: crypto.randomUUID(),
      bookId: last?.bookId || "GEN",
      startChapter: (last?.endChapter || 1),
      startVerse: 1,
      endChapter: (last?.endChapter || 1),
      endVerse: 1,
      isFullChapters: false
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
    if (saving) return; // evita duplicidade em cliques rápidos

    // Datas futuras: comparação de dias civis no fuso do usuário
    if (toDayNumber(readingDate) > toDayNumber(today)) {
      toast.error("Não é possível registrar leituras em datas futuras.");
      return;
    }

    setSaving(true);
    try {
      // Use RPC for atomic saving
      // @ts-ignore - log_reading_atomic is created via migration
      const { data: logId, error: logErr } = await supabase.rpc('log_reading_atomic', {
        p_user_id: userId,
        p_reading_date: readingDate,
        p_chapters_count: totalChapters,
        p_plan_id: (planId === FREE ? null : planId) as any,
        p_notes: (notes.trim() || null) as any,
        p_duration_minutes: duration,

        p_passages: passages.map(p => ({
          book_id: p.bookId,
          start_chapter: p.startChapter,
          start_verse: p.startVerse || 1,
          end_chapter: p.endChapter,
          end_verse: p.endVerse || 0,
          is_full_chapter: p.isFullChapters || false
        }))
      });

      if (logErr) throw logErr;

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
    <Dialog open={open} onOpenChange={(v) => {
      if (!saving) onOpenChange(v);
    }}>
      <DialogContent 
        className="max-h-[95vh] max-w-lg overflow-y-auto border-border/60 bg-card/95 p-0 backdrop-blur-xl rounded-t-[2.5rem] sm:rounded-[2rem] focus-visible:outline-none"
        onPointerDownOutside={(e) => { if (saving) e.preventDefault(); }}
        onEscapeKeyDown={(e) => { if (saving) e.preventDefault(); }}
      >
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
                const book = bibleBooks.find(b => b.id === p.bookId);
                const canonBook = BIBLE_CANON.find(b => b.id === p.bookId);
                const currentChapter = canonBook?.chapters.find(c => c.chapter === p.startChapter);
                const maxVerses = currentChapter?.verses || 176;

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
                          onValueChange={(val) => {
                            const newBook = BIBLE_CANON.find(b => b.id === val);
                            updatePassage(p.id, { 
                              bookId: val, 
                              startChapter: 1, 
                              endChapter: 1,
                              startVerse: 1,
                              endVerse: newBook?.chapters[0]?.verses || 0
                            });
                          }}
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

                      <div className="col-span-12 space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="flex-1 text-[9px] text-muted-foreground uppercase">Capítulo</Label>
                          <Label className="w-20 text-[9px] text-muted-foreground uppercase">Versículos</Label>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number" 
                            min={1} 
                            max={book?.chapters || 150}
                            value={p.startChapter}
                            onChange={(e) => {
                              const ch = Number(e.target.value);
                              const chapterData = canonBook?.chapters.find(c => c.chapter === ch);
                              updatePassage(p.id, { 
                                startChapter: ch, 
                                endChapter: ch,
                                startVerse: 1,
                                endVerse: chapterData?.verses || 0
                              });
                            }}
                            className="h-9 flex-1 rounded-lg bg-background/60 text-center"
                            placeholder="Cap."
                          />
                          <div className="flex w-24 items-center gap-1">
                            <Input 
                              type="number" 
                              min={1}
                              max={maxVerses}
                              value={p.startVerse}
                              onChange={(e) => updatePassage(p.id, { startVerse: Number(e.target.value) })}
                              className="h-9 w-11 rounded-lg bg-background/60 text-center text-[10px]"
                              placeholder="Início"
                            />
                            <span className="text-muted-foreground/40">-</span>
                            <Input 
                              type="number" 
                              min={1}
                              max={maxVerses}
                              value={p.endVerse}
                              onChange={(e) => updatePassage(p.id, { endVerse: Number(e.target.value) })}
                              className="h-9 w-11 rounded-lg bg-background/60 text-center text-[10px]"
                              placeholder="Fim"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <input 
                            type="checkbox" 
                            id={`full-chapter-${p.id}`}
                            checked={p.isFullChapters}
                            onChange={(e) => updatePassage(p.id, { isFullChapters: e.target.checked })}
                            className="h-3 w-3 rounded border-border/40"
                          />
                          <Label htmlFor={`full-chapter-${p.id}`} className="text-[10px] text-muted-foreground cursor-pointer">
                            Li o capítulo inteiro
                          </Label>
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
