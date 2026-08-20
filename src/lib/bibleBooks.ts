import { BIBLE_CANON } from "./bible-canon";

export type BibleTestament = "Antigo Testamento" | "Novo Testamento";
export type BibleDivision = 
  | "Pentateuco" 
  | "Históricos" 
  | "Poéticos" 
  | "Profetas Maiores" 
  | "Profetas Menores" 
  | "Evangelhos" 
  | "Histórico" 
  | "Cartas Paulinas" 
  | "Cartas Gerais" 
  | "Revelação";

export interface BibleBook {
  id: string;
  name: string;
  alternatives?: string[];
  chapters: number;
  testament: BibleTestament;
  division: BibleDivision;
  order: number;
}

/**
 * Mapeia o BIBLE_CANON para a estrutura bibleBooks usada na UI.
 * Mantém a ordem canônica e os nomes originais.
 */
export const bibleBooks: BibleBook[] = BIBLE_CANON.map((book, index) => ({
  id: book.id,
  name: book.name,
  chapters: book.chapters.length,
  testament: book.testament === "AT" ? "Antigo Testamento" : "Novo Testamento",
  division: book.division as BibleDivision,
  order: index + 1,
  // Mantemos alguns nomes alternativos comuns se necessário
  ...(book.id === "SNG" ? { alternatives: ["Cântico dos Cânticos"] } : {}),
  ...(book.id === "ACT" ? { alternatives: ["Atos dos Apóstolos"] } : {}),
}));

export function getBibleBook(query: string): BibleBook | undefined {
  const normalized = query.toLowerCase().trim();
  return bibleBooks.find(b => 
    b.id.toLowerCase() === normalized || 
    b.name.toLowerCase() === normalized || 
    b.alternatives?.some(a => a.toLowerCase() === normalized)
  );
}

export function getChaptersBetween(fromIdx: number, toIdx: number): number {
  if (fromIdx < 0 || toIdx < 0 || fromIdx > toIdx) return 0;
  let total = 0;
  for (let i = fromIdx; i <= toIdx; i++) total += bibleBooks[i].chapters;
  return total;
}

