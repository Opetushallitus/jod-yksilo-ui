import i18n, { type Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEn from './en/translation.json';
import translationFi from './fi/translation.json';
import translationSv from './sv/translation.json';

export const resources: Resource = {
  en: {
    translation: translationEn,
  },
  fi: {
    translation: translationFi,
  },
  sv: {
    translation: translationSv,
  },
};

export const lng = 'en';

export const fallbackLng = 'en';

// eslint-disable-next-line @typescript-eslint/no-floating-promises
i18n.use(initReactI18next).init({
  lng,
  fallbackLng,
  resources,
});

export default i18n;
