import type { components } from '@/api/schema';
import { MainLayout } from '@/components';
import { useYksiloData } from '@/hooks/useYksiloData';
import { useMediaQueries } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { Link, useRouteLoaderData } from 'react-router';
import { ProfileNavigationList } from '../components';
import { ToolCard } from '../components/ToolCard';
import WelcomePathModal from '../WelcomePathModal/WelcomePathModal';

const ListItem = ({ label }: { label: string }) => <li className="list-disc ml-7 pl-4">{label}</li>;

const ProfileFront = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { lg } = useMediaQueries();
  const rootLoaderData = useRouteLoaderData('root') as components['schemas']['YksiloCsrfDto'];
  const { data, isLoading } = useYksiloData();

  return (
    <MainLayout
      navChildren={
        <div className="flex flex-col gap-5">
          <ProfileNavigationList />
          <ToolCard testId="profile-front-go-to-tool" />
        </div>
      }
    >
      <title>{t('profile.front.title')}</title>
      <h1 className="mb-5 text-heading-2 sm:text-heading-1" data-testid="profile-front-title">
        {t('welcome', { name: rootLoaderData.etunimi ?? 'Nimetön' })}
      </h1>

      {!isLoading && !data.tervetuloapolku && <WelcomePathModal yksiloData={data} />}

      <div className="mb-8 text-body-md flex flex-col gap-7">
        <p className="text-body-lg">{t('profile.preferences.you-are-signed-in')}</p>
        <ul>
          <ListItem label={t('profile.preferences.list-1-item-1')} />
          <ListItem label={t('profile.preferences.list-1-item-2')} />
          <ListItem label={t('profile.preferences.list-1-item-3')} />
        </ul>
        <p className="whitespace-pre-line">{t('profile.preferences.paragraph-2')}</p>
        <ul>
          <ListItem label={t('profile.preferences.list-2-item-1')} />
          <ListItem label={t('profile.preferences.list-2-item-2')} />
        </ul>
        <p className="whitespace-pre-line">{t('profile.preferences.paragraph-3')}</p>
        <ul>
          <ListItem label={t('profile.preferences.list-3-item-1')} />
          <ListItem label={t('profile.preferences.list-3-item-2')} />
          <ListItem label={t('profile.preferences.list-3-item-3')} />
          <ListItem label={t('profile.preferences.list-3-item-4')} />
        </ul>
        <p>
          {t('profile.preferences.paragraph-4')}
          <Link to={`/${language}/${t('slugs.privacy-policy')}`} className="text-accent hover:underline">
            {t('profile.preferences.paragraph-4-link')}
          </Link>
        </p>
      </div>
      {lg ? null : <ToolCard testId="profile-front-go-to-tool" className="mt-6" />}
    </MainLayout>
  );
};

export default ProfileFront;
