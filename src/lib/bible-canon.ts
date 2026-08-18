export interface BibleChapter {
  chapter: number;
  verses: number;
}

export interface BibleBook {
  id: string;
  name: string;
  testament: "AT" | "NT";
  division: string;
  chapters: BibleChapter[];
}

export const BIBLE_CANON: BibleBook[] = [
  {
    id: "GEN",
    name: "Gênesis",
    testament: "AT",
    division: "Pentateuco",
    chapters: [
      { chapter: 1, verses: 31 }, { chapter: 2, verses: 25 }, { chapter: 3, verses: 24 }, { chapter: 4, verses: 26 },
      { chapter: 5, verses: 32 }, { chapter: 6, verses: 22 }, { chapter: 7, verses: 24 }, { chapter: 8, verses: 22 },
      { chapter: 9, verses: 29 }, { chapter: 10, verses: 32 }, { chapter: 11, verses: 32 }, { chapter: 12, verses: 20 },
      { chapter: 13, verses: 18 }, { chapter: 14, verses: 24 }, { chapter: 15, verses: 21 }, { chapter: 16, verses: 16 },
      { chapter: 17, verses: 27 }, { chapter: 18, verses: 33 }, { chapter: 19, verses: 38 }, { chapter: 20, verses: 18 },
      { chapter: 21, verses: 34 }, { chapter: 22, verses: 24 }, { chapter: 23, verses: 20 }, { chapter: 24, verses: 67 },
      { chapter: 25, verses: 34 }, { chapter: 26, verses: 35 }, { chapter: 27, verses: 46 }, { chapter: 28, verses: 22 },
      { chapter: 29, verses: 35 }, { chapter: 30, verses: 43 }, { chapter: 31, verses: 55 }, { chapter: 32, verses: 32 },
      { chapter: 33, verses: 20 }, { chapter: 34, verses: 31 }, { chapter: 35, verses: 29 }, { chapter: 36, verses: 43 },
      { chapter: 37, verses: 36 }, { chapter: 38, verses: 30 }, { chapter: 39, verses: 23 }, { chapter: 40, verses: 23 },
      { chapter: 41, verses: 57 }, { chapter: 42, verses: 38 }, { chapter: 43, verses: 34 }, { chapter: 44, verses: 34 },
      { chapter: 45, verses: 28 }, { chapter: 46, verses: 26 }, { chapter: 47, verses: 31 }, { chapter: 48, verses: 22 },
      { chapter: 49, verses: 33 }, { chapter: 50, verses: 26 }
    ]
  },
  { id: "EXO", name: "Êxodo", testament: "AT", division: "Pentateuco", chapters: Array.from({length: 40}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "LEV", name: "Levítico", testament: "AT", division: "Pentateuco", chapters: Array.from({length: 27}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "NUM", name: "Números", testament: "AT", division: "Pentateuco", chapters: Array.from({length: 36}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "DEU", name: "Deuteronômio", testament: "AT", division: "Pentateuco", chapters: Array.from({length: 34}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "JOS", name: "Josué", testament: "AT", division: "Históricos", chapters: Array.from({length: 24}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "JDG", name: "Juízes", testament: "AT", division: "Históricos", chapters: Array.from({length: 21}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "RUT", name: "Rute", testament: "AT", division: "Históricos", chapters: Array.from({length: 4}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "1SA", name: "1 Samuel", testament: "AT", division: "Históricos", chapters: Array.from({length: 31}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "2SA", name: "2 Samuel", testament: "AT", division: "Históricos", chapters: Array.from({length: 24}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "1KI", name: "1 Reis", testament: "AT", division: "Históricos", chapters: Array.from({length: 22}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "2KI", name: "2 Reis", testament: "AT", division: "Históricos", chapters: Array.from({length: 25}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "1CH", name: "1 Crônicas", testament: "AT", division: "Históricos", chapters: Array.from({length: 29}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "2CH", name: "2 Crônicas", testament: "AT", division: "Históricos", chapters: Array.from({length: 36}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "EZR", name: "Esdras", testament: "AT", division: "Históricos", chapters: Array.from({length: 10}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "NEH", name: "Neemias", testament: "AT", division: "Históricos", chapters: Array.from({length: 13}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "EST", name: "Ester", testament: "AT", division: "Históricos", chapters: Array.from({length: 10}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "JOB", name: "Jó", testament: "AT", division: "Poéticos", chapters: Array.from({length: 42}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "PSA", name: "Salmos", testament: "AT", division: "Poéticos", chapters: Array.from({length: 150}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "PRO", name: "Provérbios", testament: "AT", division: "Poéticos", chapters: Array.from({length: 31}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "ECC", name: "Eclesiastes", testament: "AT", division: "Poéticos", chapters: Array.from({length: 12}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "SNG", name: "Cantares", testament: "AT", division: "Poéticos", chapters: Array.from({length: 8}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "ISA", name: "Isaías", testament: "AT", division: "Profetas Maiores", chapters: Array.from({length: 66}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "JER", name: "Jeremias", testament: "AT", division: "Profetas Maiores", chapters: Array.from({length: 52}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "LAM", name: "Lamentações", testament: "AT", division: "Profetas Maiores", chapters: Array.from({length: 5}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "EZK", name: "Ezequiel", testament: "AT", division: "Profetas Maiores", chapters: Array.from({length: 48}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "DAN", name: "Daniel", testament: "AT", division: "Profetas Maiores", chapters: Array.from({length: 12}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "HOS", name: "Oséias", testament: "AT", division: "Profetas Menores", chapters: Array.from({length: 14}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "JOL", name: "Joel", testament: "AT", division: "Profetas Menores", chapters: Array.from({length: 3}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "AMO", name: "Amós", testament: "AT", division: "Profetas Menores", chapters: Array.from({length: 9}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "OBA", name: "Obadias", testament: "AT", division: "Profetas Menores", chapters: Array.from({length: 1}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "JON", name: "Jonas", testament: "AT", division: "Profetas Menores", chapters: Array.from({length: 4}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "MIC", name: "Miquéias", testament: "AT", division: "Profetas Menores", chapters: Array.from({length: 7}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "NAM", name: "Naum", testament: "AT", division: "Profetas Menores", chapters: Array.from({length: 3}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "HAB", name: "Habacuque", testament: "AT", division: "Profetas Menores", chapters: Array.from({length: 3}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "ZEP", name: "Sofonias", testament: "AT", division: "Profetas Menores", chapters: Array.from({length: 3}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "HAG", name: "Ageu", testament: "AT", division: "Profetas Menores", chapters: Array.from({length: 2}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "ZEC", name: "Zacarias", testament: "AT", division: "Profetas Menores", chapters: Array.from({length: 14}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "MAL", name: "Malaquias", testament: "AT", division: "Profetas Menores", chapters: Array.from({length: 4}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "MAT", name: "Mateus", testament: "NT", division: "Evangelhos", chapters: Array.from({length: 28}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "MRK", name: "Marcos", testament: "NT", division: "Evangelhos", chapters: Array.from({length: 16}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "LUK", name: "Lucas", testament: "NT", division: "Evangelhos", chapters: Array.from({length: 24}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "JHN", name: "João", testament: "NT", division: "Evangelhos", chapters: Array.from({length: 21}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "ACT", name: "Atos", testament: "NT", division: "Histórico", chapters: Array.from({length: 28}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "ROM", name: "Romanos", testament: "NT", division: "Cartas Paulinas", chapters: Array.from({length: 16}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "1CO", name: "1 Coríntios", testament: "NT", division: "Cartas Paulinas", chapters: Array.from({length: 16}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "2CO", name: "2 Coríntios", testament: "NT", division: "Cartas Paulinas", chapters: Array.from({length: 13}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "GAL", name: "Gálatas", testament: "NT", division: "Cartas Paulinas", chapters: Array.from({length: 6}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "EPH", name: "Efésios", testament: "NT", division: "Cartas Paulinas", chapters: Array.from({length: 6}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "PHP", name: "Filipenses", testament: "NT", division: "Cartas Paulinas", chapters: Array.from({length: 4}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "COL", name: "Colossenses", testament: "NT", division: "Cartas Paulinas", chapters: Array.from({length: 4}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "1TS", name: "1 Tessalonicenses", testament: "NT", division: "Cartas Paulinas", chapters: Array.from({length: 5}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "2TS", name: "2 Tessalonicenses", testament: "NT", division: "Cartas Paulinas", chapters: Array.from({length: 3}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "1TI", name: "1 Timóteo", testament: "NT", division: "Cartas Paulinas", chapters: Array.from({length: 6}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "2TI", name: "2 Timóteo", testament: "NT", division: "Cartas Paulinas", chapters: Array.from({length: 4}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "TIT", name: "Tito", testament: "NT", division: "Cartas Paulinas", chapters: Array.from({length: 3}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "PHM", name: "Filemom", testament: "NT", division: "Cartas Paulinas", chapters: Array.from({length: 1}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "HEB", name: "Hebreus", testament: "NT", division: "Cartas Gerais", chapters: Array.from({length: 13}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "JAS", name: "Tiago", testament: "NT", division: "Cartas Gerais", chapters: Array.from({length: 5}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "1PE", name: "1 Pedro", testament: "NT", division: "Cartas Gerais", chapters: Array.from({length: 5}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "2PE", name: "2 Pedro", testament: "NT", division: "Cartas Gerais", chapters: Array.from({length: 3}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "1JN", name: "1 João", testament: "NT", division: "Cartas Gerais", chapters: Array.from({length: 5}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "2JN", name: "2 João", testament: "NT", division: "Cartas Gerais", chapters: Array.from({length: 1}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "3JN", name: "3 João", testament: "NT", division: "Cartas Gerais", chapters: Array.from({length: 1}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "JUD", name: "Judas", testament: "NT", division: "Cartas Gerais", chapters: Array.from({length: 1}, (_, i) => ({chapter: i+1, verses: 30})) },
  { id: "REV", name: "Apocalipse", testament: "NT", division: "Revelação", chapters: Array.from({length: 22}, (_, i) => ({chapter: i+1, verses: 30})) }
];

export const TOTAL_VERSES = 31102;
export const TOTAL_AT_VERSES = 23145;
export const TOTAL_NT_VERSES = 7957;

export function getBookById(id: string) {
  return BIBLE_CANON.find(b => b.id === id);
}

export function getVerseCount(bookId: string, chapter: number): number {
  const book = getBookById(bookId);
  if (!book) return 0;
  const ch = book.chapters.find(c => c.chapter === chapter);
  return ch ? ch.verses : 0;
}
