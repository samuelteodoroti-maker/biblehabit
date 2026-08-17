import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Download, 
  Eye, 
  Calendar,
  Shield,
  Accessibility,
  PlusCircle,
  ArrowUpCircle,
  Wrench,
  CheckCircle2,
  Trash2,
  HelpCircle,
  MessageCircle,
  FileText
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { getUpdateBySlug } from "@/lib/updates.functions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { getVersionWhatsAppUrl } from "@/lib/app-utils";

export const Route = createFileRoute("/updates/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Atualização ${params.slug} — Bible Habit` },
    ],
  }),
  component: UpdateDetailPage,
});

function UpdateDetailPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [update, setUpdate] = useState<any>(null);

  useEffect(() => {
    const fetchUpdate = async () => {
      setLoading(true);
      try {
        const data = await getUpdateBySlug({ data: { slug } });
        if (!data) {
          toast.error("Atualização não encontrada");
          navigate({ to: "/updates" });
          return;
        }
        setUpdate(data);
      } catch (e) {
        toast.error("Erro ao carregar detalhes");
      } finally {
        setLoading(false);
      }
    };
    fetchUpdate();
  }, [slug]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-pulse rounded-full gradient-primary" />
        </div>
      </AppShell>
    );
  }

  const waUrl = getVersionWhatsAppUrl(update.version);

  return (
    <AppShell 
      hero={
        <Link to="/updates" className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-3.5 w-3.5" /> Voltar para novidades
        </Link>
      }
    >
      <div className="space-y-6">
        <header>
          <div className="mb-3 flex items-center justify-between">
            <Badge variant="outline" className="border-primary/30 text-[10px] font-bold tracking-wider text-primary">
              VERSÃO {update.version}
            </Badge>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
              <Calendar className="h-3 w-3" />
              {update.published_at && format(new Date(update.published_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold leading-tight tracking-tight">{update.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {update.summary}
          </p>
        </header>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2 rounded-xl border-border/60 bg-card/50 text-xs">
            <Download className="h-3.5 w-3.5" /> PDF da versão
          </Button>
          <a href={waUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="h-9 gap-2 rounded-xl border-border/60 bg-card/50 text-xs">
              <MessageCircle className="h-3.5 w-3.5" /> Suporte WhatsApp
            </Button>
          </a>
        </div>

        {update.cover_image_url && (
          <div className="overflow-hidden rounded-2xl border border-border/60 shadow-lg">
            <img src={update.cover_image_url} alt={update.title} className="w-full object-cover" />
          </div>
        )}

        <div className="space-y-8 py-4">
          {/* Novidades */}
          {update.highlights?.length > 0 && (
            <Section icon={<PlusCircle className="h-4 w-4 text-green-500" />} title="Novidades" items={update.highlights} />
          )}

          {/* Melhorias */}
          {update.improvements?.length > 0 && (
            <Section icon={<ArrowUpCircle className="h-4 w-4 text-blue-500" />} title="Melhorias" items={update.improvements} />
          )}

          {/* Correções */}
          {update.fixes?.length > 0 && (
            <Section icon={<CheckCircle2 className="h-4 w-4 text-orange-500" />} title="Correções" items={update.fixes} />
          )}

          {/* Acessibilidade */}
          {update.accessibility_changes?.length > 0 && (
            <Section icon={<Accessibility className="h-4 w-4 text-purple-500" />} title="Acessibilidade" items={update.accessibility_changes} />
          )}
        </div>

        <Separator className="bg-border/60" />

        <div className="rounded-2xl bg-primary/5 p-6 border border-primary/10">
          <div className="flex items-start gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/20 text-primary">
              <HelpCircle className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold">Precisa de ajuda com esta versão?</h4>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Se encontrou algum problema ou tem sugestões para a versão {update.version}, fale conosco.
              </p>
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block">
                <Button size="sm" className="h-8 rounded-lg gradient-primary text-[10px] font-bold">
                  Contatar Suporte
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Section({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/80">{title}</h2>
      </div>
      <ul className="space-y-3 pl-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
            <div className="mt-2 h-1 w-1 shrink-0 rounded-full bg-border" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
