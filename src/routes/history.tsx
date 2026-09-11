import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Trash2, Loader2 } from "lucide-react";
import { useReadingData } from "@/hooks/useReadingData";
import { formatLogLine } from "@/lib/reading-format";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Histórico de leituras — Bible Habit" },
      { name: "description", content: "Veja todos os seus registros de leitura bíblica por data e passagem." },
      { property: "og:title", content: "Histórico de leituras — Bible Habit" },
      { property: "og:description", content: "Todos os seus registros de leitura bíblica, por data e passagem." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { recentLogs, refresh, loading } = useReadingData();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;
    setDeletingId(id);
    const { error } = await supabase.from("reading_logs").delete().eq("id", id);
    setDeletingId(null);
    if (error) {
      toast.error("Não foi possível excluir o registro. Tente novamente.");
      return;
    }
    toast.success("Registro excluído");
    refresh();
  };

  return (
    <AppShell title="Histórico" subtitle="Suas leituras registradas">
      <div className="space-y-4 pb-24">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        ) : recentLogs.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Nenhuma leitura registrada ainda.
          </div>
        ) : (
          recentLogs.map((log) => (
            <Card key={log.id} className="border-border/40 bg-card/40 p-4 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <h4 className="font-display text-sm font-bold leading-snug">
                    {formatLogLine(log)}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <BookOpen className="h-3 w-3" aria-hidden="true" />
                    {log.chapters_count} {log.chapters_count === 1 ? "capítulo" : "capítulos"}
                  </div>
                  {log.notes && (
                    <p className="pt-1 text-[11px] italic text-muted-foreground">"{log.notes}"</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-destructive"
                  onClick={() => handleDelete(log.id)}
                  disabled={deletingId === log.id}
                  aria-label="Excluir registro"
                >
                  {deletingId === log.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </AppShell>
  );
}
