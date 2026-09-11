import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bug,
  HandHeart,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { APP_VERSION_LABEL, getReleaseHistory, type ReleaseNote } from "@/data/releaseNotes";
import { useReleaseNotes } from "@/hooks/useReleaseNotes";

export const Route = createFileRoute("/novidades")({
  head: () => ({
    meta: [
      { title: "Novidades e atualizações — Bible Habit" },
      {
        name: "description",
        content:
          "Histórico completo de versões do Bible Habit: novos recursos, melhorias, correções e mudanças de segurança em cada atualização.",
      },
      { property: "og:title", content: "Novidades e atualizações — Bible Habit" },
      {
        property: "og:description",
        content:
          "Veja o que foi adicionado, corrigido e melhorado em cada versão do Bible Habit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReleaseNotesPage,
});

function formatDate(date: string) {
  const [year, month, day] = date.split("-").map((n) => Number.parseInt(n, 10));
  if (!year || !month || !day) return date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

const SECTIONS: Array<{
  key: keyof Pick<ReleaseNote, "features" | "improvements" | "fixes" | "security">;
  label: string;
  icon: typeof Sparkles;
}> = [
  { key: "features", label: "Novos recursos", icon: Sparkles },
  { key: "improvements", label: "Melhorias", icon: TrendingUp },
  { key: "fixes", label: "Correções", icon: Bug },
  { key: "security", label: "Segurança", icon: Shield },
];

function ReleaseNotesPage() {
  const releases = getReleaseHistory();
  const { markSeen } = useReleaseNotes();

  // Visitar a página conta como "visualizou a versão atual".
  useEffect(() => {
    markSeen();
  }, [markSeen]);

  return (
    <AppShell
      title="Novidades e atualizações"
      subtitle="Tudo o que foi adicionado, corrigido e melhorado no Bible Habit"
    >
      <div className="mx-auto w-full max-w-3xl space-y-5 pb-10">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Cada versão publicada aparece aqui, da mais recente para a mais antiga. O histórico é
          permanente e nunca é apagado.
        </p>

        <ol className="space-y-5" aria-label="Histórico de versões">
          {releases.map((release, index) => (
            <li key={release.version}>
              <Card className="border-border/60 bg-card/70 p-5 backdrop-blur-sm sm:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="rounded-full font-bold">
                    v{release.version}
                  </Badge>
                  {index === 0 && (
                    <Badge className="rounded-full">Versão atual</Badge>
                  )}
                  <span className="text-xs font-medium text-muted-foreground">
                    <time dateTime={release.date}>{formatDate(release.date)}</time>
                  </span>
                </div>

                <h2 className="mt-3 font-serif-title text-lg font-bold tracking-tight sm:text-xl">
                  {release.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {release.summary}
                </p>

                <div className="mt-5 space-y-5">
                  {SECTIONS.map(({ key, label, icon: Icon }) => {
                    const items = release[key];
                    if (!items || items.length === 0) return null;
                    return (
                      <section key={key} aria-label={`${label} — versão ${release.version}`}>
                        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                          {label}
                        </h3>
                        <ul className="mt-2 space-y-1.5">
                          {items.map((item) => (
                            <li
                              key={item}
                              className="flex gap-2 text-sm leading-relaxed text-foreground/90"
                            >
                              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    );
                  })}
                </div>
              </Card>
            </li>
          ))}
        </ol>

        <Card className="border-border/60 bg-card/70 p-5 text-center backdrop-blur-sm sm:p-6">
          <p className="text-sm text-muted-foreground">{APP_VERSION_LABEL}</p>
          <Button asChild variant="outline" className="mt-4 h-11 gap-2 rounded-xl">
            <Link to="/apoie">
              <HandHeart className="h-4 w-4" aria-hidden="true" /> Apoie este app
            </Link>
          </Button>
        </Card>
      </div>
    </AppShell>
  );
}
