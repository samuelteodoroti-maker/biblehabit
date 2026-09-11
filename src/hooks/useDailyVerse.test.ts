import { describe, it, expect, beforeEach } from "vitest";
import {
  isValidDailyVerse,
  resolveDailyVerse,
  dailyVerseCacheKey,
  getVerseForDate,
} from "./useDailyVerse";

const DATE = "2026-09-11";

// Minimal localStorage stub for the node test environment
class MemoryStorage {
  private store: Record<string, string> = {};
  getItem(k: string) {
    return Object.prototype.hasOwnProperty.call(this.store, k) ? this.store[k] : null;
  }
  setItem(k: string, v: string) {
    this.store[k] = String(v);
  }
  removeItem(k: string) {
    delete this.store[k];
  }
  clear() {
    this.store = {};
  }
  key(i: number) {
    return Object.keys(this.store)[i] ?? null;
  }
  get length() {
    return Object.keys(this.store).length;
  }
}

beforeEach(() => {
  (globalThis as any).localStorage = new MemoryStorage();
});

describe("isValidDailyVerse", () => {
  it("accepts a freshly generated verse", () => {
    expect(isValidDailyVerse(getVerseForDate(DATE))).toBe(true);
  });

  it("rejects old cache without bookId", () => {
    const { bookId, ...legacy } = getVerseForDate(DATE) as any;
    expect(isValidDailyVerse(legacy)).toBe(false);
  });

  it("rejects empty fields and non-objects", () => {
    const v = { ...(getVerseForDate(DATE) as any), text: "  " };
    expect(isValidDailyVerse(v)).toBe(false);
    expect(isValidDailyVerse(null)).toBe(false);
    expect(isValidDailyVerse("x")).toBe(false);
    expect(isValidDailyVerse({ ...(getVerseForDate(DATE) as any), chapter: 0 })).toBe(false);
  });
});

describe("resolveDailyVerse", () => {
  it("generates and caches when there is no cache", () => {
    const verse = resolveDailyVerse(DATE);
    expect(isValidDailyVerse(verse)).toBe(true);
    expect(localStorage.getItem(dailyVerseCacheKey(DATE))).toContain(verse.reference);
  });

  it("regenerates when cached JSON is invalid", () => {
    localStorage.setItem(dailyVerseCacheKey(DATE), "{not-json");
    const verse = resolveDailyVerse(DATE);
    expect(isValidDailyVerse(verse)).toBe(true);
  });

  it("regenerates when cache uses the old format", () => {
    const { bookId, ...legacy } = getVerseForDate(DATE) as any;
    localStorage.setItem("daily-verse:" + DATE, JSON.stringify(legacy));
    localStorage.setItem(dailyVerseCacheKey(DATE), JSON.stringify(legacy));
    const verse = resolveDailyVerse(DATE);
    expect(typeof verse.bookId).toBe("string");
    expect(verse.bookId.length).toBeGreaterThan(0);
    expect(localStorage.getItem("daily-verse:" + DATE)).toBeNull();
  });

  it("reuses a valid cached verse", () => {
    const first = resolveDailyVerse(DATE);
    const second = resolveDailyVerse(DATE);
    expect(second.reference).toBe(first.reference);
  });
});
