import { describe, expect, it } from "vitest";
import { formatDateBR, formatLogLine, formatLogPassages, formatPassage } from "./reading-format";

describe("reading-format", () => {
  it("formata versículos de um mesmo capítulo", () => {
    expect(
      formatPassage({ book_id: "GEN", start_chapter: 1, start_verse: 1, end_chapter: 1, end_verse: 10 }),
    ).toBe("Gênesis 1:1–10");
  });

  it("formata capítulo inteiro sem versículos", () => {
    expect(
      formatPassage({ book_id: "GEN", start_chapter: 3, end_chapter: 3, is_full_chapter: true }),
    ).toBe("Gênesis 3");
  });

  it("é seguro com passagem ausente", () => {
    expect(formatPassage(undefined)).toBe("Leitura registrada");
    expect(formatLogPassages(null)).toBe("Leitura registrada");
  });

  it("monta a linha do histórico", () => {
    expect(
      formatLogLine({
        reading_date: "2026-09-11",
        reading_passages: [
          { book_id: "GEN", start_chapter: 1, start_verse: 1, end_chapter: 1, end_verse: 10 },
        ],
      }),
    ).toBe("Gênesis 1:1–10 — 11/09/2026");
  });

  it("formata datas civis sem fuso", () => {
    expect(formatDateBR("2026-01-05")).toBe("05/01/2026");
    expect(formatDateBR(null)).toBe("");
  });
});
