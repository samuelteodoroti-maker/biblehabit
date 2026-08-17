import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  ChevronRight, 
  Calendar,
  AlertCircle,
  Loader2,
  FileText
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { getUpdates } from "@/lib/updates.functions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/updates")({
  head: () => ({
    meta: [
      { title: "Novidades e Atualizações — Bible Habit" },
      { name: "description", content: "Fique por dentro das últimas melhorias e novas funcionalidades do Bible Habit." },
    ],
  }),
  component: UpdatesPage,
});

const CATEGORIES = [
  "Novidade",
  "Melhoria",
  "Correção",
  "Segurança",
  "Acessibilidade",
  "Desempenho",
  "Manutenção"
];

function UpdatesPage() {
  const [loading, setLoading] = useState(true);
  const [updates, setUpdates] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [year, setYear] = useState<number | undefined>();
  
  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const result = await getUpdates({
        search: search || undefined,
        category: category || undefined,
        year: year || undefined,
      });
      setUpdates(result.updates || []);
    } catch (e) {
      toast.error("Erro ao carregar atualizações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [search, category, year]);

  return (
    <AppShell title="Novidades" subtitle="O que há de novo no Bible Habit">
      <div className="space-y-6">
        {/* Busca e Filtros */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar novidades..." 
              className="pl-9 rounded-xl border-border/60 bg-card/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={!category ? "secondary" : "ghost"} 
              size="sm" 
              className="h-8 rounded-full text-xs"
              onClick={() => setCategory(undefined)}
            >
              Todas
            </Button>
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={category === cat ? "secondary" : "ghost"}
                size="sm"
                className="h-8 rounded-full text-xs"
                onClick={() => setCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="mt-4 text-sm">Buscando atualizações...</p>
          </div>
        ) : updates.length === 0 ? (
          <Card className="flex flex-col items-center justify-center border-dashed border-border/60 bg-transparent p-12 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground/50" />
            <h3 className="mt-4 font-display font-semibold">Nenhuma nota encontrada</h3>
            <p className="mt-1 text-sm text-muted-foreground">Tente ajustar sua busca ou filtros.</p>
            <Button 
              variant="link" 
              className="mt-2 text-primary"
              onClick={() => {
                setSearch("");
                setCategory(undefined);
              }}
            >
              Limpar filtros
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {updates.map((update, idx) => (
              <Card 
                key={update.id} 
                className={`overflow-hidden border-border/60 bg-card/70 backdrop-blur-sm transition-all hover:bg-card/90 ${idx === 0 && !search && !category ? 'ring-2 ring-primary/20' : ''}`}
              >
                <div className="p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      v{update.version}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {update.published_at && format(new Date(update.published_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  
                  <h3 className="font-display text-lg font-bold leading-tight">{update.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {update.summary}
                  </p>
                  
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {update.categories?.map((cat: string) => (
                      <Badge key={cat} variant="secondary" className="bg-primary/10 text-[9px] font-bold text-primary hover:bg-primary/20">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex items-center gap-2">
                    <Link 
                      to={`/updates/${update.slug}`}
                      className="flex-1"
                    >
                      <Button className="w-full h-10 rounded-xl gradient-primary font-semibold text-primary-foreground shadow-glow">
                        Ver atualização
                      </Button>
                    </Link>
                    
                    <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-xl border-border/60 bg-card/50">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
