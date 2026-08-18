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

    if (p.is_full_chapter) {
      const ch = book.chapters.find(c => c.chapter === p.start_chapter);
      if (ch) {
        for (let v = 1; v <= ch.verses; v++) {
          uniqueVerses.add(`${p.book_id}:${p.start_chapter}:${v}`);
          totalActivity++;
        }
      }
    } else {
      // Intervalo
      // Validar capítulos e versículos
      const startChapter = p.start_chapter;
      const endChapter = p.end_chapter;
      const startVerse = p.start_verse;
      const endVerse = p.end_verse;

      if (startChapter === endChapter) {
        const ch = book.chapters.find(c => c.chapter === startChapter);
        if (ch) {
          const maxV = ch.verses;
          const ev = endVerse === 0 ? maxV : Math.min(endVerse, maxV);
          for (let v = startVerse; v <= ev; v++) {
            uniqueVerses.add(`${p.book_id}:${startChapter}:${v}`);
            totalActivity++;
          }
        }
      } else {
        // Múltiplos capítulos
        for (let c = startChapter; c <= endChapter; c++) {
          const ch = book.chapters.find(chapter => chapter.chapter === c);
          if (!ch) continue;
          
          let sv = 1;
          let ev = ch.verses;
          
          if (c === startChapter) sv = startVerse;
          if (c === endChapter) ev = endVerse === 0 ? ch.verses : Math.min(endVerse, ch.verses);
          
          for (let v = sv; v <= ev; v++) {
            uniqueVerses.add(`${p.book_id}:${c}:${v}`);
            totalActivity++;
          }
        }
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

  // Inicializar totais canônicos
  BIBLE_CANON.forEach(book => {
    const bookTotal = book.chapters.reduce((acc, c) => acc + c.verses, 0);
    
    // Testamento
    if (!stats.byTestament[book.testament]) {
      stats.byTestament[book.testament] = { unique: 0, total: 0, percent: 0 };
    }
    stats.byTestament[book.testament].total += bookTotal;

    // Divisão
    if (!stats.byDivision[book.division]) {
      stats.byDivision[book.division] = { unique: 0, total: 0, percent: 0 };
    }
    stats.byDivision[book.division].total += bookTotal;

    // Livro
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

  // Calcular porcentagens finais
  Object.keys(stats.byTestament).forEach(k => {
    stats.byTestament[k].percent = (stats.byTestament[k].unique / stats.byTestament[k].total) * 100;
  });
  Object.keys(stats.byDivision).forEach(k => {
    stats.byDivision[k].percent = (stats.byDivision[k].unique / stats.byDivision[k].total) * 100;
  });
  Object.keys(stats.byBook).forEach(id => {
    const bStats = stats.byBook[id];
    bStats.percent = (bStats.unique / bStats.total) * 100;
    
    // Capítulos completados
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
