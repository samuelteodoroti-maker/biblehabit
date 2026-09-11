import { describe, expect, it } from "vitest";
import {
  APP_VERSION,
  APP_VERSION_LABEL,
  RELEASE_NOTES,
  compareVersions,
  getLatestRelease,
  getReleaseHistory,
  hasUnseenRelease,
} from "./releaseNotes";

describe("releaseNotes", () => {
  it("expõe a versão atual como a primeira nota", () => {
    expect(APP_VERSION).toBe(RELEASE_NOTES[0]!.version);
    expect(APP_VERSION_LABEL).toBe(`Bible Habit — versão ${APP_VERSION}`);
  });

  it("ordena o histórico da versão mais recente para a mais antiga", () => {
    const history = getReleaseHistory();
    expect(history).toHaveLength(RELEASE_NOTES.length);
    for (let i = 1; i < history.length; i += 1) {
      expect(compareVersions(history[i - 1]!.version, history[i]!.version)).toBeGreaterThan(0);
    }
    expect(getLatestRelease().version).toBe(APP_VERSION);
  });

  it("mantém versões únicas, datas válidas e resumo em cada entrada", () => {
    const seen = new Set<string>();
    for (const note of RELEASE_NOTES) {
      expect(seen.has(note.version)).toBe(false);
      seen.add(note.version);
      expect(note.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(note.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(note.title.length).toBeGreaterThan(0);
      expect(note.summary.length).toBeGreaterThan(0);
    }
  });

  it("compara versões semânticas corretamente", () => {
    expect(compareVersions("1.6.0", "1.5.9")).toBe(1);
    expect(compareVersions("1.5.0", "1.6.0")).toBe(-1);
    expect(compareVersions("2.0.0", "1.99.99")).toBe(1);
    expect(compareVersions("1.6.0", "1.6")).toBe(0);
  });

  it("detecta atualização não visualizada", () => {
    expect(hasUnseenRelease(null)).toBe(true);
    expect(hasUnseenRelease("")).toBe(true);
    expect(hasUnseenRelease("abc")).toBe(true);
    expect(hasUnseenRelease("1.0.0")).toBe(true);
    expect(hasUnseenRelease(APP_VERSION)).toBe(false);
    expect(hasUnseenRelease("99.0.0")).toBe(false);
  });
});
