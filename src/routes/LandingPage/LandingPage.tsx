import type { components } from '@/api/schema';
import { MainLayout } from '@/components';
import { useLoginLink } from '@/hooks/useLoginLink';
import { Button } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useRouteLoaderData } from 'react-router';

const ListItem = ({ label }: { label: string }) => <li className="list-disc ml-7 pl-4">{label}</li>;

const LandingPage = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const location = useLocation();

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
    if (rootLoaderData) {
      navigate('/');
    }
  }, [rootLoaderData, navigate]);

  const title = t('profile.landing-page.page-title');

  return (
    <MainLayout>
      <title>{title}</title>
      <h1 className="mb-5 text-heading-2 sm:text-heading-1" data-testid="landing-title">
        {t('profile.landing-page.title')}
      </h1>

      <div className="mb-8 text-body-md flex flex-col gap-6">
        <p className="whitespace-pre-line">{t('profile.landing-page.description')}</p>

        <h2 className="text-heading-2-mobile sm:text-heading-2">{t('profile.landing-page.profile-includes')}</h2>

        <ul>
          <ListItem label={t('profile.landing-page.list-1-item-1')} />
          <ListItem label={t('profile.landing-page.list-1-item-2')} />
          <ListItem label={t('profile.landing-page.list-1-item-3')} />
          <ListItem label={t('profile.landing-page.list-1-item-4')} />
          <ListItem label={t('profile.landing-page.list-1-item-5')} />
          <ListItem label={t('profile.landing-page.list-1-item-6')} />
          <ListItem label={t('profile.landing-page.list-1-item-7')} />
          <ListItem label={t('profile.landing-page.list-1-item-8')} />
        </ul>
        <h2 className="text-heading-2-mobile sm:text-heading-2">{t('profile.landing-page.paragraph-2')}</h2>
        <ul>
          <ListItem label={t('profile.landing-page.list-2-item-1')} />
          <ListItem label={t('profile.landing-page.list-2-item-2')} />
          <ListItem label={t('profile.landing-page.list-2-item-3')} />
          <ListItem label={t('profile.landing-page.list-2-item-4')} />
        </ul>
        <p>{t('profile.landing-page.paragraph-3')}</p>
      </div>
      <div className="mb-6">
        <Button
          variant="white"
          label={t('login-to-service')}
          /* eslint-disable-next-line react/no-unstable-nested-components */
          LinkComponent={({ children }: { children: React.ReactNode }) => <a href={loginLink}>{children}</a>}
          data-testid="landing-login"
        />
      </div>
      <div className="my-8">
        <p>
          {t('profile.landing-page.paragraph-4')}{' '}
          <a
            href={`/${language}/${t('slugs.privacy-and-cookies')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            {t('profile.preferences.paragraph-4-link')}
          </a>
        </p>
      </div>
    </MainLayout>
  );
};

export default LandingPage;
