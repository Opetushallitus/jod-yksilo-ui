import { LANG_SESSION_STORAGE_KEY } from '@/constants';
import i18n, { type Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEn from './en/translation.json';
import translationFi from './fi/translation.json';
import translationSv from './sv/translation.json';

export type LangCode = 'fi' | 'sv' | 'en';
export const supportedLanguageCodes: LangCode[] = ['fi', 'sv', 'en'];
export const defaultLang = 'fi';

const resources: Resource = {
  en: { translation: translationEn },
  fi: { translation: translationFi },
  sv: { translation: translationSv },
};

const persistedLang = sessionStorage.getItem(LANG_SESSION_STORAGE_KEY);
const path = location.pathname.split('/');
const urlLang = path.find((p) => supportedLanguageCodes.includes(p as LangCode));
const langToUse = persistedLang ?? urlLang ?? defaultLang;

// Language needs to be persisted to session storage for language selection to work after login.
if (!persistedLang) {
  sessionStorage.setItem(LANG_SESSION_STORAGE_KEY, langToUse);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
i18n.use(initReactI18next).init({
  lng: langToUse,
  supportedLngs: supportedLanguageCodes,
  fallbackLng: defaultLang,
  resources,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
