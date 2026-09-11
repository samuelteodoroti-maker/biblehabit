import { describe, expect, it } from "vitest";
import {
  addDaysToKey,
  computeReadingStats,
  formatDays,
  formatMonthLabel,
  getLocalDateKey,
} from "./reading-days";

const TODAY = "2026-09-11";

describe("computeReadingStats", () => {
  it("1. primeira leitura do usuário", () => {
    const s = computeReadingStats([TODAY], TODAY);
    expect(s.total_read_days).toBe(1);
    expect(s.current_streak).toBe(1);
    expect(s.longest_streak).toBe(1);
  });

  it("2. duas leituras no mesmo dia contam um dia", () => {
    const s = computeReadingStats([TODAY, TODAY], TODAY);
    expect(s.total_read_days).toBe(1);
    expect(s.current_streak).toBe(1);
  });

  it("3. dias consecutivos", () => {
    const s = computeReadingStats(["2026-09-09", "2026-09-10", TODAY], TODAY);
    expect(s.current_streak).toBe(3);
    expect(s.total_read_days).toBe(3);
  });

  it("4. um dia perdido quebra a ofensiva atual mas mantém o recorde", () => {
    const s = computeReadingStats(["2026-09-01", "2026-09-02", "2026-09-03", TODAY], TODAY);
    expect(s.current_streak).toBe(1);
    expect(s.longest_streak).toBe(3);
    expect(s.longest_gap).toBe(7);
  });

  it("5. leitura de ontem sem leitura hoje mantém a ofensiva", () => {
    const s = computeReadingStats(["2026-09-09", "2026-09-10"], TODAY);
    expect(s.current_streak).toBe(2);
  });

  it("6. sem leitura hoje nem ontem zera a ofensiva atual", () => {
    const s = computeReadingStats(["2026-09-01", "2026-09-02"], TODAY);
    expect(s.current_streak).toBe(0);
    expect(s.longest_streak).toBe(2);
  });

  it("7. datas futuras nunca contam", () => {
    const s = computeReadingStats([TODAY, "2026-09-20"], TODAY);
    expect(s.total_read_days).toBe(1);
    expect(s.last_read_date).toBe(TODAY);
  });

  it("8. recorde pode ser maior que a ofensiva atual", () => {
    const s = computeReadingStats(
      ["2026-08-01", "2026-08-02", "2026-08-03", "2026-08-04", "2026-09-10", TODAY],
      TODAY,
    );
    expect(s.longest_streak).toBe(4);
    expect(s.current_streak).toBe(2);
  });

  it("9. excluir a única leitura do dia remove o dia", () => {
    const dates = new Set(["2026-09-10", TODAY]);
    dates.delete(TODAY);
    expect(computeReadingStats(dates, TODAY).total_read_days).toBe(1);
  });

  it("10. sem leituras retorna zeros", () => {
    const s = computeReadingStats([], TODAY);
    expect(s).toMatchObject({ current_streak: 0, longest_streak: 0, total_read_days: 0 });
  });

  it("11. médias por semana e por mês", () => {
    const s = computeReadingStats(["2026-09-05", "2026-09-11"], TODAY);
    expect(s.weekly_average).toBeGreaterThan(0);
    expect(s.monthly_average).toBeGreaterThan(0);
  });
});

describe("datas e formatação", () => {
  it("data local não muda por causa do UTC perto da meia-noite", () => {
    // 11/09/2026 02:30 UTC = 10/09/2026 23:30 em São Paulo
    const d = new Date("2026-09-11T02:30:00Z");
    expect(getLocalDateKey("America/Sao_Paulo", d)).toBe("2026-09-10");
    expect(getLocalDateKey("UTC", d)).toBe("2026-09-11");
  });

  it("fuso horário diferente produz dia civil diferente", () => {
    const d = new Date("2026-09-11T12:00:00Z");
    expect(getLocalDateKey("Pacific/Kiritimati", d)).toBe("2026-09-12");
  });

  it("navegação de dez anos", () => {
    expect(addDaysToKey("2026-09-11", -1)).toBe("2026-09-10");
    expect(addDaysToKey("2026-02-28", 1)).toBe("2026-03-01");
  });

  it("plural e rótulo de mês", () => {
    expect(formatDays(0)).toBe("0 dias");
    expect(formatDays(1)).toBe("1 dia");
    expect(formatDays(2)).toBe("2 dias");
    expect(formatMonthLabel(2026, 8)).toBe("setembro de 2026");
  });
});
