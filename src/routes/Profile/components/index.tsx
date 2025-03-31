import { SimpleNavigationList } from '@/components';
import { RoutesNavigationList, RoutesNavigationListProps } from '@/components/MainLayout/RoutesNavigationList';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router';
import { mapNavigationRoutes } from '../utils';

interface ProfileNavigationListProps {
  routes: RoutesNavigationListProps['routes'];
  onClick?: () => void;
  collapsible?: boolean;
  backgroundClassName?: string;
}

export const ProfileNavigationListWithCustomRoutes = ({
  routes,
  onClick,
  collapsible,
  backgroundClassName = 'bg-secondary-1-25',
}: ProfileNavigationListProps) => {
  const { t } = useTranslation();
  return (
    <SimpleNavigationList
      title={t('profile.index')}
      collapsible={collapsible}
      backgroundClassName={backgroundClassName}
    >
      <RoutesNavigationList routes={routes} onClick={onClick} />
    </SimpleNavigationList>
  );
};

export const ProfileNavigationList = () => {
  const routes = useOutletContext<RoutesNavigationListProps['routes']>();
  const navigationRoutes = React.useMemo(() => mapNavigationRoutes(routes), [routes]);
  return <ProfileNavigationListWithCustomRoutes routes={navigationRoutes} />;
};
