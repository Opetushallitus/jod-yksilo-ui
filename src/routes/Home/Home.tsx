import heroSrc1 from '@/../assets/yksilo-hero-1.jpg';
import heroSrc2 from '@/../assets/yksilo-hero-2.jpg';
import heroSrc3 from '@/../assets/yksilo-hero-3.jpg';
import heroSrc4 from '@/../assets/yksilo-hero-4.jpg';
import type { components } from '@/api/schema';
import { NavLinkBasedOnAuth } from '@/components/NavMenu/NavLinkBasedOnAuth';
import { getLinkTo } from '@/utils/routeUtils';
import { HeroCard, type LinkComponent, tidyClasses as tc, useMediaQueries } from '@jod/design-system';
import { JodOpenInNew } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
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

  // Rotate hero image weekly
  const heroSrc = React.useMemo(() => {
    const heroImages = [heroSrc1, heroSrc2, heroSrc3, heroSrc4];
    const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    return heroImages[weekNumber % heroImages.length];
  }, []);

  const toolLink = `/${language}/${t('slugs.tool.index')}`;

  const heroHeight = React.useMemo(() => {
    return window.innerHeight - 68;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.innerWidth]);

  return (
    <main role="main" className="mx-auto w-full max-w-(--breakpoint-xl) bg-white" id="jod-main" data-testid="home-page">
      <title>{t('my-competence-path')}</title>

      <img
        src={heroSrc}
        alt=""
        role="none"
        className="w-(--breakpoint-xl) sm:h-[617px] object-cover xl:object-[50%_50%] lg:object-[60%_50%] md:object-[67%_50%] sm:object-[71%_50%] object-[72%_50%] pointer-events-none select-none touch-none"
        style={sm ? undefined : { height: heroHeight }}
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

      <Content title={t('home.welcome.title')} className="mb-9 md:mb-[80px]">
        <p className="text-body-lg max-w-[716px]">{t('home.welcome.content')}</p>
      </Content>

      <FullWidthContainer className="bg-[url(@/../assets/palveluhakemisto.jpg)] bg-cover bg-[50%_50%]">
        <div className="max-w-2xl">
          <HeroCard
            size="sm"
            content={t('home.personal-guidance.content')}
            title={t('home.personal-guidance.title')}
            buttonLabel={t('home.personal-guidance.link-text')}
            to={t('common:navigation.extra.palveluhakemisto.url')}
            backgroundColor="var(--ds-color-secondary-2-dark)"
            linkComponent={getLinkTo(t('common:navigation.extra.palveluhakemisto.url'), {
              useAnchor: true,
              target: '_blank',
            })}
            buttonIcon={<JodOpenInNew ariaLabel={t('common:external-link')} />}
          />
        </div>
      </FullWidthContainer>
    </main>
  );
};

export default Home;
