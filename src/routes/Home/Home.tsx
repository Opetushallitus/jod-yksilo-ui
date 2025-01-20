import { components } from '@/api/schema';
import { HeroCard, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useRouteLoaderData } from 'react-router';
import { generateProfileLink } from '../Profile/utils';

interface CardsProps {
  className?: string;
}

const Cards = ({ className = '' }: CardsProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const data = useRouteLoaderData('root') as components['schemas']['YksiloCsrfDto'] | null;

  const preferencesLink = React.useMemo(
    () => generateProfileLink(['slugs.profile.preferences'], data, language, t),
    [data, language, t],
  );

  return (
    <div
      className={`mx-auto flex max-w-[1140px] flex-col gap-3 sm:gap-11 px-5 sm:px-6 hyphens-auto xl:hyphens-none ${className}`.trim()}
    >
      <div className="sm:mb-[40px] max-w-2xl">
        <HeroCard backgroundColor="#006DB3F2" content={t('home.card-1-content')} title={t('home.card-1-title')} />
      </div>
      <div className="grid grid-flow-row auto-rows-max grid-cols-1 gap-3 sm:gap-7 md:grid-cols-3">
        <HeroCard
          to={`/${language}/${t('slugs.tool.index')}/${t('slugs.tool.goals')}`}
          linkComponent={Link}
          size="sm"
          textColor="#000"
          backgroundColor="#00A8B3F2"
          title={t('home.card-2-title')}
        />
        <HeroCard
          to={`${t('slugs.user-guide.index')}/${t('slugs.user-guide.what-is-the-service')}`}
          linkComponent={Link}
          size="sm"
          textColor="#000"
          backgroundColor="#EE7C45F2"
          title={t('home.card-3-title')}
        />
        <HeroCard
          to={preferencesLink.to}
          linkComponent={preferencesLink.component}
          size="sm"
          textColor="#000"
          backgroundColor="#CD4EB3F2"
          title={t('home.card-4-title')}
        />
      </div>
    </div>
  );
};

const Home = () => {
  const { t } = useTranslation();
  const { sm } = useMediaQueries();

  return (
    <main role="main" className="mx-auto w-full max-w-screen-xl bg-white" id="jod-main">
      <title>{t('osaamispolku')}</title>
      <div className="h-[320px] sm:h-auto mx-auto bg-[url(@/../assets/hero.avif)] bg-[length:auto_680px] bg-[top_-2rem_right_-22rem] sm:bg-[length:auto_auto] sm:bg-[top_-6rem_left_-5rem] sm:py-8">
        {sm && <Cards />}
      </div>
      {!sm && <Cards className="relative -top-11" />}
    </main>
  );
};

export default Home;
