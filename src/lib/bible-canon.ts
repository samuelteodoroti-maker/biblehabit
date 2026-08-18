export interface BibleBook {
  id: string;
  name: string;
  chapters: { chapter: number; verses: number }[];
  testament: "AT" | "NT";
  division: string;
}

export const BIBLE_CANON: BibleBook[] = [
  {
    id: "GEN",
    name: "Gênesis",
    testament: "AT",
    division: "Pentateuco",
    chapters: [
      { chapter: 1, verses: 31 },
      { chapter: 2, verses: 25 }
    ]
  }
];

export const TOTAL_VERSES = 31102;
