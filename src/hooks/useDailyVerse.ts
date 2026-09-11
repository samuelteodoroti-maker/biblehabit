import { useState, useEffect, useMemo, useCallback } from "react";
import { FULL_DATASET, DailyVerse } from "@/lib/bible-verses";

/**
 * Gets current date in America/Sao_Paulo timezone
 */
export function getBrasiliaDate() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now); // YYYY-MM-DD
}

/**
 * Gets a deterministic verse for a given YYYY-MM-DD string
 */
export function getVerseForDate(dateStr: string): DailyVerse {
  const [year, month, day] = dateStr.split("-").map(Number);
  
  // dateSerial: days since Unix epoch
  const dateSerial = Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
  
  const index = dateSerial % FULL_DATASET.length;
  let verse = FULL_DATASET[index];

  // Check against previous day to avoid duplicates
  if (dateSerial > 0) {
    const prevDate = new Date(Date.UTC(year, month - 1, day) - 86_400_000);
    const prevDateStr = prevDate.toISOString().split("T")[0];
    const prevVerse = getVerseForDatePure(prevDateStr);
    
    if (verse.reference === prevVerse.reference) {
      // Pick next stable index
      verse = FULL_DATASET[(index + 1) % FULL_DATASET.length];
    }
  }

  return verse;
}

// Pure version without recursion depth risk for simple check
function getVerseForDatePure(dateStr: string): DailyVerse {
  const [year, month, day] = dateStr.split("-").map(Number);
  const dateSerial = Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
  const index = dateSerial % FULL_DATASET.length;
  return FULL_DATASET[index];
}

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

const isPositiveInt = (v: unknown): v is number =>
  typeof v === "number" && Number.isInteger(v) && v > 0;

/**
 * Validates a verse object recovered from cache (old formats are rejected).
 */
export function isValidDailyVerse(value: unknown): value is DailyVerse {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    isNonEmptyString(v["bookId"]) &&
    isNonEmptyString(v["book"]) &&
    isPositiveInt(v["chapter"]) &&
    isPositiveInt(v["verse"]) &&
    isNonEmptyString(v["text"]) &&
    isNonEmptyString(v["reference"])
  );
}

export const DAILY_VERSE_CACHE_PREFIX = "daily-verse:";
export const dailyVerseCacheKey = (date: string) => `daily-verse:v2:${date}`;

/**
 * Reads the cached verse for a date, regenerating it whenever the stored value
 * is missing, corrupted or in an older format. Never throws.
 */
export function resolveDailyVerse(currentDate: string): DailyVerse {
  const cacheKey = dailyVerseCacheKey(currentDate);

  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as unknown;
      if (isValidDailyVerse(parsed)) return parsed;
    }
  } catch {
    // corrupted JSON -> fall through and regenerate
  }

  try {
    localStorage.removeItem(cacheKey);
  } catch {
    /* ignore */
  }

  const freshVerse = getVerseForDate(currentDate);

  try {
    localStorage.setItem(cacheKey, JSON.stringify(freshVerse));
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(DAILY_VERSE_CACHE_PREFIX) && key !== cacheKey) {
        localStorage.removeItem(key);
      }
    });
  } catch {
    /* storage unavailable: verse still works in memory */
  }

  return freshVerse;
}

export function useDailyVerse() {
  const [currentDate, setCurrentDate] = useState(getBrasiliaDate());

  const verse = useMemo(() => {
    if (typeof window === "undefined") return getVerseForDate(currentDate);
    return resolveDailyVerse(currentDate);
  }, [currentDate]);

  const updateDate = useCallback(() => {
    const newDate = getBrasiliaDate();
    if (newDate !== currentDate) {
      setCurrentDate(newDate);
    }
  }, [currentDate]);

  useEffect(() => {
    // Initial check
    updateDate();

    // 1. Every minute check
    const interval = setInterval(updateDate, 60_000);

    // 2. Visibility change check (back from background)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateDate();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 3. Schedule check for next midnight
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const msToMidnight = nextMidnight.getTime() - now.getTime();
    
    const midnightTimer = setTimeout(updateDate, msToMidnight + 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(midnightTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [updateDate]);

  return { verse, currentDate };
}
