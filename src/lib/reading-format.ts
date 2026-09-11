import { getBibleBook } from "@/lib/bibleBooks";

export type PassageLike = {
  book_id: string;
  start_chapter: number;
  start_verse?: number | null;
  end_chapter?: number | null;
  end_verse?: number | null;
  is_full_chapter?: boolean | null;
};

const DASH = "–";

/**
 * Formata uma passagem no padrão "Gênesis 1:1–10".
 * Nunca acessa propriedades de valores indefinidos.
 */
export function formatPassage(passage: PassageLike | null | undefined): string {
  if (!passage || typeof passage.book_id !== "string") return "Leitura registrada";

  const book = getBibleBook(passage.book_id);
  const name = book?.name ?? passage.book_id;

  const startChapter = Number(passage.start_chapter) || 1;
  const endChapter = Number(passage.end_chapter) || startChapter;
  const startVerse = Number(passage.start_verse) || 0;
  const endVerse = Number(passage.end_verse) || 0;
  const fullChapter = !!passage.is_full_chapter || startVerse <= 0;

  if (startChapter === endChapter) {
    if (fullChapter) return `${name} ${startChapter}`;
    if (endVerse > startVerse) return `${name} ${startChapter}:${startVerse}${DASH}${endVerse}`;
    return `${name} ${startChapter}:${startVerse}`;
  }

  if (fullChapter) return `${name} ${startChapter}${DASH}${endChapter}`;
  const tail = endVerse > 0 ? `:${endVerse}` : "";
  return `${name} ${startChapter}:${startVerse}${DASH}${endChapter}${tail}`;
}

/** Junta todas as passagens de um registro: "Gênesis 1:1–10, João 3:16". */
export function formatLogPassages(
  passages: PassageLike[] | null | undefined,
  fallback = "Leitura registrada",
): string {
  if (!Array.isArray(passages) || passages.length === 0) return fallback;
  return passages.map(formatPassage).join(", ");
}

/** Data civil YYYY-MM-DD -> 11/09/2026 (sem depender do fuso do navegador). */
export function formatDateBR(dateKey: string | null | undefined): string {
  if (typeof dateKey !== "string") return "";
  const [y, m, d] = dateKey.split("-");
  if (!y || !m || !d) return dateKey;
  return `${d}/${m}/${y}`;
}

/** Linha completa do histórico: "Gênesis 1:1–10 — 11/09/2026". */
export function formatLogLine(log: {
  reading_date: string;
  reading_passages?: PassageLike[] | null;
}): string {
  return `${formatLogPassages(log.reading_passages)} — ${formatDateBR(log.reading_date)}`;
}
