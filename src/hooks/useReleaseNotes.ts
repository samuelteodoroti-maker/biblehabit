import { useCallback, useEffect, useState } from "react";
import {
  APP_VERSION,
  LAST_SEEN_VERSION_KEY,
  getLatestRelease,
  hasUnseenRelease,
} from "@/data/releaseNotes";

function readLastSeen(): string | null {
  try {
    return window.localStorage.getItem(LAST_SEEN_VERSION_KEY);
  } catch {
    return null;
  }
}

function writeLastSeen(version: string) {
  try {
    window.localStorage.setItem(LAST_SEEN_VERSION_KEY, version);
  } catch {
    /* armazenamento indisponível: apenas ignora */
  }
}

/**
 * Controla o indicador "Novo" e a exibição única do aviso de nova versão.
 * Sem SSR: só decide após a hidratação para evitar divergências de render.
 */
export function useReleaseNotes() {
  const [ready, setReady] = useState(false);
  const [unseen, setUnseen] = useState(false);

  useEffect(() => {
    setUnseen(hasUnseenRelease(readLastSeen()));
    setReady(true);
  }, []);

  const markSeen = useCallback(() => {
    writeLastSeen(APP_VERSION);
    setUnseen(false);
  }, []);

  return {
    ready,
    /** true quando a versão atual ainda não foi visualizada */
    hasUnseen: ready && unseen,
    latest: getLatestRelease(),
    version: APP_VERSION,
    markSeen,
  };
}
