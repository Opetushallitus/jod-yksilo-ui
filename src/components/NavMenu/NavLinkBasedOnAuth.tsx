import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';

export const NavLinkBasedOnAuth = ({
  to,
  shouldLogin,
  className,
  children,
  onClose,
}: {
  to: string;
  shouldLogin: boolean;
  className: string;
  children: React.ReactNode;
  onClose: () => void;
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const landingPageUrl = `/${language}/${t('slugs.profile.login')}`;

  return shouldLogin ? (
    <NavLink
      state={{ callbackURL: to }}
      to={landingPageUrl}
      className={className}
      lang={language}
      aria-label={t('login')}
      onClick={onClose}
    >
      {children}
    </NavLink>
  ) : (
    <NavLink to={`/${language}/${to}`} className={className} lang={language} onClick={onClose}>
      {children}
    </NavLink>
  );
};
