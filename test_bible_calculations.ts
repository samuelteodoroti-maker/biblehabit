import { calculateBibleCoverage } from "./src/lib/bible-calculations";

const testPassages = [
  {
    book_id: "GEN",
    start_chapter: 1,
    start_verse: 1,
    end_chapter: 1,
    end_verse: 3,
    is_full_chapter: false
  },
  {
    book_id: "GEN",
    start_chapter: 1,
    start_verse: 1,
    end_chapter: 1,
    end_verse: 3,
    is_full_chapter: false
  }
];

const stats = calculateBibleCoverage(testPassages);
console.log("Teste 1: Gênesis 1:1-3 lido duas vezes");
console.log("Versículos únicos (esperado 3):", stats.byBook["GEN"].unique);
console.log("Porcentagem Gênesis (esperado ~0,20%):", stats.byBook["GEN"].percent.toFixed(2) + "%");
console.log("Atividade total (esperado 6):", stats.totalActivity);

const testOverlap = [
  { book_id: "GEN", start_chapter: 1, start_verse: 1, end_chapter: 1, end_verse: 10, is_full_chapter: false },
  { book_id: "GEN", start_chapter: 1, start_verse: 5, end_chapter: 1, end_verse: 15, is_full_chapter: false }
];

const statsOverlap = calculateBibleCoverage(testOverlap);
console.log("\nTeste 2: Sobreposição Gênesis 1:1-10 e 1:5-15");
console.log("Versículos únicos (esperado 15):", statsOverlap.byBook["GEN"].unique);
