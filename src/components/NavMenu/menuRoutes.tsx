import type { components } from '@/api/schema';
import { useAppRoutes } from '@/hooks/useAppRoutes';
import { generateMenuItems } from '@/utils/routeUtils';
import { LinkComponent, MenuItem } from '@jod/design-system';
import { JodHome } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLoaderData, useLocation } from 'react-router';
import { NavLinkBasedOnAuth } from './NavLinkBasedOnAuth';

export const useMenuRoutes = (onClose: () => void) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { pathname } = useLocation();
  const data = useLoaderData() as components['schemas']['YksiloCsrfDto'] | null;
  const { profileRoutes } = useAppRoutes();
  const mainLevelMenuItems: MenuItem[] = React.useMemo(() => {
    return [
      {
        label: t('front-page'),
        icon: <JodHome />,
        linkComponent: ({ children, className }: LinkComponent) => (
          <NavLink to={`/${language}`} className={className} lang={language} onClick={onClose}>
            {children}
          </NavLink>
        ),
        selected: pathname === `/${language}`,
      },
      {
        label: t('navigation.main-section.tool-title'),
        linkComponent: ({ children, className }: LinkComponent) => (
          <NavLink to={`/${language}/${t('slugs.tool.index')}`} className={className} lang={language} onClick={onClose}>
            {children}
          </NavLink>
        ),
        selected: pathname.startsWith(`/${language}/${t('slugs.tool.index')}`),
      },
      {
        label: t('my-competence-profile'),
        linkComponent: ({ children, className }: LinkComponent) => (
          <NavLinkBasedOnAuth
            to={`${t('slugs.profile.index')}/${t('slugs.profile.front')}`}
            className={className}
            lang={language}
            onClose={onClose}
            shouldLogin={!data}
          >
            {children}
          </NavLinkBasedOnAuth>
        ),
        childItems: generateMenuItems({
          menuRoutes: profileRoutes.slice(1), // Exclude the first "Omat sivuni" route
          loggedIn: !!data,
          pathname,
          pathPrefix: t('slugs.profile.index'),
          onClose,
        }),
        selected: pathname === `/${language}/${t('slugs.profile.index')}/${t('slugs.profile.front')}`,
      },
    ];
  }, [t, pathname, language, profileRoutes, data, onClose]);

  return mainLevelMenuItems;
};
