import { describe, expect, it } from "vitest";
import {
  BIBLE_CANON,
  TOTAL_AT_VERSES,
  TOTAL_NT_VERSES,
  TOTAL_VERSES,
  getChapterCount,
  getVerseCount,
} from "./bible-canon";
import { bibleBooks } from "./bibleBooks";

describe("cânon bíblico", () => {
  it("possui os 66 livros", () => {
    expect(BIBLE_CANON).toHaveLength(66);
    expect(bibleBooks).toHaveLength(66);
  });

  it("mantém a ordem canônica e a divisão por testamento", () => {
    expect(BIBLE_CANON[0].id).toBe("GEN");
    expect(BIBLE_CANON[38].id).toBe("MAL");
    expect(BIBLE_CANON[39].id).toBe("MAT");
    expect(BIBLE_CANON[65].id).toBe("REV");
    expect(BIBLE_CANON.filter(b => b.testament === "AT")).toHaveLength(39);
    expect(BIBLE_CANON.filter(b => b.testament === "NT")).toHaveLength(27);
  });

  it("usa identificadores USFM únicos", () => {
    expect(new Set(BIBLE_CANON.map(b => b.id)).size).toBe(66);
  });

  it.each([
    ["GEN", 50],
    ["EXO", 40],
    ["PSA", 150],
    ["OBA", 1],
    ["MAT", 28],
    ["JHN", 21],
    ["REV", 22],
  ])("%s tem %i capítulos", (id, chapters) => {
    expect(getChapterCount(id)).toBe(chapters);
  });

  it.each([
    ["GEN", 1, 31],
    ["PSA", 119, 176],
    ["JHN", 3, 36],
    ["REV", 22, 21],
  ])("%s %i tem %i versículos", (id, chapter, verses) => {
    expect(getVerseCount(id, chapter)).toBe(verses);
  });

  it("numera os capítulos de 1..n sem lacunas e com versículos positivos", () => {
    for (const book of BIBLE_CANON) {
      book.chapters.forEach((c, i) => {
        expect(c.chapter).toBe(i + 1);
        expect(c.verses).toBeGreaterThan(0);
      });
    }
  });

  it("rejeita livro ou capítulo inexistente", () => {
    expect(getVerseCount("XXX", 1)).toBe(0);
    expect(getVerseCount("OBA", 2)).toBe(0);
    expect(getChapterCount("XXX")).toBe(0);
  });

  it("calcula os totais a partir do catálogo", () => {
    expect(TOTAL_VERSES).toBe(TOTAL_AT_VERSES + TOTAL_NT_VERSES);
    expect(TOTAL_VERSES).toBeGreaterThan(31000);
    expect(TOTAL_AT_VERSES).toBe(23145);
  });
});
