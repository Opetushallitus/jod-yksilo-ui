import { useSessionExpirationStore } from '@/stores/useSessionExpirationStore';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, NavLinkProps } from 'react-router';

interface NavLinkBasedOnAuthProps extends NavLinkProps {
  shouldLogin: boolean;
  onClose?: () => void;
}

export const NavLinkBasedOnAuth = ({ shouldLogin, onClose, ...rest }: NavLinkBasedOnAuthProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const pathTo = typeof rest.to === 'string' ? `${rest.to}` : `${rest.to.pathname}`;
  const sessionExpired = useSessionExpirationStore((state) => state.sessionExpired);
  const loginRequired = React.useMemo(() => sessionExpired || shouldLogin, [sessionExpired, shouldLogin]);

  return loginRequired ? (
    <NavLink
      {...rest}
      state={{ callbackURL: pathTo }}
      to={`/${language}/${t('slugs.profile.login')}`}
      lang={language}
      aria-label={t('login')}
      onClick={onClose}
    >
      {rest.children}
    </NavLink>
  ) : (
    <NavLink {...rest} to={`/${language}/${pathTo}`} lang={language} onClick={onClose}>
      {rest.children}
    </NavLink>
  );
};
