import { components } from '@/api/schema';
import { Title } from '@/components';
import { HeroCard } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useRouteLoaderData } from 'react-router-dom';

const Home = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const data = useRouteLoaderData('root') as components['schemas']['YksiloCsrfDto'] | null;
  const preferencesLink = React.useMemo(() => {
    if (data) {
      return {
        to: `${t('slugs.profile.index')}/${t('slugs.profile.preferences')}`,
        component: Link,
      };
    } else {
      const params = new URLSearchParams();
      params.set('lang', language);
      params.set('callback', `/${language}/${t('slugs.profile.index')}/${t('slugs.profile.preferences')}`);

      return {
        to: `/login?${params.toString()}`,
        component: ({
          to,
          className,
          children,
        }: {
          to: object | string;
          className?: string;
          children: React.ReactNode;
        }) => (
          <a href={to as string} className={className}>
            {children}
          </a>
        ),
      };
    }
  }, [data, language, t]);

  return (
    <main role="main" className="mx-auto w-full max-w-screen-lg" id="jod-main">
      <Title value={t('home.title')} />
      <div className="mx-auto bg-[url(@/../assets/hero.jpeg)] bg-[top_-6rem_left_-5rem] py-5 sm:py-11">
        <div className="mx-auto flex max-w-[1140px] flex-col gap-3 sm:gap-11 px-5 sm:px-6 hyphens-auto lg:hyphens-none">
          <div className="sm:mb-[40px] max-w-2xl">
            <HeroCard backgroundColor="#006DB3F2" content={t('home.card-1-content')} title={t('home.card-1-title')} />
          </div>
          <div className="grid grid-flow-row auto-rows-max grid-cols-1 gap-3 sm:gap-7 md:grid-cols-3">
            <HeroCard
              to={`/${language}/${t('slugs.tool.index')}/${t('slugs.tool.competences')}`}
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
      </div>
    </main>
  );
};

export default Home;
