import { useSessionExpirationStore } from '@/stores/useSessionExpirationStore';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, type NavLinkProps } from 'react-router';

interface NavLinkBasedOnAuthProps extends NavLinkProps {
  shouldLogin: boolean;
  onClose?: () => void;
}

export const NavLinkBasedOnAuth = ({ shouldLogin, onClose, ...rest }: NavLinkBasedOnAuthProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const sessionExpired = useSessionExpirationStore((state) => state.sessionExpired);
  const needsLogin = React.useMemo(() => sessionExpired || shouldLogin, [sessionExpired, shouldLogin]);
  const pathTo = typeof rest.to === 'string' ? `${rest.to}` : `${rest.to.pathname}`;
  const hasLangPart = pathTo.startsWith(`/${language}/`);
  const fixedPathTo = hasLangPart ? pathTo : `/${language}/${pathTo}`;

  return needsLogin ? (
    <NavLink
      {...rest}
      state={{ callbackURL: fixedPathTo }}
      to={`/${language}/${t('slugs.profile.login')}`}
      lang={language}
      aria-label={t('login')}
      onClick={onClose}
    >
      {rest.children}
    </NavLink>
  ) : (
    <NavLink {...rest} to={fixedPathTo} lang={language} onClick={onClose}>
      {rest.children}
    </NavLink>
  );
};
