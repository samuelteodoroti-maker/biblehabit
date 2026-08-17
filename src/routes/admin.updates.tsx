import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  LayoutDashboard, 
  Settings as SettingsIcon, 
  Eye, 
  Edit, 
  Trash2, 
  Loader2, 
  Search,
  CheckCircle2,
  Clock,
  FileText
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUpdates } from "@/lib/updates.functions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/updates")({
  component: AdminUpdatesPage,
});

function AdminUpdatesPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error("Acesso restrito a administradores");
      navigate({ to: "/" });
    }
  }, [isAdmin, authLoading, navigate]);

  const fetchAllUpdates = async () => {
    setLoading(true);
    try {
      // In a real admin view, we'd want to see all statuses
      const result = await getUpdates({ 
        data: { 
          status: undefined, // Handled by server function if we want to bypass default 'published'
          search: search || undefined
        } 
      });
      setUpdates(result.updates || []);
    } catch (e) {
      toast.error("Erro ao carregar atualizações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchAllUpdates();
  }, [isAdmin, search]);

  if (authLoading || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AppShell title="Painel Admin" subtitle="Gerenciar Notas de Atualização">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar notas..." 
              className="pl-9 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button className="rounded-xl gradient-primary gap-2 font-semibold shadow-glow">
            <Plus className="h-4 w-4" />
            Nova Nota
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {updates.map((update) => (
              <Card key={update.id} className="p-4 border-border/60 bg-card/60 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-primary">v{update.version}</span>
                      <Badge 
                        variant="secondary" 
                        className={`text-[8px] h-4 font-bold uppercase ${
                          update.status === 'published' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        }`}
                      >
                        {update.status === 'published' ? 'Publicado' : 'Rascunho'}
                      </Badge>
                    </div>
                    <h3 className="font-display font-bold truncate">{update.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{update.summary}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link to="/updates/$slug" params={{ slug: update.slug }}>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-primary">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            
            {updates.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto opacity-20 mb-4" />
                <p>Nenhuma nota de atualização encontrada.</p>
              </div>
            )}
          </div>
        )}

        <div className="pt-6 border-t border-border/40">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Publicadas</p>
                  <p className="text-2xl font-bold">{updates.filter(u => u.status === 'published').length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-muted/50 border-border/60">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rascunhos</p>
                  <p className="text-2xl font-bold">{updates.filter(u => u.status !== 'published').length}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
