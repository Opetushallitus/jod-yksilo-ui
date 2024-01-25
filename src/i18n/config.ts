import i18next, { type Resource } from 'i18next';
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

// eslint-disable-next-line @typescript-eslint/no-floating-promises
i18next.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  debug: true,
  resources,
});
