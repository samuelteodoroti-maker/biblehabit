/**
 * Camada única de domínio para datas locais e cálculo de dias/ofensiva.
 * As mesmas regras existem na função SQL public.get_reading_stats — este módulo
 * serve para a interface (otimismo local) e para os testes automatizados.
 */

export const DEFAULT_TIMEZONE = "America/Sao_Paulo";

/** Data civil (YYYY-MM-DD) no fuso informado. Nunca usar toISOString(). */
export function getLocalDateKey(timeZone: string = DEFAULT_TIMEZONE, date: Date = new Date()): string {
  try {
    // en-CA formata como YYYY-MM-DD
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: DEFAULT_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }
}

export function dateKey(year: number, month0: number, day: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${year}-${pad(month0 + 1)}-${pad(day)}`;
}

/** Converte YYYY-MM-DD em número de dias (sem fuso). */
export function toDayNumber(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Math.floor(Date.UTC(y, (m ?? 1) - 1, d ?? 1) / 86_400_000);
}

export function addDaysToKey(key: string, days: number): string {
  const ms = (toDayNumber(key) + days) * 86_400_000;
  const d = new Date(ms);
  return dateKey(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export type ReadingStats = {
  current_streak: number;
  longest_streak: number;
  total_read_days: number;
  first_read_date: string | null;
  last_read_date: string | null;
  longest_gap: number;
  weekly_average: number;
  monthly_average: number;
};

/**
 * Fórmula da ofensiva:
 * - datas distintas, ignorando datas futuras;
 * - se houver leitura hoje, conta retroativamente a partir de hoje;
 * - se não houver hoje mas houver ontem, conta a partir de ontem;
 * - caso contrário, ofensiva atual = 0.
 */
export function computeReadingStats(dates: Iterable<string>, todayKey: string): ReadingStats {
  const todayNum = toDayNumber(todayKey);
  const unique = Array.from(new Set(Array.from(dates)))
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && toDayNumber(d) <= todayNum)
    .sort();

  if (unique.length === 0) {
    return {
      current_streak: 0,
      longest_streak: 0,
      total_read_days: 0,
      first_read_date: null,
      last_read_date: null,
      longest_gap: 0,
      weekly_average: 0,
      monthly_average: 0,
    };
  }

  const nums = unique.map(toDayNumber);
  let longest = 1;
  let run = 1;
  let longestGap = 0;
  let current = 0;
  let runEnd = nums[0];

  const closeRun = () => {
    if (runEnd >= todayNum - 1) current = Math.max(current, run);
    longest = Math.max(longest, run);
  };

  for (let i = 1; i < nums.length; i++) {
    const gap = nums[i] - nums[i - 1] - 1;
    if (gap === 0) {
      run += 1;
    } else {
      closeRun();
      longestGap = Math.max(longestGap, gap);
      run = 1;
    }
    runEnd = nums[i];
  }
  closeRun();

  const span = Math.max(todayNum - nums[0] + 1, 1);
  const round2 = (n: number) => Math.round(n * 100) / 100;

  return {
    current_streak: current,
    longest_streak: longest,
    total_read_days: unique.length,
    first_read_date: unique[0],
    last_read_date: unique[unique.length - 1],
    longest_gap: longestGap,
    weekly_average: round2(unique.length / (span / 7)),
    monthly_average: round2(unique.length / (span / 30)),
  };
}

/** Plural correto: "1 dia", "2 dias". */
export function formatDays(count: number): string {
  return `${count} ${count === 1 ? "dia" : "dias"}`;
}

/** "setembro de 2026" em minúsculas. */
export function formatMonthLabel(year: number, month0: number): string {
  return new Date(Date.UTC(year, month0, 1))
    .toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" })
    .toLowerCase();
}

export function formatFullDate(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
