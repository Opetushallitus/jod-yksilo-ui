import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { cx, HeroCard, type LinkComponent, useMediaQueries } from '@jod/design-system';
import { JodOpenInNew } from '@jod/design-system/icons';

import heroSrc1 from '@/../assets/yksilo-hero-1.jpg';
import heroSrc2 from '@/../assets/yksilo-hero-2.jpg';
import heroSrc3 from '@/../assets/yksilo-hero-3.jpg';
import heroSrc4 from '@/../assets/yksilo-hero-4.jpg';
import { HowToUse } from '@/components/HowToUse/HowToUse';
import { NavLinkBasedOnAuth } from '@/components/NavMenu/NavLinkBasedOnAuth';
import { useIsLoggedIn } from '@/stores/useSessionManagerStore';
import { getLinkTo } from '@/utils/routeUtils';

interface ContainerProps {
  className?: string;
  children?: React.ReactNode;
}

const FullWidthContainer = ({ className = '', children }: ContainerProps) => (
  <div className={cx(['flex', 'justify-start', 'py-8', className])}>
    <div className="mx-auto w-[1092px] px-5 sm:px-6 xl:px-0">{children}</div>
  </div>
);

const CardContainer = ({ className = '', children, ref }: ContainerProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <div
      className={cx([
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
  const isLoggedIn = useIsLoggedIn();
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
  }, []);

  return (
    <main role="main" className="mx-auto w-full max-w-(--breakpoint-xl) bg-white" id="jod-main" data-testid="home-page">
      <title>{t('my-competence-path')}</title>

      <img
        src={heroSrc}
        alt=""
        role="none"
        className="pointer-events-none w-(--breakpoint-xl) touch-none object-cover object-[72%_50%] select-none sm:h-[617px] sm:object-[71%_50%] md:object-[67%_50%] lg:object-[60%_50%] xl:object-[50%_50%]"
        style={sm ? undefined : { height: heroHeight }}
        data-testid="home-hero"
      />

      <CardContainer ref={firstCardRef} className="relative">
        <HeroCard
          title={t('home.hero-title')}
          titleLevel={1}
          titleClassName="text-hero-mobile sm:text-hero focus:outline-0"
          content={t('home.hero-content')}
          backgroundColor="var(--ds-color-primary-1-dark-2)"
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
          textColor="var(--ds-color-primary-gray)"
          backgroundColor="var(--ds-color-primary-1-light-2)"
        />
        <HeroCard
          buttonLabel={isLoggedIn ? t('profile.banner.link-text.logged-in') : t('home.create-own-profile')}
          content={isLoggedIn ? t('profile.banner.description.logged-in') : t('home.card-2-content')}
          linkComponent={AuthNavLink(!isLoggedIn)}
          size="sm"
          title={isLoggedIn ? t('profile.banner.title.logged-in') : t('home.card-2-title')}
          to={t('slugs.profile.index')}
          textColor="var(--ds-color-primary-gray)"
          backgroundColor="var(--ds-color-primary-1-light-1)"
        />
      </CardContainer>

      <div
        className={cx([
          'flex',
          'flex-col',
          'mx-auto',
          'max-w-[1092px]',
          'py-7',
          'px-5 sm:px-6 xl:px-0',
          'mb-10 lg:mb-[80px]',
          'md:pb-0',
          'gap-5 lg:gap-7',
        ])}
      >
        <h2 className="max-w-[716px] text-heading-1-mobile sm:text-heading-1">{t('home.how-to-use.title')}</h2>
        <div className="flex flex-col gap-7 lg:flex-row lg:gap-8">
          <div className="font-arial text-body-md text-primary-gray">
            <p>{t('home.how-to-use.description-1')}</p>
            <ul className="ml-6 list-disc">
              <li>{t('home.how-to-use.list-item-1')}</li>
              <li>{t('home.how-to-use.list-item-2')}</li>
              <li>{t('home.how-to-use.list-item-3')}</li>
            </ul>
            <p className="mt-6">{t('home.how-to-use.description-2')}</p>
          </div>
          <div>
            <HowToUse />
          </div>
        </div>
      </div>

      <FullWidthContainer className="bg-[url(@/../assets/palveluhakemisto.jpg)] bg-cover bg-[50%_50%]">
        <div className="max-w-2xl">
          <HeroCard
            size="sm"
            content={t('home.personal-guidance.content')}
            title={t('home.personal-guidance.title')}
            buttonLabel={t('home.personal-guidance.link-text')}
            to={t('common:navigation.extra.palveluhakemisto.url')}
            backgroundColor="var(--ds-color-primary-2-dark)"
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
