import i18n, { type Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEn from './en/translation.json';
import translationFi from './fi/translation.json';
import translationSv from './sv/translation.json';

export type LangCode = 'fi' | 'sv' | 'en';
export const supportedLanguageCodes: LangCode[] = ['fi', 'sv', 'en'];
export const defaultLang = 'fi';

export const langLabels = {
  en: 'In English',
  fi: 'Suomeksi',
  sv: 'På svenska',
};

const resources: Resource = {
  en: { translation: translationEn },
  fi: { translation: translationFi },
  sv: { translation: translationSv },
};

i18n.use(initReactI18next).init({
  lng: defaultLang,
  supportedLngs: supportedLanguageCodes,
  /* eslint-disable sonarjs/todo-tag */
  // fallbackLng: defaultLang, // TODO: Uncomment this line when translations are ready
  resources,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
