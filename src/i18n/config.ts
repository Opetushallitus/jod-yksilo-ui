import i18n, { type Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import draftTranslationEn from './en/draft.translation.json';
import translationEn from './en/translation.json';
import draftTranslationFi from './fi/draft.translation.json';
import translationFi from './fi/translation.json';
import draftTranslationSv from './sv/draft.translation.json';
import translationSv from './sv/translation.json';

export const LANGUAGE_VALUES = ['fi', 'sv', 'en'] as const;
export type LanguageValue = (typeof LANGUAGE_VALUES)[number];
export type LangCode = 'fi' | 'sv' | 'en';
export const supportedLanguageCodes: LangCode[] =
  /* eslint-disable sonarjs/todo-tag */
  window.location.hostname === 'osaamispolku.fi' ? ['fi'] : ['fi', 'sv', 'en']; // TODO: Set fi, sv, en when translations are ready
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
  fallbackLng: defaultLang,
  resources,
  interpolation: {
    escapeValue: false,
  },
});

i18n.addResourceBundle('fi', 'translation', draftTranslationFi, true, true);
i18n.addResourceBundle('en', 'translation', draftTranslationEn, true, true);
i18n.addResourceBundle('sv', 'translation', draftTranslationSv, true, true);

export default i18n;
