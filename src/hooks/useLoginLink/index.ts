import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

export const useLoginLink = ({ callbackURL = '' }: { callbackURL?: string } = {}) => {
  const { i18n } = useTranslation();
  const { pathname } = useLocation();

  const params = new URLSearchParams();
  params.set('lang', i18n.language);
  params.set('callback', callbackURL ?? pathname);

  return `/yksilo/login?${params.toString()}`;
};
