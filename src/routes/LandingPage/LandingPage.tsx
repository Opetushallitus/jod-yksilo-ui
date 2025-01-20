import { components } from '@/api/schema';
import { MainLayout } from '@/components';
import { useLoginLink } from '@/hooks/useLoginLink';
import { Button } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdArrowForward } from 'react-icons/md';
import { NavLink, useLocation, useNavigate, useRouteLoaderData } from 'react-router';

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
      : `/${language}/${t('slugs.profile.index')}/${t('slugs.profile.preferences')}`,
  });

  // Redirect to root if already logged-in
  React.useEffect(() => {
    if (rootLoaderData) {
      navigate('/');
    }
  }, [rootLoaderData, navigate]);

  const title = t('profile.landing-page.page-title');
  const basicInformation = t('slugs.basic-information');

  return (
    <MainLayout navChildren={<></>}>
      <title>{title}</title>
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{t('profile.landing-page.title')}</h1>

      <div className="mb-8 text-body-md flex flex-col gap-6">
        <p>{t('profile.landing-page.description')}</p>

        <h2 className="text-heading-2-mobile sm:text-heading-2">{t('profile.landing-page.profile-includes')}</h2>

        <ul>
          <li className="list-disc ml-7 pl-4">{t('profile.landing-page.list-1-item-1')}</li>
          <li className="list-disc ml-7 pl-4">{t('profile.landing-page.list-1-item-2')}</li>
          <li className="list-disc ml-7 pl-4">{t('profile.landing-page.list-1-item-4')}</li>
          <li className="list-disc ml-7 pl-4">{t('profile.landing-page.list-1-item-5')}</li>
          <li className="list-disc ml-7 pl-4">{t('profile.landing-page.list-1-item-6')}</li>
        </ul>
        <h2 className="text-heading-2-mobile sm:text-heading-2">{t('profile.landing-page.paragraph-2')}</h2>
        <ul>
          <li className="list-disc ml-7 pl-4">{t('profile.landing-page.list-2-item-1')}</li>
          <li className="list-disc ml-7 pl-4">{t('profile.landing-page.list-2-item-2')}</li>
          <li className="list-disc ml-7 pl-4">{t('profile.landing-page.list-2-item-3')}</li>
        </ul>
        <p>{t('profile.landing-page.paragraph-3')}</p>
      </div>
      <div className="mb-6">
        <Button
          variant="white"
          label={t('login-to-service')}
          /* eslint-disable-next-line react/no-unstable-nested-components */
          LinkComponent={({ children }: { children: React.ReactNode }) => <a href={loginLink}>{children}</a>}
        />
      </div>
      <div className="mt-8">
        <p>{t('profile.landing-page.paragraph-4')}</p>
      </div>
      <div className="mb-8">
        <NavLink
          to={`/${language}/${basicInformation}/${t('slugs.privacy-policy')}`}
          lang={language}
          key={'competence'}
          type="button"
          className="text-button-md hover:underline text-accent ml-3"
        >
          <div className="flex flex-row justify-start">
            <div className="flex items-center gap-2">
              {t('privacy-policy')}
              <MdArrowForward size={24} />
            </div>
          </div>
        </NavLink>
      </div>
    </MainLayout>
  );
};

export default LandingPage;
