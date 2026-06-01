import { Trans, useTranslation } from 'react-i18next';

import { IconHeading, useMediaQueries } from '@jod/design-system';
import { JodUser } from '@jod/design-system/icons';

import { ExternalLink, MainLayout } from '@/components';
import { useSessionManagerStore } from '@/stores/useSessionManagerStore';

import { ProfileNavigationList } from '../components';
import { ToolCard } from '../components/ToolCard';

const ListItem = ({ label }: { label: string }) => <li className="ml-6 list-disc">{label}</li>;

const ProfileFront = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { lg } = useMediaQueries();
  const firstName = useSessionManagerStore((s) => s.user?.etunimi);

  return (
    <MainLayout
      navChildren={
        <div className="flex flex-col gap-5">
          <ProfileNavigationList />
          <ToolCard testId="profile-front-go-to-tool" />
        </div>
      }
    >
      {!lg && (
        <div className="mb-6 px-5 sm:px-6">
          <ProfileNavigationList collapsed />
        </div>
      )}
      <title>{t('profile.index')}</title>
      <div className="px-5 sm:px-6 lg:pr-0 lg:pl-6">
        <IconHeading
          icon={<JodUser />}
          title={t('welcome', { name: firstName ?? 'Nimetön' })}
          testId="profile-front-title"
        />

        <div className="mb-8 flex flex-col gap-6 font-arial text-body-md">
          <p className="mb-3 font-poppins text-body-lg-mobile sm:text-body-lg">
            {t('profile.preferences.ingress-text')}
          </p>
          <div>
            <p>{t('profile.preferences.list-1-title')}</p>
            <ul>
              <ListItem label={t('profile.preferences.list-1-item-1')} />
              <ListItem label={t('profile.preferences.list-1-item-2')} />
              <ListItem label={t('profile.preferences.list-1-item-3')} />
              <ListItem label={t('profile.preferences.list-1-item-4')} />
            </ul>
          </div>
          <p>{t('profile.preferences.paragraph-1')}</p>
          <div>
            <p>{t('profile.preferences.list-2-title')}</p>
            <ul>
              <ListItem label={t('profile.preferences.list-2-item-1')} />
              <ListItem label={t('profile.preferences.list-2-item-2')} />
            </ul>
          </div>
          <div>
            <p>{t('profile.preferences.list-3-title')}</p>
            <ul>
              <ListItem label={t('profile.preferences.list-3-item-1')} />
              <ListItem label={t('profile.preferences.list-3-item-2')} />
              <ListItem label={t('profile.preferences.list-3-item-3')} />
              <ListItem label={t('profile.preferences.list-3-item-4')} />
            </ul>
          </div>
          <p>
            <Trans
              i18nKey="profile.preferences.paragraph-3"
              components={{
                CustomLink: (
                  <ExternalLink
                    href={t('profile.preferences.paragraph-3-link')}
                    className="text-accent hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
                CustomLink2: (
                  <ExternalLink
                    href={`/${language}/${t('common:slugs.privacy-and-cookies')}`}
                    className="text-accent hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
              }}
            />
          </p>
        </div>
        {lg ? null : <ToolCard testId="profile-front-go-to-tool" className="mt-6" />}
      </div>
    </MainLayout>
  );
};

export default ProfileFront;
