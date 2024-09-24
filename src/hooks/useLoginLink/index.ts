import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

export const useLoginLink = () => {
  const { i18n } = useTranslation();
  const { pathname } = useLocation();

  const params = new URLSearchParams();
  params.set('lang', i18n.language);
  params.set('callback', pathname);

  return `/login?${params.toString()}`;
};
