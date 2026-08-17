import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Loader2, BookOpenCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useReadingData } from "@/hooks/useReadingData";

const FREE = "__free__";

type Plan = { id: string; title: string };

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string;
  today: string;
  onSaved?: () => void;
};

export function LogReadingModal({ open, onOpenChange, userId, today, onSaved }: Props) {
  const { activePlan } = useReadingData();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planId, setPlanId] = useState<string>(FREE);
  const [chapters, setChapters] = useState(1);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setChapters(1);
    setNotes("");
    
    // Default to active plan from hook if available
    if (activePlan) {
      setPlanId(activePlan.id);
    } else {
      setPlanId(FREE);
    }

    (async () => {
      const { data } = await supabase
        .from("reading_plans")
        .select("id, title")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });
      const planList = (data as Plan[]) ?? [];
      setPlans(planList);
    })();
  }, [open, userId, activePlan]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("reading_logs").insert({
      user_id: userId,
      reading_date: today,
      chapters_count: Math.max(1, chapters),
      plan_id: planId === FREE ? null : planId,
      notes: notes.trim() ? notes.trim() : null,
    });
    if (error) {
      setSaving(false);
      toast.error(error.message);
      return;
    }
    if (planId !== FREE) {
      const { data: plan } = await supabase
        .from("reading_plans")
        .select("completed_days")
        .eq("id", planId)
        .maybeSingle();
      if (plan) {
        await supabase
          .from("reading_plans")
          .update({ completed_days: (plan.completed_days ?? 0) + 1 })
          .eq("id", planId);
      }
    }
    setSaving(false);
    onOpenChange(false);
    toast.success("Leitura registrada! 🔥");
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border/60 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Registrar leitura</DialogTitle>
          <DialogDescription>Marque sua leitura de hoje e mantenha a ofensiva.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Qual plano você está lendo?
            </Label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger className="rounded-xl" aria-label="Selecionar plano de leitura">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FREE}>Leitura Livre</SelectItem>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Quantos capítulos você leu hoje?
            </Label>
            <div className="flex items-center justify-center gap-4 rounded-2xl border border-border/60 bg-background/40 p-3">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-10 w-10 rounded-full"
                onClick={() => setChapters((c) => Math.max(1, c - 1))}
                disabled={chapters <= 1}
                aria-label="Diminuir quantidade de capítulos"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="min-w-16 text-center font-display text-4xl font-bold gradient-text" aria-live="polite">
                {chapters}
              </span>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-10 w-10 rounded-full"
                onClick={() => setChapters((c) => c + 1)}
                aria-label="Aumentar quantidade de capítulos"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Anotações{" "}
              <span className="normal-case tracking-normal text-muted-foreground/70">
                (opcional)
              </span>
            </Label>
            <Textarea
              placeholder="O que você aprendeu hoje?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none rounded-xl"
              aria-label="Anotações sobre a leitura"
            />
          </div>

          <Button
            size="lg"
            className="h-12 w-full gap-2 rounded-2xl gradient-primary text-base font-semibold text-primary-foreground shadow-glow hover:brightness-110"
            disabled={saving}
            onClick={save}
            aria-label="Salvar registro de leitura"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <BookOpenCheck className="h-5 w-5" />}
            {saving ? "Salvando..." : "Salvar leitura"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
