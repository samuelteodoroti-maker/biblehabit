import { BIBLE_CANON, BibleBook, TOTAL_VERSES } from "./bible-canon";

export interface Passage {
  book_id: string;
  start_chapter: number;
  start_verse: number;
  end_chapter: number;
  end_verse: number;
  is_full_chapter: boolean;
}

export interface DetailedCoverage {
  totalUnique: number;
  totalActivity: number;
  percentage: number;
  byTestament: Record<string, { unique: number, total: number, percent: number }>;
  byDivision: Record<string, { unique: number, total: number, percent: number }>;
  byBook: Record<string, { unique: number, total: number, percent: number, chaptersCompleted: number }>;
}

export function calculateBibleCoverage(passages: Passage[]): DetailedCoverage {
  const uniqueVerses = new Set<string>();
  let totalActivity = 0;

  passages.forEach(p => {
    const book = BIBLE_CANON.find(b => b.id === p.book_id);
    if (!book) return;

    const startChapter = p.start_chapter;
    const endChapter = p.end_chapter;
    
    for (let c = startChapter; c <= endChapter; c++) {
      const ch = book.chapters.find(chapter => chapter.chapter === c);
      if (!ch) continue;
      
      let sv = 1;
      let ev = ch.verses;
      
      if (p.is_full_chapter) {
        // Already defaults to 1 and ch.verses
      } else {
        if (c === startChapter) sv = p.start_verse || 1;
        if (c === endChapter) ev = p.end_verse === 0 ? ch.verses : Math.min(p.end_verse, ch.verses);
      }
      
      for (let v = sv; v <= ev; v++) {
        uniqueVerses.add(`${p.book_id}:${c}:${v}`);
        totalActivity++;
      }
    }
  });

  const stats: DetailedCoverage = {
    totalUnique: uniqueVerses.size,
    totalActivity,
    percentage: (uniqueVerses.size / TOTAL_VERSES) * 100,
    byTestament: {},
    byDivision: {},
    byBook: {}
  };

  // Inicializar totais canônicos e divisões específicas solicitadas
  const divisions = [
    "Pentateuco", "Históricos", "Poéticos", "Profetas Maiores", "Profetas Menores",
    "Evangelhos", "Histórico", "Cartas Paulinas", "Cartas Gerais", "Revelação"
  ];

  BIBLE_CANON.forEach(book => {
    const bookTotal = book.chapters.reduce((acc, c) => acc + c.verses, 0);
    
    if (!stats.byTestament[book.testament]) {
      stats.byTestament[book.testament] = { unique: 0, total: 0, percent: 0 };
    }
    stats.byTestament[book.testament].total += bookTotal;

    if (!stats.byDivision[book.division]) {
      stats.byDivision[book.division] = { unique: 0, total: 0, percent: 0 };
    }
    stats.byDivision[book.division].total += bookTotal;

    stats.byBook[book.id] = { unique: 0, total: bookTotal, percent: 0, chaptersCompleted: 0 };
  });

  // Contar lidos
  uniqueVerses.forEach(verseKey => {
    const [bookId, chapter, verse] = verseKey.split(":");
    const book = BIBLE_CANON.find(b => b.id === bookId)!;
    
    stats.byBook[bookId].unique++;
    stats.byTestament[book.testament].unique++;
    stats.byDivision[book.division].unique++;
  });

  // Calcular porcentagens e capítulos completados
  Object.keys(stats.byTestament).forEach(k => {
    stats.byTestament[k].percent = (stats.byTestament[k].unique / stats.byTestament[k].total) * 100;
  });
  Object.keys(stats.byDivision).forEach(k => {
    stats.byDivision[k].percent = (stats.byDivision[k].unique / stats.byDivision[k].total) * 100;
  });
  Object.keys(stats.byBook).forEach(id => {
    const bStats = stats.byBook[id];
    bStats.percent = (bStats.unique / bStats.total) * 100;
    
    const book = BIBLE_CANON.find(b => b.id === id)!;
    book.chapters.forEach(ch => {
      let allVersesRead = true;
      for (let v = 1; v <= ch.verses; v++) {
        if (!uniqueVerses.has(`${id}:${ch.chapter}:${v}`)) {
          allVersesRead = false;
          break;
        }
      }
      if (allVersesRead) bStats.chaptersCompleted++;
    });
  });

  return stats;
}
