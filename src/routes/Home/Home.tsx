import { components } from '@/api/schema';
import { Button, HeroCard, tidyClasses as tc } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdArrowForward } from 'react-icons/md';
import { Link, useRouteLoaderData } from 'react-router';
import { generateProfileLink } from '../Profile/utils';

const LinkComponent = (to: string) => {
  const Component = ({ children }: { children: React.ReactNode }) => <Link to={to}>{children}</Link>;
  Component.displayName = 'LinkComponent';
  return Component;
};

const FeatureBox = ({ title }: { title: string }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-heading-3 sm:h-[54px]">{t(`home.features.${title}`)}</h3>
      <p className="text-body-sm sm:mb-0 mb-5">{t(`home.features.${title}-content`)}</p>
    </div>
  );
};
interface ContainerProps {
  className?: string;
  children?: React.ReactNode;
}

const FullWidthContainer = ({ className = '', children }: ContainerProps) => (
  <div className={tc(['bg-no-repeat', 'bg-[length:1440px_auto]', 'flex', 'justify-start', 'py-8', className])}>
    <div className="w-[1092px] mx-auto px-5 sm:px-6">{children}</div>
  </div>
);
const Content = ({ className = '', title, children }: ContainerProps & { title?: string }) => {
  const { t } = useTranslation();
  return (
    <div className={tc(['mx-auto', 'max-w-[1092px]', 'py-7', 'px-5 sm:px-6', 'flex', 'flex-col', 'gap-7', className])}>
      {title && <h2 className="text-heading-1">{t(`home.${title}`)}</h2>}
      {children}
    </div>
  );
};

const Home = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const data = useRouteLoaderData('root') as components['schemas']['YksiloCsrfDto'] | null;

  const preferencesLink = React.useMemo(
    () => generateProfileLink(['slugs.profile.preferences'], data, language, t),
    [data, language, t],
  );
  const toolLink = `/${language}/${t('slugs.tool.index')}/${t('slugs.tool.competences')}`;

  return (
    <main role="main" className="mx-auto w-full max-w-(--breakpoint-xl) bg-white" id="jod-main">
      <title>{t('osaamispolku')}</title>

      <FullWidthContainer
        className={tc([
          'h-[640px]',
          'bg-[url(@/../assets/pre-launch-1.avif)] bg-[center_-45px]',
          'items-end sm:items-center',
          'pb-6 sm:pb-0',
        ])}
      >
        <div className="max-w-2xl">
          <HeroCard title={t('home.hero-title')} content={t('home.hero-content')} />
        </div>
      </FullWidthContainer>

      <Content className="flex sm:flex-row gap-8 justify-evenly flex-col">
        <HeroCard
          buttonLabel={t('home.explore-opportunities')}
          content={t('home.card-1-content')}
          LinkComponent={Link}
          size="sm"
          title={t('home.card-1-title')}
          to={toolLink}
        />
        <HeroCard
          buttonLabel={t('home.create-own-profile')}
          content={t('home.card-2-content')}
          LinkComponent={Link}
          size="sm"
          title={t('home.card-2-title')}
          to={preferencesLink.to}
        />
      </Content>

      <Content title="beta">
        <p className="text-body-lg">{t('home.beta-content')}</p>
        <div className="h-[200px] bg-bg-gray-2" />
      </Content>

      <Content title="features.title">
        <div className="grid sm:grid-cols-3 grid-cols-1 gap-6">
          <FeatureBox title="map-own-competences" />
          <FeatureBox title="education-to-increase-skills" />
          <FeatureBox title="explore-job-opportunities" />
          <FeatureBox title="map-opportunitites-to-change-jobs" />
        </div>
        <div className="text-body-lg">{t('home.use-tool-or-log-in')}</div>
        <div className="flex sm:flex-row flex-col gap-4">
          <Button
            label={t('home.explore-opportunities')}
            variant="accent"
            icon={<MdArrowForward size={24} />}
            iconSide="right"
            LinkComponent={LinkComponent(toolLink)}
          />
          <Button
            label={t('home.create-own-profile')}
            variant="accent"
            icon={<MdArrowForward size={24} />}
            iconSide="right"
            LinkComponent={LinkComponent(preferencesLink.to)}
          />
        </div>
      </Content>

      <FullWidthContainer className="bg-[url(@/../assets/home-1.avif)] bg-[center_-325px] items-center">
        <div className="max-w-2xl">
          <HeroCard
            size="sm"
            content={t('home.need-personal-guidance-content')}
            title={t('home.need-personal-guidance')}
            buttonLabel={t('home.go-to-service-directory')}
            to="https://www.suomi.fi/palveluhakemisto/osaamispolku"
            backgroundColor="#00A8B3"
            LinkComponent={Link}
          />
        </div>
      </FullWidthContainer>

      <Content title="how-compentency-path-helps-you">
        <p className="text-body-lg">{t('home.how-compentency-path-helps-you-content')}</p>
        <div className="h-[200px] bg-bg-gray-2" />
      </Content>
    </main>
  );
};

export default Home;
