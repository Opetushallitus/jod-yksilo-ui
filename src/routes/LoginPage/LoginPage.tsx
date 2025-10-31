import type { components } from '@/api/schema';
import { MainLayout } from '@/components';
import { useLoginLink } from '@/hooks/useLoginLink';
import { useSessionExpirationStore } from '@/stores/useSessionExpirationStore';
import { getLinkTo } from '@/utils/routeUtils';
import { Button } from '@jod/design-system';
import { JodArrowRight } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useRouteLoaderData } from 'react-router';

const ListItem = ({ label }: { label: string }) => (
  <li className="list-disc ml-7 pl-4 sm:text-body-md text-body-md-mobile font-arial">{label}</li>
);

const LoginPage = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const location = useLocation();
  const sessionExpired = useSessionExpirationStore((state) => state.sessionExpired);
  const rootLoaderData = useRouteLoaderData('root') as components['schemas']['YksiloCsrfDto'];
  const navigate = useNavigate();
  const state = location.state;

  const loginLink = useLoginLink({
    callbackURL: state?.callbackURL
      ? `/${language}/${state?.callbackURL}`
      : `/${language}/${t('slugs.profile.index')}/${t('slugs.profile.front')}`,
  });

  // Redirect to root if already logged-in
  React.useEffect(() => {
    if (rootLoaderData && !sessionExpired) {
      navigate('/');
    }
  }, [rootLoaderData, navigate, sessionExpired]);

  const title = t('profile.login-page.page-title');

  return (
    <MainLayout>
      <title>{title}</title>
      <h1 className="mb-5 text-heading-2 sm:text-heading-1" data-testid="landing-title">
        {t('profile.login-page.title')}
      </h1>

      <div className="mb-8 text-body-md flex flex-col gap-6">
        <p className="whitespace-pre-line sm:text-body-lg text-body-lg-mobile">{t('profile.login-page.description')}</p>
        <div>
          <Button
            variant="accent"
            label={t('login-to-service')}
            linkComponent={getLinkTo(loginLink, { useAnchor: true })}
            icon={<JodArrowRight />}
            iconSide="right"
            data-testid="landing-login"
          />
        </div>
        <h2 className="text-heading-2-mobile sm:text-heading-2">{t('profile.login-page.profile-includes')}</h2>

        <ul>
          <ListItem label={t('profile.login-page.list-1-item-1')} />
          <ListItem label={t('profile.login-page.list-1-item-2')} />
          <ListItem label={t('profile.login-page.list-1-item-3')} />
          <ListItem label={t('profile.login-page.list-1-item-4')} />
          <ListItem label={t('profile.login-page.list-1-item-5')} />
        </ul>
        <h2 className="text-heading-2-mobile sm:text-heading-2">{t('profile.login-page.paragraph-2')}</h2>
        <ul>
          <ListItem label={t('profile.login-page.list-2-item-1')} />
          <ListItem label={t('profile.login-page.list-2-item-2')} />
          <ListItem label={t('profile.login-page.list-2-item-3')} />
        </ul>
        <p className="font-arial">{t('profile.login-page.paragraph-3')}</p>
      </div>

      <div className="mb-8 flex flex-col gap-7">
        <p className="font-arial">{t('profile.login-page.paragraph-4')}</p>
        <Button
          variant="plain"
          serviceVariant="yksilo"
          label={t('privacy-policy')}
          icon={<JodArrowRight />}
          iconSide="right"
          linkComponent={getLinkTo(`/${language}/${t('slugs.privacy-and-cookies')}`, { useAnchor: true })}
          className="w-fit"
        />
      </div>
    </MainLayout>
  );
};

export default LoginPage;
