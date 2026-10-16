import i18n, { type InitOptions, type Resource } from 'i18next';
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

const TRANSLATION_REQUEST_TIMEOUT_MS = 3000;

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
      loadPath: '/i18n/{{ns}}/{{lng}}.json',
      // Cap how long a slow translation origin can delay startup; bundled translations are used after the timeout.
      requestOptions: () =>
        typeof AbortSignal.timeout === 'function'
          ? { signal: AbortSignal.timeout(TRANSLATION_REQUEST_TIMEOUT_MS) }
          : {},
    },
    interpolation: { escapeValue: false },
    returnEmptyString: false,
    saveMissing: false,
    maxRetries: 0,
    showSupportNotice: false,
  } as InitOptions);

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
