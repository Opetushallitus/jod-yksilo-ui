import { SimpleNavigationList } from '@/components';
import { RoutesNavigationList, RoutesNavigationListProps } from '@/components/MainLayout/RoutesNavigationList';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useOutletContext } from 'react-router';
import { mapNavigationRoutes } from '../utils';

const ProfileFrontLink = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  return (
    <NavLink
      state={{ callbackURL: t('slugs.profile.index') }}
      to={`/${language}/${t('slugs.profile.index')}`}
      className={'hyphens-auto text-heading-3 text-black hover:underline'}
      aria-label={t('profile.index')}
    >
      {t('profile.index')}
    </NavLink>
  );
};

const ProfileNavigationListBase = ({ routes }: { routes: RoutesNavigationListProps['routes'] }) => {
  const navigationRoutes = React.useMemo(() => mapNavigationRoutes(routes), [routes]);
  const { t } = useTranslation();
  return (
    <SimpleNavigationList title={t('profile.index')} titleComponent={<ProfileFrontLink />}>
      <RoutesNavigationList routes={navigationRoutes} />
    </SimpleNavigationList>
  );
};

export const ProfileNavigationListWithCustomRoutes = ({
  customRoutes,
}: {
  customRoutes: RoutesNavigationListProps['routes'];
}) => {
  return <ProfileNavigationListBase routes={customRoutes} />;
};

export const ProfileNavigationList = () => {
  const routes = useOutletContext<RoutesNavigationListProps['routes']>();
  return <ProfileNavigationListBase routes={routes} />;
};
