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

export function useDailyVerse() {
  const [currentDate, setCurrentDate] = useState(getBrasiliaDate());
  
  const cacheKey = useMemo(() => `daily-verse:${currentDate}`, [currentDate]);
  
  const verse = useMemo(() => {
    // Check localStorage first
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached) as DailyVerse;
      } catch (e) {
        console.error("Failed to parse cached verse", e);
      }
    }
    
    // Calculate and cache
    const freshVerse = getVerseForDate(currentDate);
    localStorage.setItem(cacheKey, JSON.stringify(freshVerse));
    
    // Clean up old daily-verse keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("daily-verse:") && key !== cacheKey) {
        localStorage.removeItem(key);
      }
    });
    
    return freshVerse;
  }, [currentDate, cacheKey]);

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
