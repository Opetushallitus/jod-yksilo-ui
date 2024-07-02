import i18n, { type Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationFi from './fi/translation.json';

export const resources: Resource = {
  en: {},
  fi: {
    translation: translationFi,
  },
  sv: {},
};

export const lng = 'fi';

export const fallbackLng = 'fi';

void i18n.use(initReactI18next).init({
  lng,
  fallbackLng,
  resources,
});

export default i18n;
