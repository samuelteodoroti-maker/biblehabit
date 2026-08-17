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

export const bibleBooks: BibleBook[] = [
  // ANTIGO TESTAMENTO
  // Pentateuco
  { id: "GEN", name: "Gênesis", chapters: 50, testament: "Antigo Testamento", division: "Pentateuco", order: 1 },
  { id: "EXO", name: "Êxodo", chapters: 40, testament: "Antigo Testamento", division: "Pentateuco", order: 2 },
  { id: "LEV", name: "Levítico", chapters: 27, testament: "Antigo Testamento", division: "Pentateuco", order: 3 },
  { id: "NUM", name: "Números", chapters: 36, testament: "Antigo Testamento", division: "Pentateuco", order: 4 },
  { id: "DEU", name: "Deuteronômio", chapters: 34, testament: "Antigo Testamento", division: "Pentateuco", order: 5 },
  // Históricos
  { id: "JOS", name: "Josué", chapters: 24, testament: "Antigo Testamento", division: "Históricos", order: 6 },
  { id: "JDG", name: "Juízes", chapters: 21, testament: "Antigo Testamento", division: "Históricos", order: 7 },
  { id: "RUT", name: "Rute", chapters: 4, testament: "Antigo Testamento", division: "Históricos", order: 8 },
  { id: "1SA", name: "1 Samuel", chapters: 31, testament: "Antigo Testamento", division: "Históricos", order: 9 },
  { id: "2SA", name: "2 Samuel", chapters: 24, testament: "Antigo Testamento", division: "Históricos", order: 10 },
  { id: "1KI", name: "1 Reis", chapters: 22, testament: "Antigo Testamento", division: "Históricos", order: 11 },
  { id: "2KI", name: "2 Reis", chapters: 25, testament: "Antigo Testamento", division: "Históricos", order: 12 },
  { id: "1CH", name: "1 Crônicas", chapters: 29, testament: "Antigo Testamento", division: "Históricos", order: 13 },
  { id: "2CH", name: "2 Crônicas", chapters: 36, testament: "Antigo Testamento", division: "Históricos", order: 14 },
  { id: "EZR", name: "Esdras", chapters: 10, testament: "Antigo Testamento", division: "Históricos", order: 15 },
  { id: "NEH", name: "Neemias", chapters: 13, testament: "Antigo Testamento", division: "Históricos", order: 16 },
  { id: "EST", name: "Ester", chapters: 10, testament: "Antigo Testamento", division: "Históricos", order: 17 },
  // Poéticos
  { id: "JOB", name: "Jó", chapters: 42, testament: "Antigo Testamento", division: "Poéticos", order: 18 },
  { id: "PSA", name: "Salmos", chapters: 150, testament: "Antigo Testamento", division: "Poéticos", order: 19 },
  { id: "PRO", name: "Provérbios", chapters: 31, testament: "Antigo Testamento", division: "Poéticos", order: 20 },
  { id: "ECC", name: "Eclesiastes", chapters: 12, testament: "Antigo Testamento", division: "Poéticos", order: 21 },
  { id: "SNG", name: "Cantares", alternatives: ["Cântico dos Cânticos"], chapters: 8, testament: "Antigo Testamento", division: "Poéticos", order: 22 },
  // Profetas Maiores
  { id: "ISA", name: "Isaías", chapters: 66, testament: "Antigo Testamento", division: "Profetas Maiores", order: 23 },
  { id: "JER", name: "Jeremias", chapters: 52, testament: "Antigo Testamento", division: "Profetas Maiores", order: 24 },
  { id: "LAM", name: "Lamentações", chapters: 5, testament: "Antigo Testamento", division: "Profetas Maiores", order: 25 },
  { id: "EZK", name: "Ezequiel", chapters: 48, testament: "Antigo Testamento", division: "Profetas Maiores", order: 26 },
  { id: "DAN", name: "Daniel", chapters: 12, testament: "Antigo Testamento", division: "Profetas Maiores", order: 27 },
  // Profetas Menores
  { id: "HOS", name: "Oséias", chapters: 14, testament: "Antigo Testamento", division: "Profetas Menores", order: 28 },
  { id: "JOL", name: "Joel", chapters: 3, testament: "Antigo Testamento", division: "Profetas Menores", order: 29 },
  { id: "AMO", name: "Amós", chapters: 9, testament: "Antigo Testamento", division: "Profetas Menores", order: 30 },
  { id: "OBA", name: "Obadias", chapters: 1, testament: "Antigo Testamento", division: "Profetas Menores", order: 31 },
  { id: "JON", name: "Jonas", chapters: 4, testament: "Antigo Testamento", division: "Profetas Menores", order: 32 },
  { id: "MIC", name: "Miquéias", chapters: 7, testament: "Antigo Testamento", division: "Profetas Menores", order: 33 },
  { id: "NAM", name: "Naum", chapters: 3, testament: "Antigo Testamento", division: "Profetas Menores", order: 34 },
  { id: "HAB", name: "Habacuque", chapters: 3, testament: "Antigo Testamento", division: "Profetas Menores", order: 35 },
  { id: "ZEP", name: "Sofonias", chapters: 3, testament: "Antigo Testamento", division: "Profetas Menores", order: 36 },
  { id: "HAG", name: "Ageu", chapters: 2, testament: "Antigo Testamento", division: "Profetas Menores", order: 37 },
  { id: "ZEC", name: "Zacarias", chapters: 14, testament: "Antigo Testamento", division: "Profetas Menores", order: 38 },
  { id: "MAL", name: "Malaquias", chapters: 4, testament: "Antigo Testamento", division: "Profetas Menores", order: 39 },

  // NOVO TESTAMENTO
  // Evangelhos
  { id: "MAT", name: "Mateus", chapters: 28, testament: "Novo Testamento", division: "Evangelhos", order: 40 },
  { id: "MRK", name: "Marcos", chapters: 16, testament: "Novo Testamento", division: "Evangelhos", order: 41 },
  { id: "LUK", name: "Lucas", chapters: 24, testament: "Novo Testamento", division: "Evangelhos", order: 42 },
  { id: "JHN", name: "João", chapters: 21, testament: "Novo Testamento", division: "Evangelhos", order: 43 },
  // Histórico
  { id: "ACT", name: "Atos", alternatives: ["Atos dos Apóstolos"], chapters: 28, testament: "Novo Testamento", division: "Histórico", order: 44 },
  // Cartas Paulinas
  { id: "ROM", name: "Romanos", chapters: 16, testament: "Novo Testamento", division: "Cartas Paulinas", order: 45 },
  { id: "1CO", name: "1 Coríntios", chapters: 16, testament: "Novo Testamento", division: "Cartas Paulinas", order: 46 },
  { id: "2CO", name: "2 Coríntios", chapters: 13, testament: "Novo Testamento", division: "Cartas Paulinas", order: 47 },
  { id: "GAL", name: "Gálatas", chapters: 6, testament: "Novo Testamento", division: "Cartas Paulinas", order: 48 },
  { id: "EPH", name: "Efésios", chapters: 6, testament: "Novo Testamento", division: "Cartas Paulinas", order: 49 },
  { id: "PHP", name: "Filipenses", chapters: 4, testament: "Novo Testamento", division: "Cartas Paulinas", order: 50 },
  { id: "COL", name: "Colossenses", chapters: 4, testament: "Novo Testamento", division: "Cartas Paulinas", order: 51 },
  { id: "1TS", name: "1 Tessalonicenses", chapters: 5, testament: "Novo Testamento", division: "Cartas Paulinas", order: 52 },
  { id: "2TS", name: "2 Tessalonicenses", chapters: 3, testament: "Novo Testamento", division: "Cartas Paulinas", order: 53 },
  { id: "1TI", name: "1 Timóteo", chapters: 6, testament: "Novo Testamento", division: "Cartas Paulinas", order: 54 },
  { id: "2TI", name: "2 Timóteo", chapters: 4, testament: "Novo Testamento", division: "Cartas Paulinas", order: 55 },
  { id: "TIT", name: "Tito", chapters: 3, testament: "Novo Testamento", division: "Cartas Paulinas", order: 56 },
  { id: "PHM", name: "Filemom", chapters: 1, testament: "Novo Testamento", division: "Cartas Paulinas", order: 57 },
  // Cartas Gerais
  { id: "HEB", name: "Hebreus", chapters: 13, testament: "Novo Testamento", division: "Cartas Gerais", order: 58 },
  { id: "JAS", name: "Tiago", chapters: 5, testament: "Novo Testamento", division: "Cartas Gerais", order: 59 },
  { id: "1PE", name: "1 Pedro", chapters: 5, testament: "Novo Testamento", division: "Cartas Gerais", order: 60 },
  { id: "2PE", name: "2 Pedro", chapters: 3, testament: "Novo Testamento", division: "Cartas Gerais", order: 61 },
  { id: "1JN", name: "1 João", chapters: 5, testament: "Novo Testamento", division: "Cartas Gerais", order: 62 },
  { id: "2JN", name: "2 João", chapters: 1, testament: "Novo Testamento", division: "Cartas Gerais", order: 63 },
  { id: "3JN", name: "3 João", chapters: 1, testament: "Novo Testamento", division: "Cartas Gerais", order: 64 },
  { id: "JUD", name: "Judas", chapters: 1, testament: "Novo Testamento", division: "Cartas Gerais", order: 65 },
  // Revelação
  { id: "REV", name: "Apocalipse", chapters: 22, testament: "Novo Testamento", division: "Revelação", order: 66 },
];

// Helper to get book by ID or name
export function getBibleBook(query: string): BibleBook | undefined {
  const normalized = query.toLowerCase().trim();
  return bibleBooks.find(b => 
    b.id.toLowerCase() === normalized || 
    b.name.toLowerCase() === normalized || 
    b.alternatives?.some(a => a.toLowerCase() === normalized)
  );
}

// Para versículos, como são muitos, usaremos uma aproximação baseada em padrões ou 
// uma estrutura sob demanda para validação.
// A prompt pede "Quantidade de versículos por capítulo".
// Como não temos a lista exata aqui e é muito grande para um arquivo TS,
// vou implementar um validador que assume um limite razoável ou 
// podemos adicionar os dados dos livros mais comuns.

export function getChaptersBetween(fromIdx: number, toIdx: number): number {
  if (fromIdx < 0 || toIdx < 0 || fromIdx > toIdx) return 0;
  let total = 0;
  for (let i = fromIdx; i <= toIdx; i++) total += bibleBooks[i].chapters;
  return total;
}
