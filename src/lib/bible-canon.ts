// Gerado a partir da estrutura canônica completa (66 livros do cânon protestante).
// Contagem de versículos por capítulo — não editar manualmente.

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
  // Gênesis (50 cap, 1533 v)
  { id: "GEN", name: "Gênesis", testament: "AT", division: "Pentateuco",
    chapters: [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 55, 32, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 33, 26].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Êxodo (40 cap, 1213 v)
  { id: "EXO", name: "Êxodo", testament: "AT", division: "Pentateuco",
    chapters: [22, 25, 22, 31, 23, 30, 25, 32, 35, 29, 10, 51, 22, 31, 27, 36, 16, 27, 25, 26, 36, 31, 33, 18, 40, 37, 21, 43, 46, 38, 18, 35, 23, 35, 35, 38, 29, 31, 43, 38].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Levítico (27 cap, 859 v)
  { id: "LEV", name: "Levítico", testament: "AT", division: "Pentateuco",
    chapters: [17, 16, 17, 35, 19, 30, 38, 36, 24, 20, 47, 8, 59, 57, 33, 34, 16, 30, 37, 27, 24, 33, 44, 23, 55, 46, 34].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Números (36 cap, 1288 v)
  { id: "NUM", name: "Números", testament: "AT", division: "Pentateuco",
    chapters: [54, 34, 51, 49, 31, 27, 89, 26, 23, 36, 35, 16, 33, 45, 41, 50, 13, 32, 22, 29, 35, 41, 30, 25, 18, 65, 23, 31, 40, 16, 54, 42, 56, 29, 34, 13].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Deuteronômio (34 cap, 959 v)
  { id: "DEU", name: "Deuteronômio", testament: "AT", division: "Pentateuco",
    chapters: [46, 37, 29, 49, 33, 25, 26, 20, 29, 22, 32, 32, 18, 29, 23, 22, 20, 22, 21, 20, 23, 30, 25, 22, 19, 19, 26, 68, 29, 20, 30, 52, 29, 12].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Josué (24 cap, 658 v)
  { id: "JOS", name: "Josué", testament: "AT", division: "Históricos",
    chapters: [18, 24, 17, 24, 15, 27, 26, 35, 27, 43, 23, 24, 33, 15, 63, 10, 18, 28, 51, 9, 45, 34, 16, 33].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Juízes (21 cap, 618 v)
  { id: "JDG", name: "Juízes", testament: "AT", division: "Históricos",
    chapters: [36, 23, 31, 24, 31, 40, 25, 35, 57, 18, 40, 15, 25, 20, 20, 31, 13, 31, 30, 48, 25].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Rute (4 cap, 85 v)
  { id: "RUT", name: "Rute", testament: "AT", division: "Históricos",
    chapters: [22, 23, 18, 22].map((verses, i) => ({ chapter: i + 1, verses })) },
  // 1 Samuel (31 cap, 810 v)
  { id: "1SA", name: "1 Samuel", testament: "AT", division: "Históricos",
    chapters: [28, 36, 21, 22, 12, 21, 17, 22, 27, 27, 15, 25, 23, 52, 35, 23, 58, 30, 24, 42, 15, 23, 29, 22, 44, 25, 12, 25, 11, 31, 13].map((verses, i) => ({ chapter: i + 1, verses })) },
  // 2 Samuel (24 cap, 695 v)
  { id: "2SA", name: "2 Samuel", testament: "AT", division: "Históricos",
    chapters: [27, 32, 39, 12, 25, 23, 29, 18, 13, 19, 27, 31, 39, 33, 37, 23, 29, 33, 43, 26, 22, 51, 39, 25].map((verses, i) => ({ chapter: i + 1, verses })) },
  // 1 Reis (22 cap, 816 v)
  { id: "1KI", name: "1 Reis", testament: "AT", division: "Históricos",
    chapters: [53, 46, 28, 34, 18, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43, 29, 53].map((verses, i) => ({ chapter: i + 1, verses })) },
  // 2 Reis (25 cap, 719 v)
  { id: "2KI", name: "2 Reis", testament: "AT", division: "Históricos",
    chapters: [18, 25, 27, 44, 27, 33, 20, 29, 37, 36, 21, 21, 25, 29, 38, 20, 41, 37, 37, 21, 26, 20, 37, 20, 30].map((verses, i) => ({ chapter: i + 1, verses })) },
  // 1 Crônicas (29 cap, 942 v)
  { id: "1CH", name: "1 Crônicas", testament: "AT", division: "Históricos",
    chapters: [54, 55, 24, 43, 26, 81, 40, 40, 44, 14, 47, 40, 14, 17, 29, 43, 27, 17, 19, 8, 30, 19, 32, 31, 31, 32, 34, 21, 30].map((verses, i) => ({ chapter: i + 1, verses })) },
  // 2 Crônicas (36 cap, 822 v)
  { id: "2CH", name: "2 Crônicas", testament: "AT", division: "Históricos",
    chapters: [17, 18, 17, 22, 14, 42, 22, 18, 31, 19, 23, 16, 22, 15, 19, 14, 19, 34, 11, 37, 20, 12, 21, 27, 28, 23, 9, 27, 36, 27, 21, 33, 25, 33, 27, 23].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Esdras (10 cap, 280 v)
  { id: "EZR", name: "Esdras", testament: "AT", division: "Históricos",
    chapters: [11, 70, 13, 24, 17, 22, 28, 36, 15, 44].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Neemias (13 cap, 406 v)
  { id: "NEH", name: "Neemias", testament: "AT", division: "Históricos",
    chapters: [11, 20, 32, 23, 19, 19, 73, 18, 38, 39, 36, 47, 31].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Ester (10 cap, 167 v)
  { id: "EST", name: "Ester", testament: "AT", division: "Históricos",
    chapters: [22, 23, 15, 17, 14, 14, 10, 17, 32, 3].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Jó (42 cap, 1070 v)
  { id: "JOB", name: "Jó", testament: "AT", division: "Poéticos",
    chapters: [22, 13, 26, 21, 27, 30, 21, 22, 35, 22, 20, 25, 28, 22, 35, 22, 16, 21, 29, 29, 34, 30, 17, 25, 6, 14, 23, 28, 25, 31, 40, 22, 33, 37, 16, 33, 24, 41, 30, 24, 34, 17].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Salmos (150 cap, 2461 v)
  { id: "PSA", name: "Salmos", testament: "AT", division: "Poéticos",
    chapters: [6, 12, 8, 8, 12, 10, 17, 9, 20, 18, 7, 8, 6, 7, 5, 11, 15, 50, 14, 9, 13, 31, 6, 10, 22, 12, 14, 9, 11, 12, 24, 11, 22, 22, 28, 12, 40, 22, 13, 17, 13, 11, 5, 26, 17, 11, 9, 14, 20, 23, 19, 9, 6, 7, 23, 13, 11, 11, 17, 12, 8, 12, 11, 10, 13, 20, 7, 35, 36, 5, 24, 20, 28, 23, 10, 12, 20, 72, 13, 19, 16, 8, 18, 12, 13, 17, 7, 18, 52, 17, 16, 15, 5, 23, 11, 13, 12, 9, 9, 5, 8, 28, 22, 35, 45, 48, 43, 13, 31, 7, 10, 10, 9, 8, 18, 19, 2, 29, 176, 7, 8, 9, 4, 8, 5, 6, 5, 6, 8, 8, 3, 18, 3, 3, 21, 26, 9, 8, 24, 13, 10, 7, 12, 15, 21, 10, 20, 14, 9, 6].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Provérbios (31 cap, 915 v)
  { id: "PRO", name: "Provérbios", testament: "AT", division: "Poéticos",
    chapters: [33, 22, 35, 27, 23, 35, 27, 36, 18, 32, 31, 28, 25, 35, 33, 33, 28, 24, 29, 30, 31, 29, 35, 34, 28, 28, 27, 28, 27, 33, 31].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Eclesiastes (12 cap, 222 v)
  { id: "ECC", name: "Eclesiastes", testament: "AT", division: "Poéticos",
    chapters: [18, 26, 22, 16, 20, 12, 29, 17, 18, 20, 10, 14].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Cantares (8 cap, 117 v)
  { id: "SNG", name: "Cantares", testament: "AT", division: "Poéticos",
    chapters: [17, 17, 11, 16, 16, 13, 13, 14].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Isaías (66 cap, 1292 v)
  { id: "ISA", name: "Isaías", testament: "AT", division: "Profetas Maiores",
    chapters: [31, 22, 26, 6, 30, 13, 25, 22, 21, 34, 16, 6, 22, 32, 9, 14, 14, 7, 25, 6, 17, 25, 18, 23, 12, 21, 13, 29, 24, 33, 9, 20, 24, 17, 10, 22, 38, 22, 8, 31, 29, 25, 28, 28, 25, 13, 15, 22, 26, 11, 23, 15, 12, 17, 13, 12, 21, 14, 21, 22, 11, 12, 19, 12, 25, 24].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Jeremias (52 cap, 1364 v)
  { id: "JER", name: "Jeremias", testament: "AT", division: "Profetas Maiores",
    chapters: [19, 37, 25, 31, 31, 30, 34, 22, 26, 25, 23, 17, 27, 22, 21, 21, 27, 23, 15, 18, 14, 30, 40, 10, 38, 24, 22, 17, 32, 24, 40, 44, 26, 22, 19, 32, 21, 28, 18, 16, 18, 22, 13, 30, 5, 28, 7, 47, 39, 46, 64, 34].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Lamentações (5 cap, 154 v)
  { id: "LAM", name: "Lamentações", testament: "AT", division: "Profetas Maiores",
    chapters: [22, 22, 66, 22, 22].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Ezequiel (48 cap, 1273 v)
  { id: "EZK", name: "Ezequiel", testament: "AT", division: "Profetas Maiores",
    chapters: [28, 10, 27, 17, 17, 14, 27, 18, 11, 22, 25, 28, 23, 23, 8, 63, 24, 32, 14, 49, 32, 31, 49, 27, 17, 21, 36, 26, 21, 26, 18, 32, 33, 31, 15, 38, 28, 23, 29, 49, 26, 20, 27, 31, 25, 24, 23, 35].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Daniel (12 cap, 357 v)
  { id: "DAN", name: "Daniel", testament: "AT", division: "Profetas Maiores",
    chapters: [21, 49, 30, 37, 31, 28, 28, 27, 27, 21, 45, 13].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Oséias (14 cap, 197 v)
  { id: "HOS", name: "Oséias", testament: "AT", division: "Profetas Menores",
    chapters: [11, 23, 5, 19, 15, 11, 16, 14, 17, 15, 12, 14, 16, 9].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Joel (3 cap, 73 v)
  { id: "JOL", name: "Joel", testament: "AT", division: "Profetas Menores",
    chapters: [20, 32, 21].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Amós (9 cap, 146 v)
  { id: "AMO", name: "Amós", testament: "AT", division: "Profetas Menores",
    chapters: [15, 16, 15, 13, 27, 14, 17, 14, 15].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Obadias (1 cap, 21 v)
  { id: "OBA", name: "Obadias", testament: "AT", division: "Profetas Menores",
    chapters: [21].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Jonas (4 cap, 48 v)
  { id: "JON", name: "Jonas", testament: "AT", division: "Profetas Menores",
    chapters: [17, 10, 10, 11].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Miquéias (7 cap, 105 v)
  { id: "MIC", name: "Miquéias", testament: "AT", division: "Profetas Menores",
    chapters: [16, 13, 12, 13, 15, 16, 20].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Naum (3 cap, 47 v)
  { id: "NAM", name: "Naum", testament: "AT", division: "Profetas Menores",
    chapters: [15, 13, 19].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Habacuque (3 cap, 56 v)
  { id: "HAB", name: "Habacuque", testament: "AT", division: "Profetas Menores",
    chapters: [17, 20, 19].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Sofonias (3 cap, 53 v)
  { id: "ZEP", name: "Sofonias", testament: "AT", division: "Profetas Menores",
    chapters: [18, 15, 20].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Ageu (2 cap, 38 v)
  { id: "HAG", name: "Ageu", testament: "AT", division: "Profetas Menores",
    chapters: [15, 23].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Zacarias (14 cap, 211 v)
  { id: "ZEC", name: "Zacarias", testament: "AT", division: "Profetas Menores",
    chapters: [21, 13, 10, 14, 11, 15, 14, 23, 17, 12, 17, 14, 9, 21].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Malaquias (4 cap, 55 v)
  { id: "MAL", name: "Malaquias", testament: "AT", division: "Profetas Menores",
    chapters: [14, 17, 18, 6].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Mateus (28 cap, 1071 v)
  { id: "MAT", name: "Mateus", testament: "NT", division: "Evangelhos",
    chapters: [25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36, 39, 28, 27, 35, 30, 34, 46, 46, 39, 51, 46, 75, 66, 20].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Marcos (16 cap, 678 v)
  { id: "MRK", name: "Marcos", testament: "NT", division: "Evangelhos",
    chapters: [45, 28, 35, 41, 43, 56, 37, 38, 50, 52, 33, 44, 37, 72, 47, 20].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Lucas (24 cap, 1151 v)
  { id: "LUK", name: "Lucas", testament: "NT", division: "Evangelhos",
    chapters: [80, 52, 38, 44, 39, 49, 50, 56, 62, 42, 54, 59, 35, 35, 32, 31, 37, 43, 48, 47, 38, 71, 56, 53].map((verses, i) => ({ chapter: i + 1, verses })) },
  // João (21 cap, 879 v)
  { id: "JHN", name: "João", testament: "NT", division: "Evangelhos",
    chapters: [51, 25, 36, 54, 47, 71, 53, 59, 41, 42, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Atos (28 cap, 1007 v)
  { id: "ACT", name: "Atos", testament: "NT", division: "Histórico",
    chapters: [26, 47, 26, 37, 42, 15, 60, 40, 43, 48, 30, 25, 52, 28, 41, 40, 34, 28, 41, 38, 40, 30, 35, 27, 27, 32, 44, 31].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Romanos (16 cap, 433 v)
  { id: "ROM", name: "Romanos", testament: "NT", division: "Cartas Paulinas",
    chapters: [32, 29, 31, 25, 21, 23, 25, 39, 33, 21, 36, 21, 14, 23, 33, 27].map((verses, i) => ({ chapter: i + 1, verses })) },
  // 1 Coríntios (16 cap, 437 v)
  { id: "1CO", name: "1 Coríntios", testament: "NT", division: "Cartas Paulinas",
    chapters: [31, 16, 23, 21, 13, 20, 40, 13, 27, 33, 34, 31, 13, 40, 58, 24].map((verses, i) => ({ chapter: i + 1, verses })) },
  // 2 Coríntios (13 cap, 257 v)
  { id: "2CO", name: "2 Coríntios", testament: "NT", division: "Cartas Paulinas",
    chapters: [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 14].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Gálatas (6 cap, 149 v)
  { id: "GAL", name: "Gálatas", testament: "NT", division: "Cartas Paulinas",
    chapters: [24, 21, 29, 31, 26, 18].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Efésios (6 cap, 155 v)
  { id: "EPH", name: "Efésios", testament: "NT", division: "Cartas Paulinas",
    chapters: [23, 22, 21, 32, 33, 24].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Filipenses (4 cap, 104 v)
  { id: "PHP", name: "Filipenses", testament: "NT", division: "Cartas Paulinas",
    chapters: [30, 30, 21, 23].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Colossenses (4 cap, 95 v)
  { id: "COL", name: "Colossenses", testament: "NT", division: "Cartas Paulinas",
    chapters: [29, 23, 25, 18].map((verses, i) => ({ chapter: i + 1, verses })) },
  // 1 Tessalonicenses (5 cap, 89 v)
  { id: "1TS", name: "1 Tessalonicenses", testament: "NT", division: "Cartas Paulinas",
    chapters: [10, 20, 13, 18, 28].map((verses, i) => ({ chapter: i + 1, verses })) },
  // 2 Tessalonicenses (3 cap, 47 v)
  { id: "2TS", name: "2 Tessalonicenses", testament: "NT", division: "Cartas Paulinas",
    chapters: [12, 17, 18].map((verses, i) => ({ chapter: i + 1, verses })) },
  // 1 Timóteo (6 cap, 113 v)
  { id: "1TI", name: "1 Timóteo", testament: "NT", division: "Cartas Paulinas",
    chapters: [20, 15, 16, 16, 25, 21].map((verses, i) => ({ chapter: i + 1, verses })) },
  // 2 Timóteo (4 cap, 83 v)
  { id: "2TI", name: "2 Timóteo", testament: "NT", division: "Cartas Paulinas",
    chapters: [18, 26, 17, 22].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Tito (3 cap, 46 v)
  { id: "TIT", name: "Tito", testament: "NT", division: "Cartas Paulinas",
    chapters: [16, 15, 15].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Filemom (1 cap, 25 v)
  { id: "PHM", name: "Filemom", testament: "NT", division: "Cartas Paulinas",
    chapters: [25].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Hebreus (13 cap, 303 v)
  { id: "HEB", name: "Hebreus", testament: "NT", division: "Cartas Gerais",
    chapters: [14, 18, 19, 16, 14, 20, 28, 13, 28, 39, 40, 29, 25].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Tiago (5 cap, 108 v)
  { id: "JAS", name: "Tiago", testament: "NT", division: "Cartas Gerais",
    chapters: [27, 26, 18, 17, 20].map((verses, i) => ({ chapter: i + 1, verses })) },
  // 1 Pedro (5 cap, 105 v)
  { id: "1PE", name: "1 Pedro", testament: "NT", division: "Cartas Gerais",
    chapters: [25, 25, 22, 19, 14].map((verses, i) => ({ chapter: i + 1, verses })) },
  // 2 Pedro (3 cap, 61 v)
  { id: "2PE", name: "2 Pedro", testament: "NT", division: "Cartas Gerais",
    chapters: [21, 22, 18].map((verses, i) => ({ chapter: i + 1, verses })) },
  // 1 João (5 cap, 105 v)
  { id: "1JN", name: "1 João", testament: "NT", division: "Cartas Gerais",
    chapters: [10, 29, 24, 21, 21].map((verses, i) => ({ chapter: i + 1, verses })) },
  // 2 João (1 cap, 13 v)
  { id: "2JN", name: "2 João", testament: "NT", division: "Cartas Gerais",
    chapters: [13].map((verses, i) => ({ chapter: i + 1, verses })) },
  // 3 João (1 cap, 15 v)
  { id: "3JN", name: "3 João", testament: "NT", division: "Cartas Gerais",
    chapters: [15].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Judas (1 cap, 25 v)
  { id: "JUD", name: "Judas", testament: "NT", division: "Cartas Gerais",
    chapters: [25].map((verses, i) => ({ chapter: i + 1, verses })) },
  // Apocalipse (22 cap, 404 v)
  { id: "REV", name: "Apocalipse", testament: "NT", division: "Revelação",
    chapters: [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 17, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21].map((verses, i) => ({ chapter: i + 1, verses })) },
];

export const TOTAL_VERSES = BIBLE_CANON.reduce(
  (sum, b) => sum + b.chapters.reduce((s, c) => s + c.verses, 0),
  0,
);
export const TOTAL_AT_VERSES = BIBLE_CANON.filter(b => b.testament === "AT").reduce(
  (sum, b) => sum + b.chapters.reduce((s, c) => s + c.verses, 0),
  0,
);
export const TOTAL_NT_VERSES = TOTAL_VERSES - TOTAL_AT_VERSES;

export function getBookById(id: string) {
  return BIBLE_CANON.find(b => b.id === id);
}

export function getChapterCount(bookId: string): number {
  return getBookById(bookId)?.chapters.length ?? 0;
}

export function getVerseCount(bookId: string, chapter: number): number {
  const book = getBookById(bookId);
  if (!book) return 0;
  const ch = book.chapters.find(c => c.chapter === chapter);
  return ch ? ch.verses : 0;
}
