import heroSrc1 from '@/../assets/yksilo-hero-1.jpg';
import heroSrc2 from '@/../assets/yksilo-hero-2.jpg';
import heroSrc3 from '@/../assets/yksilo-hero-3.jpg';
import heroSrc4 from '@/../assets/yksilo-hero-4.jpg';
import type { components } from '@/api/schema';
import { NavLinkBasedOnAuth } from '@/components/NavMenu/NavLinkBasedOnAuth';
import { TimelineImage } from '@/components/TimelineImage';
import { getLinkTo } from '@/utils/routeUtils';
import { HeroCard, type LinkComponent, tidyClasses as tc } from '@jod/design-system';
import { JodOpenInNew } from '@jod/design-system/icons';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useRouteLoaderData } from 'react-router';

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
      {title && <h2 className="sm:text-heading-1 text-heading-1-mobile max-w-[716px]">{title}</h2>}
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

  // Rotate hero image weekly
  const heroSrc = React.useMemo(() => {
    const heroImages = [heroSrc1, heroSrc2, heroSrc3, heroSrc4];
    const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    return heroImages[weekNumber % heroImages.length];
  }, []);

  const toolLink = `/${language}/${t('slugs.tool.index')}`;

  return (
    <main role="main" className="mx-auto w-full max-w-(--breakpoint-xl) bg-white" id="jod-main" data-testid="home-page">
      <title>{t('my-competence-path')}</title>

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

      <Content title={t('home.beta')} className="mb-9 md:mb-[80px]">
        <p className="text-body-lg max-w-[716px]">
          <Trans
            i18nKey="home.beta-content-1"
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
        <TimelineImage />
        <p className="text-body-lg max-w-[716px]">
          <Trans
            i18nKey="home.beta-content-2"
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
      </Content>

      <FullWidthContainer className="bg-[url(@/../assets/palveluhakemisto.jpg)] bg-cover bg-[50%_50%]">
        <div className="max-w-2xl">
          <HeroCard
            size="sm"
            content={t('home.need-personal-guidance-content')}
            title={t('home.need-personal-guidance')}
            buttonLabel={t('move-to-service')}
            to={t('navigation.extra.palveluhakemisto.url')}
            backgroundColor="var(--ds-color-secondary-2-dark)"
            linkComponent={getLinkTo(t('navigation.extra.palveluhakemisto.url'), {
              useAnchor: true,
              target: '_blank',
            })}
            buttonIcon={<JodOpenInNew ariaLabel={t('external-link')} />}
          />
        </div>
      </FullWidthContainer>

      <Content title={t('home.how-competency-path-helps-you')} className="mb-[208px] pt-0 mt-9 sm:mt-[80px]">
        <p className="text-body-lg whitespace-pre-line max-w-[716px]">
          <Trans i18nKey="home.how-competency-path-helps-you-content" />
        </p>
        <div className="flex flex-col sm:flex-row gap-7 sm:flex-wrap">
          <div className="flex flex-col gap-5 md:max-w-[320px]">
            <div className="md:text-heading-3 text-heading-3-mobile ">
              {t('home.how-competency-path-helps-you-opintopolku-title')}
            </div>
            <p className="text-body-sm">
              <Trans i18nKey="home.how-competency-path-helps-you-opintopolku-description" />
            </p>
          </div>

          <div className="flex flex-col gap-5 md:max-w-[320px]">
            <div className="sm:text-heading-3 text-heading-3-mobile">
              {t('home.how-competency-path-helps-you-tmt-title')}
            </div>
            <p className="text-body-sm">
              <Trans i18nKey="home.how-competency-path-helps-you-tmt-description" />
            </p>
          </div>
          <div className="flex flex-col gap-5 md:max-w-[320px]">
            <div className="sm:text-heading-3 text-heading-3-mobile">
              {t('home.how-competency-path-helps-you-opinfi-title')}
            </div>
            <p className="text-body-sm">{t('home.how-competency-path-helps-you-opinfi-description')}</p>
          </div>
        </div>
      </Content>
    </main>
  );
};

export default Home;
