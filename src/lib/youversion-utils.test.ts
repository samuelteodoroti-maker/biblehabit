import { describe, it, expect } from "vitest";
import { buildYouVersionContextUrl } from "./youversion-utils";

describe("buildYouVersionContextUrl", () => {
  it("builds a specific URL for a valid book/chapter", () => {
    const url = buildYouVersionContextUrl({ appLocale: "pt-BR", bookId: "JHN", chapter: 3 });
    expect(url).toBe("https://www.bible.com/pt/bible/211/JHN.3.NTLH");
  });

  it("falls back to the localized generic link for missing data", () => {
    expect(
      buildYouVersionContextUrl({ appLocale: "pt-BR", bookId: undefined as any, chapter: 3 }),
    ).toBe("https://www.bible.com/pt/bible");
    expect(buildYouVersionContextUrl({ appLocale: "en-US", bookId: "  ", chapter: 1 })).toBe(
      "https://www.bible.com/en/bible",
    );
    expect(
      buildYouVersionContextUrl({ appLocale: "pt-BR", bookId: "JHN", chapter: undefined as any }),
    ).toBe("https://www.bible.com/pt/bible");
    expect(buildYouVersionContextUrl({ appLocale: "pt-BR", bookId: "JHN", chapter: 999 })).toBe(
      "https://www.bible.com/pt/bible",
    );
  });
});
