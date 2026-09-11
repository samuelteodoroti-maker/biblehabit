import { describe, expect, it } from "vitest";
import { FULL_DATASET } from "./bible-verses";
import { getBookById, getVerseCount } from "./bible-canon";
import { getVerseForDate } from "@/hooks/useDailyVerse";

describe("versículo do dia", () => {
  it("todas as referências existem no cânon", () => {
    for (const v of FULL_DATASET) {
      const book = getBookById(v.bookId);
      expect(book, v.reference).toBeDefined();
      expect(book!.name).toBe(v.book);
      expect(getVerseCount(v.bookId, v.chapter)).toBeGreaterThanOrEqual(v.verse);
    }
  });

  it("não contém textos gerados automaticamente", () => {
    for (const v of FULL_DATASET) {
      expect(v.text).not.toMatch(/Reflexão Diária/i);
      expect(v.text.length).toBeGreaterThan(20);
    }
  });

  it("é estável durante o dia e muda no dia seguinte", () => {
    const a = getVerseForDate("2026-09-11");
    const b = getVerseForDate("2026-09-11");
    const c = getVerseForDate("2026-09-12");
    expect(a.reference).toBe(b.reference);
    expect(c.reference).not.toBe(a.reference);
  });
});
