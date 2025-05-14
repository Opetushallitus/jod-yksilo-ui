import { components } from '@/api/schema';
import { Button, tidyClasses as tc } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdArrowForward } from 'react-icons/md';
import { Link, useRouteLoaderData } from 'react-router';
import { generateProfileLink } from '../Profile/utils';

const InfoLink = ({ to, label, lang = 'fi' }: { to: string; label: string; lang: string }) => (
  <Link to={`/${lang}/${to}`} className="flex justify-center gap-4 text-body-md font-semibold">
    {label} <MdArrowForward size={24} />
  </Link>
);

const LinkComponent = (to: string) => {
  const Component = ({ children }: { children: React.ReactNode }) => <Link to={to}>{children}</Link>;
  Component.displayName = 'LinkComponent';
  return Component;
};

interface CardProps {
  buttonLabel?: string;
  buttonLink?: string;
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];
  className?: string;
  content: string;
  headingClassName?: string;
  title: string;
}
const Card = ({
  buttonLabel,
  buttonLink,
  buttonVariant = 'white',
  className = 'bg-accent text-white',
  content,
  headingClassName = 'text-heading-2',
  title,
}: CardProps) => (
  <div className={tc(`flex flex-col gap-5 rounded-lg p-6 ${className}`)}>
    <div className={headingClassName}>{title}</div>
    <div className="text-body-lg">{content}</div>
    {buttonLabel && buttonLink && (
      <div className="mt-auto">
        <Button
          className="mt-4"
          icon={<MdArrowForward size={24} />}
          iconSide="right"
          label={buttonLabel}
          variant={buttonVariant}
          LinkComponent={LinkComponent(buttonLink)}
        />
      </div>
    )}
  </div>
);

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
  <div className={tc(['bg-no-repeat', 'bg-[length:1440px_auto]', 'flex', 'justify-start', className])}>
    <div className="w-[1092px] mx-auto p-5">{children}</div>
  </div>
);
const Content = ({ className = '', title, children }: ContainerProps & { title?: string }) => {
  const { t } = useTranslation();
  return (
    <div className={tc(['mx-auto', 'max-w-[1092px]', 'py-7', 'px-5', 'flex', 'flex-col', 'gap-7', className])}>
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
  const infoSlug = t('slugs.basic-information');
  const toolLink = `/${language}/${t('slugs.tool.index')}/${t('slugs.tool.goals')}`;
  const placeholderLink = location.href;

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
          <Card title={t('home.hero-title')} content={t('home.hero-content')} headingClassName="text-hero" />
        </div>
      </FullWidthContainer>

      <Content className="flex sm:flex-row gap-8 justify-evenly flex-col">
        <Card
          title={t('home.card-1-title')}
          content={t('home.card-1-content')}
          buttonLabel={t('home.create-own-profile')}
          className="bg-accent text-white flex-1"
          buttonLink={preferencesLink.to}
        />
        <Card
          title={t('home.card-2-title')}
          content={t('home.card-2-content')}
          buttonLabel={t('home.explore-opportunities')}
          className="bg-accent text-white flex-1"
          buttonLink={toolLink}
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

      <FullWidthContainer className="h-[360px] sm:h-[306px] bg-[url(@/../assets/home-1.avif)] bg-[center_-325px] items-center">
        <div className="max-w-2xl">
          <Card
            content={t('home.need-personal-guidance-content')}
            title={t('home.need-personal-guidance')}
            buttonLabel={t('home.go-to-service-directory')}
            className="bg-secondary-2 text-white"
            buttonLink={placeholderLink}
          />
        </div>
      </FullWidthContainer>

      <Content title="how-compentency-path-helps-you">
        <p className="text-body-lg">{t('home.how-compentency-path-helps-you-content')}</p>
        <div className="h-[200px] bg-bg-gray-2" />
      </Content>

      <FullWidthContainer className="h-[360px] sm:h-[306px] bg-[url(@/../assets/home-1.avif)] items-center bg-[center_-340px]">
        <div className="max-w-2xl">
          <Card
            content={t('home.tell-us-what-you-think-content')}
            title={t('home.tell-us-what-you-think')}
            buttonLabel={t('home.provide-feedback')}
            className="bg-[#333] text-white"
            buttonVariant="white"
            buttonLink={placeholderLink}
          />
        </div>
      </FullWidthContainer>

      <FullWidthContainer className="text-white bg-[#333] p-8">
        <div className="flex flex-col gap-3">
          <div className="text-heading-2">{t('home.want-to-know-more')}</div>
          <p className="text-body-sm">{t('home.want-to-know-more-content')}</p>
          <ul className="flex flex-col gap-3 justify-start items-start">
            <li>
              <InfoLink
                to={`${t('slugs.slugs.user-guide.index')}/${t('slugs.about-us')}`}
                label={t('about-us')}
                lang={language}
              />
            </li>
            <li>
              <InfoLink
                to={`${infoSlug}/${t('slugs.privacy-policy')}`}
                label={t('privacy-policy-and-cookies')}
                lang={language}
              />
            </li>
            <li>
              <InfoLink to={`${infoSlug}/${t('slugs.data-sources')}`} label={t('data-sources')} lang={language} />
            </li>
            <li>
              <InfoLink to={`${infoSlug}/${t('slugs.about-ai')}`} label={t('about-ai')} lang={language} />
            </li>
            <li>
              <InfoLink
                to={`${infoSlug}/${t('slugs.accessibility-statement')}`}
                label={t('accessibility-statement')}
                lang={language}
              />
            </li>
          </ul>
        </div>
      </FullWidthContainer>
    </main>
  );
};

export default Home;
