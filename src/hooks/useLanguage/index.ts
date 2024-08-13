import { LangCode } from '@/i18n/config';
import React from 'react';

export const useLanguage = () => {
  const [lang, setLang] = React.useState<LangCode>(() => {
    const storedLang = sessionStorage.getItem('lang') as LangCode;
    return storedLang ? storedLang : ('fi' as LangCode);
  });

  React.useEffect(() => {
    sessionStorage.setItem('lang', lang);
  }, [lang]);

  const setLanguage = (lang: LangCode) => {
    setLang(() => lang);
  };

  const getLanguage = () => {
    return lang;
  };

  return {
    setLanguage,
    getLanguage,
  };
};
