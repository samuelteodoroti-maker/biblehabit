export interface BibleBook {
  id: string;
  name: string;
  chapters: { chapter: number; verses: number }[];
  testament: "AT" | "NT";
  division: string;
}

export const BIBLE_CANON: BibleBook[] = [
  // A versão final incluirá todos os 66 livros.
  // Vou começar com o exemplo solicitado para Gênesis:
  {
    id: "GEN",
    name: "Gênesis",
    testament: "AT",
    division: "Pentateuco",
    chapters: [
      { chapter: 1, verses: 31 },
      { chapter: 2, verses: 25 },
      // ... preencher os 50 capítulos de Gênesis
    ]
  },
  // ...
];

export const TOTAL_VERSES = 31102;
EOF
file_path: