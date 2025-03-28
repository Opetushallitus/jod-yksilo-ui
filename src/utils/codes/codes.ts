import { type LangCode } from '@/i18n/config';
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
