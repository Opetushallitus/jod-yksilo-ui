import i18n, { type Resource } from 'i18next';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

import commonEn from './common/en.json';
import commonFi from './common/fi.json';
import commonSv from './common/sv.json';
import yksiloEn from './yksilo/en.json';
import yksiloFi from './yksilo/fi.json';
import yksiloSv from './yksilo/sv.json';

export const LANGUAGE_VALUES = ['fi', 'sv', 'en'] as const;
export type LanguageValue = (typeof LANGUAGE_VALUES)[number];
export type LangCode = 'fi' | 'sv' | 'en';
export const supportedLanguageCodes: LangCode[] = ['fi', 'sv', 'en'];
export const defaultLang = 'fi';

export const langLabels = {
  en: 'In English',
  fi: 'Suomeksi',
  sv: 'På svenska',
};

const bundledResources: Record<string, Resource> = {
  en: { common: commonEn, yksilo: yksiloEn },
  fi: { common: commonFi, yksilo: yksiloFi },
  sv: { common: commonSv, yksilo: yksiloSv },
};

await i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: defaultLang,
    ns: ['yksilo', 'common'],
    defaultNS: 'yksilo',
    supportedLngs: supportedLanguageCodes,
    fallbackLng: defaultLang,
    preload: supportedLanguageCodes,
    backend: {
      loadPath: '/yksilo/i18n/{{ns}}/{{lng}}.json',
    },
    interpolation: { escapeValue: false },
    returnEmptyString: false,
    saveMissing: false,
  });

// Add bundled as fallback
for (const lng of supportedLanguageCodes) {
  for (const ns of ['yksilo', 'common']) {
    i18n.addResourceBundle(
      lng,
      ns,
      bundledResources[lng]?.[ns] ?? {},
      true, // deep merge
      false, // do not overwrite HTTP values
    );
  }
}

export default i18n;
