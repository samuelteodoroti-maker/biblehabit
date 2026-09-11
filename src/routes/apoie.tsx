import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  Copy,
  Download,
  HandHeart,
  Heart,
  Share2,
  ShieldAlert,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { usePwaInstall } from "@/hooks/usePwaInstall";

const PIX_KEY = "db6c4642-a7da-4a38-968c-8583cf07e05d";
const APP_URL = "https://biblehabit.lovable.app";
const APP_DESCRIPTION =
  "Registre suas leituras bíblicas, acompanhe seu progresso e crie constância na Palavra.";

export const Route = createFileRoute("/apoie")({
  head: () => ({
    meta: [
      { title: "Apoie o Bible Habit — contribua via Pix" },
      {
        name: "description",
        content:
          "Contribua voluntariamente com qualquer valor para manter e aprimorar o Bible Habit. Todos os recursos continuam gratuitos.",
      },
      { property: "og:title", content: "Apoie o Bible Habit" },
      {
        property: "og:description",
        content:
          "Contribuição voluntária via Pix para manter e aprimorar o Bible Habit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SupportProjectPage,
});

async function copyText(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fallback below */
  }
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "true");
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

function SupportProjectPage() {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [installMessage, setInstallMessage] = useState("");
  const { mode: installMode, install } = usePwaInstall();


  const handleCopyPix = async () => {
    const ok = await copyText(PIX_KEY);
    if (!ok) {
      toast.error("Não foi possível copiar. Selecione a chave manualmente.");
      return;
    }
    setCopied(true);
    toast.success("Chave Pix copiada");
    window.setTimeout(() => setCopied(false), 4000);
  };

  const handleCopyLink = async () => {
    const ok = await copyText(APP_URL);
    if (!ok) {
      toast.error("Não foi possível copiar o link agora.");
      return;
    }
    setLinkCopied(true);
    toast.success("Link copiado com sucesso");
    window.setTimeout(() => setLinkCopied(false), 4000);
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Bible Habit",
          text: APP_DESCRIPTION,
          url: APP_URL,
        });
        return;
      } catch {
        return;
      }
    }
    await handleCopyLink();
  };

  const handleInstall = async () => {
    const outcome = await install();
    if (outcome === "accepted") {
      setInstallMessage("Aplicativo instalado com sucesso");
      toast.success("Bible Habit instalado com sucesso");
    } else {
      setInstallMessage("");
    }
  };


  return (
    <AppShell title="Apoie este app" subtitle="Contribuição voluntária para o projeto">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <Card className="border-border/60 bg-card/70 p-6 backdrop-blur-sm sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl gradient-primary shadow-glow">
              <HandHeart className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Apoie o Bible Habit
            </h1>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            O Bible Habit é um projeto criado para incentivar a prática e a constância na leitura
            bíblica. Nosso propósito é ajudar mais pessoas a desenvolverem o hábito de estar
            diariamente em contato com a Palavra de Deus.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Se este aplicativo tem ajudado você e você deseja apoiar sua continuidade, é possível
            contribuir com qualquer valor. As doações serão utilizadas para ajudar a manter e
            aprimorar o projeto, além de viabilizar sua futura publicação na App Store e na Google
            Play.
          </p>
          <div className="mt-5 rounded-2xl border border-primary/15 bg-primary/5 p-4">
            <p className="text-sm font-medium text-primary">
              A contribuição é totalmente voluntária. Todos os recursos principais do Bible Habit
              continuam disponíveis independentemente de qualquer doação.
            </p>
          </div>
        </Card>

        <Card className="border-primary/25 bg-card/80 p-6 backdrop-blur-sm sm:p-8">
          <h2 className="font-display text-xl font-bold tracking-tight">Contribua via Pix</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Você pode contribuir com qualquer valor.
          </p>

          <div className="mt-5 rounded-2xl border border-border/60 bg-accent/40 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Chave Pix aleatória
            </p>
            <p className="mt-2 break-all font-mono text-sm text-foreground sm:text-base">
              {PIX_KEY}
            </p>
          </div>

          <div className="mt-5">
            <Button className="h-12 w-full gap-2 rounded-xl" onClick={handleCopyPix}>
              {copied ? (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" /> Chave Pix copiada
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" aria-hidden="true" /> Copiar chave Pix
                </>
              )}
            </Button>
          </div>
          <p aria-live="polite" className="mt-3 min-h-[1rem] text-xs font-medium text-primary">
            {copied ? "Chave Pix copiada" : ""}
          </p>

          <Separator className="my-5 bg-border/60" />

          <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/40 p-4">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Antes de concluir a transferência, confira no aplicativo do seu banco se os dados do
              destinatário estão corretos.
            </p>
          </div>
        </Card>

        <Card className="border-border/60 bg-card/80 p-6 backdrop-blur-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10">
              <Share2 className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <h2 className="font-display text-xl font-bold tracking-tight">
              Compartilhe o Bible Habit
            </h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Você também pode apoiar este projeto compartilhando o Bible Habit com amigos, familiares
            e pessoas que desejam criar o hábito da leitura bíblica.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button className="h-12 flex-1 gap-2 rounded-xl" onClick={handleShare}>
              <Share2 className="h-4 w-4" aria-hidden="true" /> Compartilhar o app
            </Button>
            <Button
              variant="outline"
              className="h-12 flex-1 gap-2 rounded-xl"
              onClick={handleCopyLink}
            >
              {linkCopied ? (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" /> Link copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" aria-hidden="true" /> Copiar link
                </>
              )}
            </Button>
          </div>
          <p aria-live="polite" role="status" className="mt-3 min-h-[1rem] text-xs font-medium text-primary">
            {linkCopied ? "Link copiado com sucesso" : ""}
          </p>
        </Card>

        <Card className="border-primary/25 bg-card/80 p-6 backdrop-blur-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10">
              <Smartphone className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <h2 className="font-display text-xl font-bold tracking-tight">Instale o aplicativo</h2>
          </div>
          <p className="mt-3 font-display text-lg font-semibold">
            Tenha o Bible Habit sempre com você
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Instale o Bible Habit diretamente pelo navegador e acesse o aplicativo como se ele
            estivesse instalado no seu celular ou computador.
          </p>

          <div className="mt-5">
            {installMode === "installed" ? (
              <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <p className="text-sm font-medium text-primary">
                  O Bible Habit já está instalado neste dispositivo.
                </p>
              </div>
            ) : installMode === "available" ? (
              <Button className="h-12 w-full gap-2 rounded-xl" onClick={handleInstall}>
                <Download className="h-4 w-4" aria-hidden="true" /> Instalar aplicativo
              </Button>
            ) : installMode === "ios" ? (
              <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
                <p className="text-sm text-muted-foreground">
                  Abra o menu Compartilhar do Safari e selecione “Adicionar à Tela de Início”.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
                <p className="text-sm text-muted-foreground">
                  Seu navegador ainda não oferece instalação automática. Você pode instalar usando o
                  menu do navegador (Chrome ou Edge, opção “Instalar aplicativo”) ou salvar este
                  endereço nos favoritos para acesso rápido.
                </p>
              </div>
            )}
          </div>
          <p aria-live="polite" role="status" className="mt-3 min-h-[1rem] text-xs font-medium text-primary">
            {installMessage}
          </p>
        </Card>

        <Card className="border-border/60 bg-card/70 p-6 text-center backdrop-blur-sm sm:p-8">
          <Heart className="mx-auto mb-3 h-6 w-6 text-primary" aria-hidden="true" />
          <p className="font-serif text-base italic leading-relaxed text-foreground sm:text-lg">
            Obrigado por caminhar conosco e ajudar mais pessoas a criarem constância na leitura da
            Bíblia.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
