import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, NavLinkProps } from 'react-router';

import { useIsSessionExpired } from '@/stores/useSessionManagerStore';

interface NavLinkBasedOnAuthProps extends NavLinkProps {
  shouldLogin: boolean;
  onClose?: () => void;
  testId?: string;
}

export const NavLinkBasedOnAuth = ({ shouldLogin, onClose, testId, ...rest }: NavLinkBasedOnAuthProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const to = `/${language}/${typeof rest.to === 'string' ? rest.to : rest.to.pathname}`;
  const sessionExpired = useIsSessionExpired();
  const loginRequired = React.useMemo(() => sessionExpired || shouldLogin, [sessionExpired, shouldLogin]);

  return loginRequired ? (
    <NavLink
      {...rest}
      state={{ callbackUrl: to }}
      to={`/${language}/${t('slugs.profile.login')}`}
      lang={language}
      onClick={onClose}
      data-testid={testId ? `${testId}-unauthenticated` : undefined}
    >
      {rest.children}
    </NavLink>
  ) : (
    <NavLink
      {...rest}
      to={to}
      lang={language}
      onClick={onClose}
      data-testid={testId ? `${testId}-authenticated` : undefined}
    >
      {rest.children}
    </NavLink>
  );
};
