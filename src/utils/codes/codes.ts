import i18n, { supportedLanguageCodes, type LangCode } from '@/i18n/config';
import { TypedMahdollisuus } from '@/routes/types';
import type { Codeset } from '@/utils/jakaumaUtils';

export interface Classification {
  localId: string;
  internationalRecommendation: boolean;
  nationalRecommendation: boolean;
  classificationName: {
    langName: string;
    lang: string;
    name: string;
  }[];
  classificationDescription: {
    langName: string;
    lang: string;
    description: string;
  }[];
}

export interface ClassificationItem {
  classification: Classification;
  localId: string;
  level: number;
  code: string;
  order: number;
  modifiedDate: string;
  parentItemLocalId: string | null;
  parentCode: string | null;
  classificationItemNames: {
    langName: string;
    lang: string;
    name: string;
  }[];
  explanatoryNotes: unknown[];
  classificationIndexEntry: {
    text: string[];
  };
}

// Tilastokeskus sources for the JSON files
// https://stat.fi/fi/luokitukset/maakunta/maakunta_1_20250101
// https://stat.fi/fi/luokitukset/kieli/kieli_1_20101115
// https://stat.fi/fi/luokitukset/kunta/kunta_1_20250101
// https://stat.fi/fi/luokitukset/valtio/valtio_2_20120101

/**
 * Fetches a value from a codeset JSON file.
 * File must be named as `${CODESET NAME}_${LANG}.json`.
 * @param codeset Codeset name
 * @param code Code
 * @param lang Language code
 * @returns
 */

export const getCodesetValue = async (codeset: Codeset, code: string, lang: LangCode) => {
  const imported = await import(`./${codeset}_${lang}.json`);

  if (!Array.isArray(imported?.default)) {
    const { hostname } = globalThis.location;
    if (import.meta.env.DEV || ['localhost', 'jodkehitys'].some((str) => hostname.includes(str))) {
      // eslint-disable-next-line no-console
      console.error(`Could not find codeset ${codeset} for language ${lang}!`);
    }
    return code;
  }

  const data = (imported.default ?? []) as ClassificationItem[];
  const entry = data.find((entry) => entry.code === code);
  const nameItem = entry?.classificationItemNames.find((item) => item.lang === lang);
  return nameItem?.name ?? code;
};

/**
 * Minimal interface for opintopolku koodisto service response
 */
export interface OpintopolkuKoodistoResponse {
  koodiUri: string;
  koodiArvo: string;
  voimassaAlkuPvm: string;
  voimassaLoppuPvm: string | null;
  metadata: {
    kieli: 'FI' | 'SV' | 'EN';
    nimi: string;
    lyhytNimi: string;
    kuvaus: string;
  }[];
}

interface CachedCodeItem {
  value: string;
  timestamp: number;
}
type CodeItemCache = Record<string, CachedCodeItem>;

type LocalizedCodeItemCache = Record<LangCode, CodeItemCache>;

const isLocalizedCodeItemCache = (obj: unknown): obj is LocalizedCodeItemCache => {
  if (typeof obj !== 'object' || obj === null) return false;
  const objWithIndex = obj as Record<string, unknown>;
  for (const key in objWithIndex) {
    if (!supportedLanguageCodes.includes(key as LangCode)) return false;
    if (!isCodeItemCache(objWithIndex[key])) return false;
  }
  return true;
};

const isCodeItemCache = (obj: unknown): obj is CodeItemCache => {
  if (typeof obj !== 'object' || obj === null) return false;
  const objWithIndex = obj as Record<string, unknown>;
  for (const key in objWithIndex) {
    const item = objWithIndex[key];
    if (!isCachedCodeItem(item)) return false;
  }
  return true;
};

const isCachedCodeItem = (obj: unknown): obj is CachedCodeItem => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'value' in obj &&
    typeof (obj as CachedCodeItem).value === 'string' &&
    'timestamp' in obj &&
    typeof (obj as CachedCodeItem).timestamp === 'number'
  );
};

const CACHE_KEY = 'educationCodesetCache';
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const cache: LocalizedCodeItemCache = {
  fi: {},
  sv: {},
  en: {},
};

const loadCacheFromStorage = () => {
  try {
    if (Object.keys(cache.fi).length > 0 || Object.keys(cache.sv).length > 0 || Object.keys(cache.en).length > 0)
      return;

    const storage = localStorage.getItem(CACHE_KEY);
    if (!storage) return;

    const parsed = JSON.parse(storage);
    if (!isLocalizedCodeItemCache(parsed)) return;

    const now = Date.now();
    for (const langCode of Object.keys(parsed) as LangCode[]) {
      if (supportedLanguageCodes.includes(langCode)) {
        const codeItemCache = parsed[langCode];
        cache[langCode] = Object.fromEntries(
          Object.entries(codeItemCache).filter(([_, item]) => now - item.timestamp <= CACHE_TTL_MS),
        );
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error loading education codeset cache from localStorage:', error);
  }
};

const updateCache = (codes: OpintopolkuKoodistoResponse[], ids: string[]) => {
  for (const id of ids) {
    const code = codes.find((c) => c.koodiUri === id);
    for (const metaData of code?.metadata ?? []) {
      const metaLang = metaData.kieli.toLocaleLowerCase() as LangCode;
      if (supportedLanguageCodes.includes(metaLang)) {
        if (!cache[metaLang]) {
          cache[metaLang] = {};
        }
        cache[metaLang][id] = {
          value: metaData.nimi,
          timestamp: Date.now(),
        };
      }
    }
  }
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};

/**
 * Gets education opportunity Jakauma details from virkailija opintopolku koodisto REST API. Uses a simple localStorage based cache.
 * https://virkailija.opintopolku.fi/koodisto-service/swagger-ui/index.html#/koodisto-resource/searchKoodis
 * @param ids Array of koodiUris
 * @param getLatestVersion Whether to get the latest version of the codes, true by default.
 * @returns Array of code and value pairs. Ids not found are returned with code as value.
 */
export const getEducationCodesetValues = async (ids: string[], getLatestVersion = true) => {
  const lang = i18n.language as LangCode;
  const strippedIds = ids.map((id) => id.split('#')[0]);

  loadCacheFromStorage();

  const currentLangCache = cache[lang] ?? {};
  const nonCachedIds = strippedIds.filter((id) => !currentLangCache[id]);

  if (nonCachedIds.length === 0) {
    return strippedIds.map((id) => ({ code: id, value: currentLangCache[id]?.value ?? id }));
  }

  const codesUrl = new URL('/koodisto-service/rest/json/searchKoodis', globalThis.location.origin);
  for (const id of nonCachedIds) {
    codesUrl.searchParams.append('koodiUris', id);
  }
  if (getLatestVersion) {
    codesUrl.searchParams.append('koodiVersioSelection', 'LATEST');
  }

  const response = await fetch(codesUrl);
  const codes: OpintopolkuKoodistoResponse[] = (await response.json()) ?? [];

  updateCache(codes, nonCachedIds);

  return strippedIds.map((id) => ({ code: id, value: cache[lang]?.[id]?.value ?? id }));
};

/**
 * Maps the yleisinKoulutusala codes to their corresponding labels.
 * @param opportunities TypedMahdollisuus array with yleisinKoulutusala codes
 * @returns TypedMahdollisuus array with yleisinKoulutusala codes replaced with labels
 */
export const mapKoulutusCodesToLabels = async (opportunities: TypedMahdollisuus[]): Promise<TypedMahdollisuus[]> => {
  const yleisinKoulutusalaCodes = opportunities.map((m) => m.yleisinKoulutusala).filter(Boolean) as string[];
  const codeData = await getEducationCodesetValues(yleisinKoulutusalaCodes);
  return opportunities.map((m) => ({
    ...m,
    yleisinKoulutusala: codeData.find((c) => c.code === m.yleisinKoulutusala?.replaceAll('#1', ''))?.value,
  }));
};
