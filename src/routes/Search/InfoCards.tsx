import type { components } from '@/api/schema';
import { getLinkTo } from '@/utils/routeUtils';
import { HeroCard } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { useRouteLoaderData } from 'react-router';
import { ToolCard } from '../Profile/components';

export const InfoCards = () => {
  const { t, i18n } = useTranslation();

  const loginData = useRouteLoaderData('root') as components['schemas']['YksiloCsrfDto'] | null;
  return (
    <div className="flex flex-col gap-6">
      <ToolCard title={t('search.tool-card-title')} description={t('search.tool-card-description')} />
      <HeroCard
        title={t('search.profile-card-title')}
        content={t('search.profile-card-description')}
        size="sm"
        buttonLabel={t('home.create-own-profile')}
        backgroundColor="var(--ds-color-secondary-1-dark)"
        to={t('slugs.profile.index')}
        linkComponent={getLinkTo(
          loginData ? `/${i18n.language}/${t('slugs.profile.index')}` : `/${i18n.language}/${t('slugs.profile.login')}`,
        )}
      />
    </div>
  );
};
