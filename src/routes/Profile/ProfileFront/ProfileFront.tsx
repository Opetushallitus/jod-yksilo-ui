import { components } from '@/api/schema';
import { MainLayout } from '@/components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useRouteLoaderData } from 'react-router';
import { ProfileNavigationList } from '../components';

const ProfileFront = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const rootLoaderData = useRouteLoaderData('root') as components['schemas']['YksiloCsrfDto'];

  const navChildren = React.useMemo(() => <ProfileNavigationList />, []);

  return (
    <MainLayout navChildren={navChildren}>
      <title>{t('profile.front.title')}</title>
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">
        {t('welcome', { name: rootLoaderData.etunimi ?? 'Nimetön' })}
      </h1>

      <div className="mb-8 text-body-md flex flex-col gap-7">
        <p className="text-body-lg">{t('profile.preferences.you-are-signed-in')}</p>
        <ul>
          <li className="list-disc ml-7 pl-4">{t('profile.preferences.list-1-item-1')}</li>
          <li className="list-disc ml-7 pl-4">{t('profile.preferences.list-1-item-2')}</li>
          <li className="list-disc ml-7 pl-4">{t('profile.preferences.list-1-item-3')}</li>
        </ul>
        <p>{t('profile.preferences.paragraph-2')}</p>
        <ul>
          <li className="list-disc ml-7 pl-4">{t('profile.preferences.list-2-item-1')}</li>
          <li className="list-disc ml-7 pl-4">{t('profile.preferences.list-2-item-2')}</li>
        </ul>
        <p>{t('profile.preferences.paragraph-3')}</p>
        <p>
          {t('profile.preferences.paragraph-4')}
          <Link
            to={`/${language}/${t('slugs.basic-information')}/${t('slugs.privacy-policy')}`}
            className="text-accent hover:underline"
          >
            {t('profile.preferences.paragraph-4-link')}
          </Link>
          .
        </p>
      </div>
    </MainLayout>
  );
};

export default ProfileFront;
