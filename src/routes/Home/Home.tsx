import betaPlanImageDesktop from '@/../assets/gra_front_timeline_2.svg';
import betaPlanImageMobile from '@/../assets/gra_front_timeline_mob_2.svg';
import type { components } from '@/api/schema';
import { getLinkTo } from '@/utils/routeUtils';
import { Button, HeroCard, tidyClasses as tc, useMediaQueries } from '@jod/design-system';
import { JodArrowRight, JodOpenInNew } from '@jod/design-system/icons';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useRouteLoaderData } from 'react-router';
import { generateProfileLink } from '../Profile/utils';

const FeatureBox = ({ title }: { title: string }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-heading-3 sm:min-h-[54px]">{t(`home.features.${title}`)}</h3>
      <p className="text-body-sm sm:mb-0 mb-5">{t(`home.features.${title}-content`)}</p>
    </div>
  );
};
interface ContainerProps {
  className?: string;
  children?: React.ReactNode;
}

const FullWidthContainer = ({ className = '', children }: ContainerProps) => (
  <div className={tc(['flex', 'justify-start', 'py-8', className])}>
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

  const { sm } = useMediaQueries();
  const data = useRouteLoaderData('root') as components['schemas']['YksiloCsrfDto'] | null;

  const preferencesLink = React.useMemo(
    () => generateProfileLink(['slugs.profile.preferences'], data, language, t),
    [data, language, t],
  );
  const toolLink = `/${language}/${t('slugs.tool.index')}`;

  return (
    <main role="main" className="mx-auto w-full max-w-(--breakpoint-xl) bg-white" id="jod-main" data-testid="home-page">
      <title>{t('osaamispolku')}</title>

      <FullWidthContainer
        className={tc([
          'sm:h-[617px] h-[calc(100vh-104px)]', // Hero aspect ratio = ((9 / 21) * 1440px) = 617px
          'bg-cover bg-[url(@/../assets/yksilo-hero.jpg)] xl:bg-[50%_50%] lg:bg-[60%_50%] md:bg-[67%_50%] sm:bg-[71%_50%] bg-[72%_50%]',
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
        <p className="text-body-lg max-w-[716px]">
          <Trans
            i18nKey="home.beta-content"
            components={{
              Icon: <JodOpenInNew size={18} className="ml-1" />,
              CustomLink: (
                <Link
                  to="https://wiki.eduuni.fi/spaces/JOD/pages/641042258/Osaamispolun+suljettu+betatestaus"
                  className="inline-flex underline text-accent items-center"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
            }}
          />
        </p>
        <div className="flex justify-center aspect-auto">
          {
            <img
              className="max-w-[372px] sm:max-w-full"
              src={sm ? betaPlanImageDesktop : betaPlanImageMobile}
              alt={t('home.beta')}
            />
          }
        </div>
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
            icon={<JodArrowRight />}
            iconSide="right"
            LinkComponent={getLinkTo(toolLink)}
            data-testid="home-explore-opportunities"
          />
          <Button
            label={t('home.create-own-profile')}
            variant="accent"
            icon={<JodArrowRight />}
            iconSide="right"
            LinkComponent={getLinkTo(preferencesLink.to)}
            data-testid="home-create-profile"
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

      <Content title="how-competency-path-helps-you" className="mb-[128px] mt-11">
        <p className="text-body-lg whitespace-pre-line max-w-[716px]">
          {t('home.how-competency-path-helps-you-content')}
        </p>
        <div className="flex flex-col sm:flex-row gap-7 sm:flex-wrap">
          <div className="flex flex-col gap-5 md:max-w-[320px]">
            <div className="md:text-heading-3 text-heading-3-mobile ">
              {t('home.how-competency-path-helps-you-opintopolku-title')}
            </div>
            <div>{t('home.how-competency-path-helps-you-opintopolku-description')}</div>
            <div className="mt-auto">
              <Button
                size="lg"
                variant="accent"
                className="mt-5"
                serviceVariant="yksilo"
                label={t('home.how-competency-path-helps-you-opintopolku-link')}
                icon={<JodOpenInNew />}
                iconSide="right"
                LinkComponent={getLinkTo(`https://opintopolku.fi/konfo/${language}/`, {
                  useAnchor: true,
                  target: '_blank',
                })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-5 md:max-w-[320px]">
            <div className="sm:text-heading-3 text-heading-3-mobile">
              {t('home.how-competency-path-helps-you-tmt-title')}
            </div>
            <div>{t('home.how-competency-path-helps-you-tmt-description')}</div>
            <div className="mt-auto">
              <Button
                size="lg"
                variant="accent"
                className="mt-5"
                serviceVariant="yksilo"
                label={t('home.how-competency-path-helps-you-tmt-link')}
                icon={<JodOpenInNew />}
                iconSide="right"
                LinkComponent={getLinkTo(`https://tyomarkkinatori.fi/${language === 'fi' ? '' : language}`, {
                  useAnchor: true,
                  target: '_blank',
                })}
              />
            </div>
          </div>
          <div className="flex flex-col gap-5 md:max-w-[320px]">
            <div className="sm:text-heading-3 text-heading-3-mobile">
              {t('home.how-competency-path-helps-you-opinfi-title')}
            </div>
            <div>{t('home.how-competency-path-helps-you-opinfi-description')}</div>
            <div className="mt-auto">
              <Button
                size="lg"
                variant="accent"
                className="mt-5"
                serviceVariant="yksilo"
                label={t('home.how-competency-path-helps-you-opinfi-link')}
                icon={<JodOpenInNew />}
                iconSide="right"
                LinkComponent={getLinkTo(`https://opin.fi/${language === 'fi' ? '' : language}`, {
                  useAnchor: true,
                  target: '_blank',
                })}
              />
            </div>
          </div>
        </div>
      </Content>
    </main>
  );
};

export default Home;
