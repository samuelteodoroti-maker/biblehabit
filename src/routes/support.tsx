import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { MessageCircle, HelpCircle, ChevronRight, MessageSquare, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getWhatsAppUrl, SUPPORT_WHATSAPP_DISPLAY } from "@/lib/app-utils";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Suporte — Bible Habit" },
      { name: "description", content: "Central de suporte do Bible Habit. Fale conosco pelo WhatsApp." },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  const waUrl = getWhatsAppUrl();

  return (
    <AppShell title="Central de Suporte" subtitle="Como podemos ajudar você hoje?">
      <div className="space-y-6">
        <Card className="overflow-hidden border-border/60 bg-card/70 p-6 backdrop-blur-sm">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
              <MessageCircle className="h-8 w-8" />
            </div>
            <h2 className="font-display text-xl font-semibold">Atendimento via WhatsApp</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Nossa equipe está pronta para tirar suas dúvidas e ajudar com qualquer problema técnico.
            </p>
            
            <div className="mt-6 w-full space-y-3">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageSquare className="h-5 w-5" />
                Falar com suporte
              </a>
              
              <div className="rounded-xl bg-accent/50 py-3">
                <p className="text-xs font-medium text-muted-foreground">Número oficial</p>
                <p className="font-display font-bold tracking-wide">{SUPPORT_WHATSAPP_DISPLAY}</p>
              </div>
            </div>

            <p className="mt-4 text-[10px] text-muted-foreground">
              Ao continuar, você será direcionado ao WhatsApp. O atendimento ocorrerá fora do Bible Habit.
            </p>
          </div>
        </Card>

        <div className="space-y-3">
          <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Links rápidos</h3>
          <Card className="divide-y divide-border/60 border-border/60 bg-card/70 backdrop-blur-sm">
            <Link
              to="/updates"
              className="flex items-center justify-between p-4 transition-colors hover:bg-accent/50"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Novidades e Atualizações</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            
            <a
              href="https://biblehabit.lovable.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 transition-colors hover:bg-accent/50"
            >
              <div className="flex items-center gap-3">
                <ExternalLink className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Site Oficial</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </a>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
