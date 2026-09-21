import i18n, { supportedLanguageCodes, type LangCode } from '@/i18n/config';
import { TypedMahdollisuus } from '@/routes/types';
import { isFeatureEnabled } from '@/utils/features';
import type { Codeset } from '@/utils/jakaumaUtils';

/**
 Koulutusala contains data from here https://api.stat.fi/classificationservice/open/api/classifications/v2/classifications/koulutusala_1_20160101/classificationItems?content=data&meta=max&lang=fi&format=json.
 It is shortened to contain only necessary levels by following command: jq '[.[] | select(.level <= 2)]' koulutusala_fi.json > koulutusala_fi_small.json
 */
import koulutusalaData from './koulutusala_fi.json';
/**
 Toimiala is bundled in two versions, TOL 2008 (toimiala_*.json, classification toimiala_1_20080101)
 and TOL 2025 (toimiala2025_*.json, classification toimiala_1_20250101). They are generated with:

 for L in fi sv en; do
   curl -s "https://api.stat.fi/classificationservice/open/api/classifications/v2/classifications/<CLASSIFICATION>/classificationItems?content=data&meta=max&lang=$L" \
   | jq '[.[] | select(.level <= 2) | {code, level, parentCode, classificationItemNames}]' > <PREFIX>_$L.json
 done
 */
import toimiala2025Data from './toimiala2025_fi.json';
import toimialaData from './toimiala_fi.json';

export interface ClassificationItem {
  level: number;
  code: string;
  parentCode: string | null;
  classificationItemNames: {
    langName: string;
    lang: string;
    name: string;
  }[];
}

// Tilastokeskus sources for the JSON files
// https://stat.fi/fi/luokitukset/maakunta/maakunta_1_20250101
// https://stat.fi/fi/luokitukset/kieli/kieli_1_20101115
// https://stat.fi/fi/luokitukset/kunta/kunta_1_20250101
// https://stat.fi/fi/luokitukset/valtio/valtio_2_20120101
// https://stat.fi/fi/luokitukset/toimiala/toimiala_1_20080101
// https://stat.fi/fi/luokitukset/toimiala/toimiala_1_20250101

/**
 * TOL 2008 and TOL 2025 are not interchangeable: TOL 2025 splits section J in two, which shifts
 * every following section letter by one (2008 K = Rahoitus -> 2025 L, 2008 Q = Terveys- ja
 * sosiaalipalvelut -> 2025 R), and 35 two-digit division codes end up under a different section.
 * Every TOL 2025 two-digit code also exists in TOL 2008, so the active classification cannot be
 * detected from the data and must be selected explicitly. The backend switches its codes
 * independently of this UI, so the choice is a runtime feature flag rather than a build-time one.
 */
const resolveCodesetFile = (codeset: Codeset): string =>
  codeset === 'toimiala' && isFeatureEnabled('TOIMIALA_TOL2025') ? 'toimiala2025' : codeset;

/**
 * Identifier of the active toimiala classification. Stored alongside persisted toimiala codes so
 * that selections made under the other version can be discarded instead of silently changing
 * meaning, since the same section letter denotes a different industry in TOL 2008 and TOL 2025.
 */
export const getToimialaLuokitus = (): string => resolveCodesetFile('toimiala');

// Lazy caches, keyed by the resolved file name so the two toimiala versions never share an entry.
const codesetItemsCache = new Map<string, Map<LangCode, Promise<ClassificationItem[]>>>();
const codesetCache = new Map<string, Map<LangCode, Promise<Map<string, string>>>>();

const getFromCache = <T>(
  cache: Map<string, Map<LangCode, Promise<T>>>,
  file: string,
  lang: LangCode,
  load: () => Promise<T>,
): Promise<T> => {
  let langMap = cache.get(file);
  if (!langMap) {
    langMap = new Map<LangCode, Promise<T>>();
    cache.set(file, langMap);
  }

  let cachedPromise = langMap.get(lang);
  if (!cachedPromise) {
    cachedPromise = load();
    langMap.set(lang, cachedPromise);
  }

  return cachedPromise;
};

/**
 * Lazily loads and caches the raw classification items of a codeset for a given language.
 * Use this when the hierarchy is needed (level, parentCode); for plain code -> name lookups
 * use getCodeset or getCodesetValue.
 * @param codeset Codeset name
 * @param lang Language code
 * @returns Promise resolving to the classification items, or an empty array if the file is missing
 */
export const getCodesetItems = (codeset: Codeset, lang: LangCode): Promise<ClassificationItem[]> => {
  const file = resolveCodesetFile(codeset);

  return getFromCache(codesetItemsCache, file, lang, () =>
    import(`./${file}_${lang}.json`).then((imported) => {
      if (!Array.isArray(imported?.default)) {
        const { hostname } = globalThis.location;
        if (import.meta.env.DEV || ['localhost', 'jodkehitys'].some((str) => hostname.includes(str))) {
          console.error(`Could not find codeset ${file} for language ${lang}!`);
        }
        return [];
      }

      return imported.default as ClassificationItem[];
    }),
  );
};

/**
 * Lazily loads and caches a codeset for a given language.
 * Returns a promise that resolves to a Map of code -> value.
 * @param codeset Codeset name
 * @param lang Language code
 * @returns Promise resolving to Map<code, value>
 */
export const getCodeset = (codeset: Codeset, lang: LangCode): Promise<Map<string, string>> =>
  getFromCache(codesetCache, resolveCodesetFile(codeset), lang, async () => {
    const codeMap = new Map<string, string>();

    for (const entry of await getCodesetItems(codeset, lang)) {
      const nameItem = entry.classificationItemNames.find((item) => item.lang === lang);
      if (nameItem?.name) {
        codeMap.set(entry.code, nameItem.name);
      }
    }
    return codeMap;
  });

/**
 * Fetches a value from a codeset JSON file.
 * File must be named as `${CODESET NAME}_${LANG}.json`.
 * Uses lazy caching via getCodeSet.
 * @param codeset Codeset name
 * @param code Code
 * @param lang Language code
 * @returns The localized value for the code, or the code itself if not found
 */
export const getCodesetValue = async (codeset: Codeset, code: string, lang: LangCode) => {
  const codeMap = await getCodeset(codeset, lang);
  return codeMap.get(code) ?? code;
};

const toByCode = (data: unknown[]) => {
  const byCode = new Map<string, Partial<ClassificationItem>>();
  for (const obj of data) {
    if (!obj || typeof obj !== 'object') continue;
    const o = obj as Record<string, unknown>;
    if (typeof o.code === 'string') {
      byCode.set(o.code, o as Partial<ClassificationItem>);
    }
  }
  return byCode;
};

// Language-independent lookups (only code/level/parentCode are read), so the fi files suffice.
// Both toimiala versions are bundled: getToimiala is called per suggestion while filtering and
// has to stay synchronous, and the trimmed files are small enough to carry both.
const toimialaByCode = new Map<string, Map<string, Partial<ClassificationItem>>>([
  ['toimiala', toByCode(toimialaData)],
  ['toimiala2025', toByCode(toimiala2025Data)],
]);

export const getToimiala = (code: string): Partial<ClassificationItem> | undefined =>
  toimialaByCode.get(resolveCodesetFile('toimiala'))?.get(code);

export const getKoulutusala = (code: string): Partial<ClassificationItem> | undefined => {
  const entry = koulutusalaData.find((obj) => {
    if (!obj || typeof obj !== 'object') return false;
    const o = obj as Record<string, unknown>;
    return typeof o.code === 'string' && o.code === code;
  }) as Partial<ClassificationItem> | undefined;
  return entry;
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
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const objWithIndex = obj as Record<string, unknown>;
  for (const key in objWithIndex) {
    if (!supportedLanguageCodes.includes(key as LangCode)) {
      return false;
    }
    if (!isCodeItemCache(objWithIndex[key])) {
      return false;
    }
  }
  return true;
};

const isCodeItemCache = (obj: unknown): obj is CodeItemCache => {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const objWithIndex = obj as Record<string, unknown>;
  for (const key in objWithIndex) {
    const item = objWithIndex[key];
    if (!isCachedCodeItem(item)) {
      return false;
    }
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
    if (Object.keys(cache.fi).length > 0 || Object.keys(cache.sv).length > 0 || Object.keys(cache.en).length > 0) {
      return;
    }

    const storage = localStorage.getItem(CACHE_KEY);
    if (!storage) {
      return;
    }

    const parsed = JSON.parse(storage);
    if (!isLocalizedCodeItemCache(parsed)) {
      return;
    }

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
