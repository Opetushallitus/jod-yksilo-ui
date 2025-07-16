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

  const pathTo = typeof rest.to === 'string' ? `/${language}/${rest.to}` : `/${language}/${rest.to.pathname}`;

  return shouldLogin ? (
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
    <NavLink {...rest} to={pathTo} lang={language} onClick={onClose}>
      {rest.children}
    </NavLink>
  );
};
