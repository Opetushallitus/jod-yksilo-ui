import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import { Button, MainLayout } from '@jod/design-system';
import { JodArrowRight, JodOpenInNew } from '@jod/design-system/icons';

import { Breadcrumb } from '@/components';
import { useSessionManagerStore } from '@/stores/useSessionManagerStore';
import { isFeatureEnabled } from '@/utils/features';
import { getLinkTo } from '@/utils/routeUtils';

import { MpassidLogo } from './MpassidLogo';
import { SuomifiLogo } from './SuomifiLogo';

const ListItem = ({ label }: { label: string }) => (
  <li className="ml-7 list-disc pl-4 font-arial text-body-md-mobile sm:text-body-md">{label}</li>
);

const LoginCard = ({
  title,
  description,
  logo: Logo,
  buttonLabel,
  buttonVariant,
  linkComponent,
}: {
  title: string;
  description: string;
  logo: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  buttonLabel: string;
  buttonVariant: 'accent' | 'white';
  linkComponent: React.ComponentType<{
    children: React.ReactNode;
    className: string;
    ariaLabel?: string;
  }>;
}) => (
  <div className="flex flex-1 flex-col gap-6 rounded-md bg-bg-gray-2 px-5 py-6">
    <div className="flex flex-1 flex-col gap-6">
      <Logo height={32} className="w-fit" aria-hidden />
      <div className="flex flex-col gap-3">
        <h3 className="text-heading-2-mobile sm:text-heading-2">{title}</h3>
        <p className="text-body-md-mobile sm:text-body-md">{description}</p>
      </div>
    </div>
    <Button
      variant={buttonVariant}
      label={buttonLabel}
      linkComponent={linkComponent}
      icon={<JodArrowRight />}
      iconSide="right"
      className="w-fit"
    />
  </div>
);

const LoginPage = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const expireSession = useSessionManagerStore((s) => s.expireSession);

  React.useEffect(() => {
    void expireSession('logout');
  }, [expireSession]);
  const isMpassidEnabled = isFeatureEnabled('MPASSID');

  const location = useLocation();
  const state = location.state;
  const params = new URLSearchParams();
  params.set('lang', language);
  params.set('callback', state?.callbackUrl ?? `/${language}/${t('slugs.profile.index')}/${t('slugs.profile.front')}`);

  const mpassidParams = new URLSearchParams(params);
  mpassidParams.set('method', 'mpassid');

  const title = t('profile.login-page.page-title');

  return (
    <MainLayout breadcrumbComponent={<Breadcrumb />}>
      <div className="px-5 sm:px-6">
        <title>{title}</title>
        <h1 className="mb-6 text-hero-mobile focus:outline-0 sm:text-hero" data-testid="landing-title">
          {t('profile.login-page.title')}
        </h1>

        <div className="mb-8 flex flex-col text-body-md">
          <p className="mb-7 text-body-lg-mobile whitespace-pre-line sm:text-body-lg">
            {t('profile.login-page.description')}
          </p>
          <h2 className="mb-5 text-heading-2-mobile sm:text-heading-2">{t('profile.login-page.login-heading')}</h2>
          <div className="flex w-full flex-col gap-5 sm:flex-row">
            <LoginCard
              title={t('profile.login-page.suomifi-title')}
              description={t('profile.login-page.suomifi-description')}
              buttonLabel={t('profile.login-page.suomifi-button')}
              buttonVariant="accent"
              logo={SuomifiLogo}
              linkComponent={getLinkTo(`/yksilo/login?${params.toString()}`, {
                useAnchor: true,
              })}
            />
            {isMpassidEnabled && (
              <LoginCard
                title={t('profile.login-page.mpassid-title')}
                description={t('profile.login-page.mpassid-description')}
                buttonLabel={t('profile.login-page.mpassid-button')}
                buttonVariant="white"
                logo={MpassidLogo}
                linkComponent={getLinkTo(`/yksilo/login?${mpassidParams.toString()}`, {
                  useAnchor: true,
                })}
              />
            )}
          </div>
          <h2 className="mt-8 mb-5 text-heading-2-mobile sm:text-heading-2">
            {t('profile.login-page.profile-includes')}
          </h2>

          <ul>
            <ListItem label={t('profile.login-page.list-1-item-1')} />
            <ListItem label={t('profile.login-page.list-1-item-2')} />
            <ListItem label={t('profile.login-page.list-1-item-3')} />
            <ListItem label={t('profile.login-page.list-1-item-4')} />
            <ListItem label={t('profile.login-page.list-1-item-5')} />
          </ul>
          <h2 className="mt-8 mb-5 text-heading-2-mobile sm:text-heading-2">{t('profile.login-page.paragraph-2')}</h2>
          <ul>
            <ListItem label={t('profile.login-page.list-2-item-1')} />
            <ListItem label={t('profile.login-page.list-2-item-2')} />
            <ListItem label={t('profile.login-page.list-2-item-3')} />
          </ul>
          <p className="mt-6 font-arial">{t('profile.login-page.paragraph-3')}</p>
          <p className="mt-6 font-arial">{t('profile.login-page.paragraph-4')}</p>
          <Button
            variant="plain"
            serviceVariant="yksilo"
            label={t('privacy-policy')}
            icon={<JodOpenInNew ariaLabel={t('common:external-link')} />}
            iconSide="right"
            linkComponent={getLinkTo(`/${language}/${t('common:slugs.privacy-and-cookies')}`, {
              useAnchor: true,
              target: '_blank',
              rel: 'noopener noreferrer',
            })}
            className="mt-6 w-fit"
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default LoginPage;
