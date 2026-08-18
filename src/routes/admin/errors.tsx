import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AdminLayout } from "@/components/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { getSystemErrors } from "@/lib/system-errors.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/errors")({
  component: AdminErrorsPage,
});

function AdminErrorsPage() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<any[]>([]);

  useEffect(() => {
    const fetchErrors = async () => {
      try {
        const result = await getSystemErrors({ data: { limit: 50, offset: 0 } });
        setErrors(result.errors || []);
      } catch (err) {
        console.error("Erro ao buscar logs:", err);
      } finally {
        setLoading(false);
      }
    };
    if (isAdmin) fetchErrors();
  }, [isAdmin]);

  if (!isAdmin) {
    return <div>Acesso negado</div>;
  }

  return (
    <AppShell title="Logs do Sistema" subtitle="Auditoria e erros">
      <AdminLayout>
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : errors.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground opacity-20" />
              <p className="mt-4 text-muted-foreground">Nenhum log encontrado.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {errors.map((error) => (
                <Card key={error.id} className="p-4 bg-card/50 border-border/40">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold">
                          {error.action || "Log"}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(error.created_at), "dd MMM HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{error.details || "Sem detalhes"}</p>
                      {error.metadata && (
                        <pre className="mt-2 text-[10px] bg-black/20 p-2 rounded overflow-x-auto">
                          {JSON.stringify(error.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </AdminLayout>
    </AppShell>
  );
}
