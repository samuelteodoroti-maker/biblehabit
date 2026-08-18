import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Calendar, BookOpen, Trash2, Edit2 } from "lucide-react";
import { useReadingData } from "@/hooks/useReadingData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getBibleBook } from "@/lib/bibleBooks";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const { recentLogs, refresh, loading } = useReadingData();

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;
    const { error } = await supabase.from("reading_logs").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir registro");
    } else {
      toast.success("Registro excluído");
      refresh();
    }
  };

  return (
    <AppShell title="Histórico" subtitle="Suas leituras passadas">
      <div className="space-y-4 pb-24">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : recentLogs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Nenhuma leitura registrada.</div>
        ) : (
          recentLogs.map((log) => (
            <Card key={log.id} className="border-border/40 bg-card/40 p-4 backdrop-blur-sm">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(log.reading_date + 'T12:00:00'), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                  </div>
                  <h4 className="font-display text-sm font-bold">
                    {log.reading_passages.map((p: any, i: number) => {
                      const book = getBibleBook(p.book_id);
                      return `${book?.name} ${p.start_chapter}${p.start_chapter !== p.end_chapter ? '-' + p.end_chapter : ''}${i < log.reading_passages.length - 1 ? ', ' : ''}`;
                    })}
                  </h4>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {log.chapters_count} caps</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(log.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </AppShell>
  );
}