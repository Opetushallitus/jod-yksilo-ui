import i18n, { type LangCode } from '@/i18n/config';
import { type Codeset } from '@/routes/types';

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

/**
 * Gets education opportunity Jakauma details from virkailija opintopolku koodisto REST API
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
  strippedIds.forEach((id) => codesUrl.searchParams.append('koodiUris', id));

  if (getLatestVersion) {
    codesUrl.searchParams.append('koodiVersioSelection', 'LATEST');
  }

  const response = await fetch(codesUrl);
  const codes: OpintopolkuKoodistoResponse[] = (await response.json()) ?? [];

  const codesets = strippedIds.map((id) => {
    const code = codes.find((c) => c.koodiUri === id);

    if (code) {
      const value = code.metadata.find((meta) => meta.kieli.toLocaleLowerCase() === i18n.language)?.nimi ?? id;
      return { code: id, value };
    } else {
      return { code: id, value: id };
    }
  });

  return codesets;
};
