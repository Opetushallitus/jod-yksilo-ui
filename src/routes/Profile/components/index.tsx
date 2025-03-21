import { components } from '@/api/schema';
import { RoutesNavigationList, RoutesNavigationListProps } from '@/components/MainLayout/RoutesNavigationList';
import { Accordion } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLoaderData, useOutletContext } from 'react-router';
import { mapNavigationRoutes } from '../utils';

const ProfileFrontLink = ({ onClick }: { onClick?: () => void }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const data = useLoaderData() as components['schemas']['YksiloCsrfDto'] | null;
  const landingPageUrl = `/${language}/${t('slugs.profile.login')}`;

  return !data ? (
    <NavLink
      state={{ callbackURL: t('slugs.profile.index') }}
      to={landingPageUrl}
      className={'hyphens-auto text-heading-3 text-black hover:underline w-full'}
      aria-label={t('login')}
      onClick={onClick}
    >
      {t('profile.index')}
    </NavLink>
  ) : (
    <NavLink
      to={`/${language}/${t('slugs.profile.index')}`}
      className={'hyphens-auto text-heading-3 text-black hover:underline w-full'}
      aria-label={t('profile.index')}
      onClick={onClick}
      end
    >
      {t('profile.index')}
    </NavLink>
  );
};

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
  const {
    t,
    i18n: { language },
  } = useTranslation();
  return (
    <div className={`rounded-md ${backgroundClassName} py-6 px-[20px]`.trim()}>
      {collapsible ? (
        <Accordion title={<ProfileFrontLink onClick={onClick} />} lang={language} titleText={t('profile.index')}>
          <RoutesNavigationList routes={routes} onClick={onClick} />
        </Accordion>
      ) : (
        <>
          <div className="hyphens-auto text-heading-3">
            <ProfileFrontLink onClick={onClick} />
          </div>
          <RoutesNavigationList routes={routes} onClick={onClick} />
        </>
      )}
    </div>
  );
};

export const ProfileNavigationList = () => {
  const routes = useOutletContext<RoutesNavigationListProps['routes']>();
  const navigationRoutes = React.useMemo(() => mapNavigationRoutes(routes), [routes]);
  return <ProfileNavigationListWithCustomRoutes routes={navigationRoutes} />;
};
