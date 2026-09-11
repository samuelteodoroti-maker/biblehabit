import { useCallback, useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type InstallMode = "unsupported" | "available" | "ios" | "installed";

function isStandalone() {
  if (typeof window === "undefined") return false;
  const iosStandalone = (window.navigator as any).standalone === true;
  return iosStandalone || window.matchMedia?.("(display-mode: standalone)").matches === true;
}

function isIosSafariLike() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  return iOS;
}

/**
 * Estado de instalação do PWA.
 * - "installed": já instalado / rodando em modo standalone.
 * - "available": o navegador ofereceu beforeinstallprompt.
 * - "ios": iPhone/iPad — instruções manuais (Safari não expõe o evento).
 * - "unsupported": mostrar apenas orientação, sem botão que não funciona.
 */
export function usePwaInstall() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setInstalled(isStandalone());
    setIos(isIosSafariLike());

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };
    const media = window.matchMedia?.("(display-mode: standalone)");
    const onDisplayChange = (e: MediaQueryListEvent) => setInstalled(e.matches);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    media?.addEventListener?.("change", onDisplayChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      media?.removeEventListener?.("change", onDisplayChange);
    };
  }, []);

  const install = useCallback(async () => {
    if (!prompt) return "dismissed" as const;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    setPrompt(null);
    if (outcome === "accepted") setInstalled(true);
    return outcome;
  }, [prompt]);

  const mode: InstallMode = !hydrated
    ? "unsupported"
    : installed
      ? "installed"
      : prompt
        ? "available"
        : ios
          ? "ios"
          : "unsupported";

  return { mode, install, hydrated };
}
