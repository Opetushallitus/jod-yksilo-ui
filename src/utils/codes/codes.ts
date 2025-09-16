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
 * @param ids Array of koodiUris
 * @returns Array of code and value pairs. Ids not found are returned with code as value.
 */
export const getEducationCodesetValues = async (ids: string[]) => {
  const codesUrl = new URL('/opintopolku/koodisto-service/rest/json/searchKoodis', window.location.origin);
  const strippedIds = ids.map((id) => id.replace('#1', '')); // For some reason our education codes have #1 at the end and API won't recognize them
  strippedIds.forEach((id) => codesUrl.searchParams.append('koodiUris', id));
  const response = await fetch(codesUrl);
  const codes: OpintopolkuKoodistoResponse[] = (await response.json()) ?? [];

  const codesets = strippedIds.map((id) => {
    const koodisto = codes.find((code) => code.koodiUri === id);

    if (koodisto) {
      const value = koodisto.metadata.find((meta) => meta.kieli.toLocaleLowerCase() === i18n.language)?.nimi ?? id;
      return { code: id, value };
    } else {
      return { code: id, value: id };
    }
  });

  return codesets;
};
