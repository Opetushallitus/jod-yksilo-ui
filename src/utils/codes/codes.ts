import i18n, { type LangCode } from '@/i18n/config';
import type { Codeset, TypedMahdollisuus } from '@/routes/types';

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

export const getCodesetValue = async (codeset: Codeset, code: string, lang: LangCode = 'fi') => {
  const imported = await import(`./${codeset}_${lang}.json`);

  if (!Array.isArray(imported?.default)) {
    const { hostname } = window.location;
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
 * Gets all values from a codeset JSON file.
 * @param codeset Codeset name, eg. 'maakunta'
 * @param lang Language code, default 'fi'
 * @returns Array of code and value pairs
 */
export const getAllCodesetValues = async (codeset: Codeset, lang: LangCode = 'fi') => {
  const imported = await import(`./${codeset}_${lang}.json`);

  if (!Array.isArray(imported?.default)) {
    const { hostname } = window.location;
    if (import.meta.env.DEV || ['localhost', 'jodkehitys'].some((str) => hostname.includes(str))) {
      // eslint-disable-next-line no-console
      console.error(`Could not find codeset ${codeset} for language ${lang}!`);
    }
    return [];
  }

  const data = (imported.default ?? []) as ClassificationItem[];
  return data.map((entry) => {
    const nameItem = entry.classificationItemNames.find((item) => item.lang === lang);
    return {
      code: entry.code,
      value: nameItem?.name ?? entry.code,
    };
  });
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

const CACHE_KEY = 'educationCodesetCache';
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const cache: { code: string; value: string; timestamp: number }[] = [];

/**
 * Gets education opportunity Jakauma details from virkailija opintopolku koodisto REST API. Uses a simple localStorage based cache.
 * https://virkailija.opintopolku.fi/koodisto-service/swagger-ui/index.html#/koodisto-resource/searchKoodis
 * @param ids Array of koodiUris
 * @param getLatestVersion Whether to get the latest version of the codes, true by default.
 * @returns Array of code and value pairs. Ids not found are returned with code as value.
 */
export const getEducationCodesetValues = async (ids: string[], getLatestVersion = true) => {
  const codesUrl = new URL('/koodisto-service/rest/json/searchKoodis', window.location.origin);
  // Education codes have #1 at the end, which tells the version of the code. If the version
  // is not stripped, the API will only return results for the first code in the list.
  // Also the #1 causes problems with URLSearchParams, as # will be encoded to %23 and the API will not recognize it.
  const strippedIds = ids.map((id) => id.split('#')[0]);
  try {
    if (cache.length === 0) {
      const storage = localStorage.getItem(CACHE_KEY);

      if (storage) {
        // Get data from storage and remove expired cache items
        const now = Date.now();
        const parsed = ((JSON.parse(storage) as { code: string; value: string; timestamp: number }[]) ?? []).filter(
          (item) => now - item.timestamp <= CACHE_TTL_MS,
        );

        cache.push(...parsed);
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error loading education codeset cache from localStorage:', error);
  }

  const nonCachedIds = strippedIds.filter((id) => !cache.some((item) => item.code === id));

  // All data found in cache, no need to fetch
  if (nonCachedIds.length === 0) {
    return strippedIds.map((id) => cache.find((item) => item.code === id) ?? { code: id, value: id });
  }

  for (const id of nonCachedIds) {
    codesUrl.searchParams.append('koodiUris', id);
  }

  if (getLatestVersion) {
    codesUrl.searchParams.append('koodiVersioSelection', 'LATEST');
  }
  const response = await fetch(codesUrl);
  const codes: OpintopolkuKoodistoResponse[] = (await response.json()) ?? [];

  const fetched = nonCachedIds.map((id) => {
    const code = codes.find((c) => c.koodiUri === id);

    if (code) {
      const value = code.metadata.find((meta) => meta.kieli.toLocaleLowerCase() === i18n.language)?.nimi ?? id;
      return { code: id, value, timestamp: Date.now() };
    } else {
      return { code: id, value: id, timestamp: Date.now() };
    }
  });

  // Put new items into cache and return results
  cache.push(...fetched);

  const removedDuplicates = Array.from(new Set(cache.map((item) => item.code))).map((code) => {
    return cache.find((item) => item.code === code);
  });
  localStorage.setItem(CACHE_KEY, JSON.stringify(removedDuplicates));

  return strippedIds.map((id) => cache.find((item) => item.code === id) ?? { code: id, value: id });
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
