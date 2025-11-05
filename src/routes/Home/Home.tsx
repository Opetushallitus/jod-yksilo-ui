import betaPlanImageDesktop from '@/../assets/gra_front_timeline_2.svg';
import betaPlanImageMobile from '@/../assets/gra_front_timeline_mob_2.svg';
import heroSrc from '@/../assets/yksilo-hero.jpg';
import type { components } from '@/api/schema';
import { NavLinkBasedOnAuth } from '@/components/NavMenu/NavLinkBasedOnAuth';
import { getLinkTo } from '@/utils/routeUtils';
import { Button, HeroCard, type LinkComponent, tidyClasses as tc, useMediaQueries } from '@jod/design-system';
import { JodArrowRight, JodOpenInNew } from '@jod/design-system/icons';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useRouteLoaderData } from 'react-router';

const FeatureBox = ({ title, content }: { title: string; content: string }) => {
  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-heading-3 sm:min-h-[54px]">{title}</h3>
      <p className="text-body-sm sm:mb-0 mb-5">{content}</p>
    </div>
  );
};
interface ContainerProps {
  className?: string;
  children?: React.ReactNode;
}

const FullWidthContainer = ({ className = '', children }: ContainerProps) => (
  <div className={tc(['flex', 'justify-start', 'py-8', className])}>
    <div className="w-[1092px] mx-auto px-5 sm:px-6 xl:px-0">{children}</div>
  </div>
);
const Content = ({ className = '', title, children }: ContainerProps & { title?: string }) => {
  return (
    <div
      className={tc([
        'mx-auto',
        'max-w-[1092px]',
        'py-7',
        'px-5 sm:px-6 xl:px-0',
        'flex',
        'flex-col',
        'gap-7',
        className,
      ])}
    >
      {title && <h2 className="text-heading-1">{title}</h2>}
      {children}
    </div>
  );
};

const CardContainer = ({ className = '', children, ref }: ContainerProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <div
      className={tc([
        'mx-auto',
        'max-w-[1092px]',
        'px-5',
        'sm:px-6',
        'xl:px-0',
        'mb-6',
        'lg:mb-8',
        'relative',
        'flex',
        'flex-col',
        'lg:grid',
        'lg:grid-cols-2',
        'gap-6',
        'lg:gap-8',
        className,
      ])}
      ref={ref}
    >
      {children}
    </div>
  );
};

const AuthNavLink = (shouldLogin: boolean, path?: string) => {
  const Cmp = ({ to, className, children }: LinkComponent) => (
    <NavLinkBasedOnAuth to={to ?? path} className={className} shouldLogin={shouldLogin}>
      {children}
    </NavLinkBasedOnAuth>
  );
  Cmp.displayName = 'AuthNavLink';
  return Cmp;
};

const Home = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const { sm } = useMediaQueries();
  const data = useRouteLoaderData('root') as components['schemas']['YksiloCsrfDto'] | null;
  const firstCardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (firstCardRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target.isSameNode(firstCardRef.current) && firstCardRef.current?.style) {
            firstCardRef.current.style.marginTop = `-${(2 * entry.contentRect.height) / 3}px`;
          }
        }
      });
      resizeObserver.observe(firstCardRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  const toolLink = `/${language}/${t('slugs.tool.index')}`;

  return (
    <main role="main" className="mx-auto w-full max-w-(--breakpoint-xl) bg-white" id="jod-main" data-testid="home-page">
      <title>{t('osaamispolku')}</title>

      <img
        src={heroSrc}
        alt=""
        role="none"
        className="w-(--breakpoint-xl) sm:h-[617px] h-[calc(100vh-104px)] object-cover xl:object-[50%_50%] lg:object-[60%_50%] md:object-[67%_50%] sm:object-[71%_50%] object-[72%_50%]"
        data-testid="home-hero"
      />

      <CardContainer ref={firstCardRef} className="relative">
        <HeroCard
          title={t('home.hero-title')}
          titleLevel={1}
          titleClassName="focus:outline-0 text-heading-1 text-white"
          content={t('home.hero-content')}
          backgroundColor="var(--ds-color-secondary-1-dark-2)"
        />
      </CardContainer>
      <CardContainer>
        <HeroCard
          buttonLabel={t('home.explore-opportunities')}
          content={t('home.card-1-content')}
          linkComponent={Link}
          size="sm"
          title={t('home.card-1-title')}
          to={toolLink}
          backgroundColor="var(--ds-color-secondary-1-dark)"
        />
        <HeroCard
          buttonLabel={t('home.create-own-profile')}
          content={t('home.card-2-content')}
          linkComponent={AuthNavLink(!data)}
          size="sm"
          title={t('home.card-2-title')}
          to={t('slugs.profile.index')}
          backgroundColor="var(--ds-color-secondary-1-dark)"
        />
      </CardContainer>

      <Content title={t('home.beta')}>
        <p className="text-body-lg max-w-[716px]">
          <Trans
            i18nKey="home.beta-content"
            components={{
              Icon: <JodOpenInNew size={18} className="ml-1" ariaLabel={t('external-link')} />,
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

      <Content title={t('home.features.title')}>
        <div className="grid sm:grid-cols-3 grid-cols-1 gap-6">
          <FeatureBox
            title={t(`home.features.map-own-competences`)}
            content={t('home.features.map-own-competences-content')}
          />
          <FeatureBox
            title={t(`home.features.education-to-increase-skills`)}
            content={t('home.features.education-to-increase-skills-content')}
          />
          <FeatureBox
            title={t(`home.features.explore-job-opportunities`)}
            content={t('home.features.explore-job-opportunities-content')}
          />
          <FeatureBox
            title={t(`home.features.map-opportunitites-to-change-jobs`)}
            content={t('home.features.map-opportunitites-to-change-jobs-content')}
          />
        </div>
        <div className="text-body-lg">{t('home.use-tool-or-log-in')}</div>
        <div className="flex sm:flex-row flex-col gap-4">
          <Button
            label={t('home.explore-opportunities')}
            variant="accent"
            icon={<JodArrowRight />}
            iconSide="right"
            linkComponent={getLinkTo(toolLink)}
            testId="home-explore-opportunities"
          />
          <Button
            label={t('home.create-own-profile')}
            variant="accent"
            icon={<JodArrowRight />}
            iconSide="right"
            linkComponent={AuthNavLink(!data, t('slugs.profile.index'))}
            testId="home-create-profile"
          />
        </div>
      </Content>

      <FullWidthContainer className="bg-[url(@/../assets/palveluhakemisto.jpg)] bg-cover bg-[50%_50%]">
        <div className="max-w-2xl">
          <HeroCard
            size="sm"
            content={t('home.need-personal-guidance-content')}
            title={t('home.need-personal-guidance')}
            buttonLabel={t('home.go-to-service-directory')}
            to="https://www.suomi.fi/palveluhakemisto/osaamispolku"
            backgroundColor="#00818A"
            linkComponent={Link}
            buttonIcon={<JodOpenInNew ariaLabel={t('external-link')} />}
          />
        </div>
      </FullWidthContainer>

      <Content title={t('home.how-competency-path-helps-you')} className="mb-[128px] mt-11">
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
                icon={<JodOpenInNew ariaLabel={t('external-link')} />}
                iconSide="right"
                linkComponent={getLinkTo(`https://opintopolku.fi/konfo/${language}/`, {
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
                icon={<JodOpenInNew ariaLabel={t('external-link')} />}
                iconSide="right"
                linkComponent={getLinkTo(`https://tyomarkkinatori.fi/${language === 'fi' ? '' : language}`, {
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
                icon={<JodOpenInNew ariaLabel={t('external-link')} />}
                iconSide="right"
                linkComponent={getLinkTo(`https://opin.fi/${language === 'fi' ? '' : language}`, {
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
