import type { components } from '@/api/schema';
import { getLinkTo } from '@/utils/routeUtils';
import { HeroCard } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { useRouteLoaderData } from 'react-router';
import { ToolCard } from '../Profile/components';

export const InfoCards = () => {
  const { t, i18n } = useTranslation();

  const isLoggedIn = useRouteLoaderData('root') as components['schemas']['YksiloCsrfDto'] | null;

  return (
    <div className="flex flex-col gap-6">
      <ToolCard />
      <HeroCard
        title={isLoggedIn ? t('profile.banner.title.logged-in') : t('profile.banner.title.unlogged')}
        content={isLoggedIn ? t('profile.banner.description.logged-in') : t('profile.banner.description.unlogged')}
        size="sm"
        buttonLabel={isLoggedIn ? t('profile.banner.link-text.logged-in') : t('profile.banner.link-text.unlogged')}
        backgroundColor="var(--ds-color-secondary-1-dark)"
        to={t('slugs.profile.index')}
        linkComponent={getLinkTo(
          isLoggedIn
            ? `/${i18n.language}/${t('slugs.profile.index')}`
            : `/${i18n.language}/${t('slugs.profile.login')}`,
        )}
      />
    </div>
  );
};
