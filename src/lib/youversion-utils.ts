import { getBookById } from "./bible-canon";

export type YouVersionBibleConfig = {
  appLocale: string;
  youVersionLocale: string;
  versionId: number;
  versionAbbreviation: string;
};

/**
 * Validated YouVersion version IDs and Abbreviations per locale.
 * Rules:
 * - pt-BR: NVI (ID 129) or ARA (ID 1608) or NTLH (ID 211)
 * - en-US: NIV (ID 111) or ESV (ID 59)
 * - es-ES: RVR1960 (ID 149) or NVI (ID 128)
 */
export const BIBLE_VERSIONS_BY_LOCALE: Record<string, YouVersionBibleConfig> = {
  "pt-BR": {
    appLocale: "pt-BR",
    youVersionLocale: "pt",
    versionId: 211, // NTLH (Nova Tradução na Linguagem de Hoje) - common for devotionals
    versionAbbreviation: "NTLH",
  },
  "pt-PT": {
    appLocale: "pt-PT",
    youVersionLocale: "pt",
    versionId: 211,
    versionAbbreviation: "NTLH",
  },
  "en-US": {
    appLocale: "en-US",
    youVersionLocale: "en",
    versionId: 111, // NIV (New International Version)
    versionAbbreviation: "NIV",
  },
  "en-GB": {
    appLocale: "en-GB",
    youVersionLocale: "en",
    versionId: 111,
    versionAbbreviation: "NIV",
  },
  "es-ES": {
    appLocale: "es-ES",
    youVersionLocale: "es",
    versionId: 149, // RVR1960 (Reina-Valera 1960)
    versionAbbreviation: "RVR1960",
  },
  "es-MX": {
    appLocale: "es-MX",
    youVersionLocale: "es",
    versionId: 149,
    versionAbbreviation: "RVR1960",
  },
  "fr-FR": {
    appLocale: "fr-FR",
    youVersionLocale: "fr",
    versionId: 63, // LSG (Louis Segond 1910)
    versionAbbreviation: "LSG",
  },
  "de-DE": {
    appLocale: "de-DE",
    youVersionLocale: "de",
    versionId: 51, // LUTH1545 (Luther Bibel 1545)
    versionAbbreviation: "LUTH1545",
  },
  "it-IT": {
    appLocale: "it-IT",
    youVersionLocale: "it",
    versionId: 119, // NR06 (Nuova Riveduta 2006)
    versionAbbreviation: "NR06",
  },
};

export const DEFAULT_LOCALE = "pt-BR";

/**
 * Map of locale to YouVersion language code
 */
const youVersionLocaleMap: Record<string, string> = {
  "pt-BR": "pt",
  "pt-PT": "pt",
  "en-US": "en",
  "en-GB": "en",
  "es-ES": "es",
  "es-MX": "es",
  "fr-FR": "fr",
  "de-DE": "de",
  "it-IT": "it",
};

export type BuildUrlParams = {
  appLocale: string;
  bookId: string;
  chapter: number;
};

/**
 * Centralized function to build YouVersion Context URLs with robust fallbacks
 */
export function buildYouVersionContextUrl({
  appLocale,
  bookId,
  chapter,
}: BuildUrlParams): string {
  // 1. Normalize locale
  const locale = appLocale || DEFAULT_LOCALE;
  const config = BIBLE_VERSIONS_BY_LOCALE[locale] || BIBLE_VERSIONS_BY_LOCALE[DEFAULT_LOCALE];
  const yvLocale = youVersionLocaleMap[locale] || youVersionLocaleMap[DEFAULT_LOCALE] || "pt";

  // 2. Validate Book and Chapter
  const book = getBookById(bookId.toUpperCase());
  const isValidChapter = book && chapter > 0 && chapter <= book.chapters.length;

  if (!book || !isValidChapter) {
    // Fallback 1: Localized generic Bible link
    return `https://www.bible.com/${yvLocale}/bible`;
  }

  // 3. Build specific URL: https://www.bible.com/{idioma}/bible/{versionId}/{BOOK}.{chapter}.{versionAbbreviation}
  return `https://www.bible.com/${config.youVersionLocale}/bible/${config.versionId}/${book.id}.${chapter}.${config.versionAbbreviation}`;
}

/**
 * Gets the current app language based on priority:
 * 1. Profile preference (if implemented)
 * 2. Local settings (localStorage)
 * 3. Default app language
 */
export function getCurrentAppLocale(profileLocale?: string | null): string {
  if (profileLocale) return profileLocale;
  
  try {
    const local = localStorage.getItem("bh_language");
    if (local) return local;
  } catch (e) {
    // Ignore localStorage errors
  }
  
  return DEFAULT_LOCALE;
}
