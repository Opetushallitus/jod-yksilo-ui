import { MainLayout } from '@/components';
import { useModal } from '@/hooks/useModal';
import { LogoutFormContext } from '@/routes/Root';
import { useToolStore } from '@/stores/useToolStore';
import { isFeatureEnabled } from '@/utils/features';
import { Button, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PersonalDetails, ShareLinkSection, TmtImportExport } from '.';
import { Divider, ProfileNavigationList, ProfileSectionTitle, ToolCard } from '../components';

const DownloadLink = ({ children, className }: { children: React.ReactNode; className: string }) => (
  <a href={`${import.meta.env.BASE_URL}api/profiili/yksilo/vienti`} className={className}>
    {children}
  </a>
);

const Preferences = () => {
  const { t } = useTranslation();
  const { lg } = useMediaQueries();
  const title = t('profile.preferences.title');
  const resetToolStore = useToolStore((state) => state.reset);
  const logoutForm = React.useContext(LogoutFormContext);
  const { showDialog } = useModal();

  const deleteProfile = async () => {
    resetToolStore();
    const deletionInput = document.createElement('input');
    deletionInput.type = 'hidden';
    deletionInput.name = 'deletion';
    deletionInput.value = 'true';
    logoutForm?.appendChild(deletionInput);
    logoutForm?.submit();
  };

  return (
    <MainLayout
      navChildren={
        <div className="flex flex-col gap-5">
          <ProfileNavigationList />
          <ToolCard testId="preferences-go-to-tool" />
        </div>
      }
    >
      {!lg && (
        <div className="mb-6">
          <ProfileNavigationList collapsed />
        </div>
      )}
      <title>{title}</title>
      <ProfileSectionTitle type="ASETUKSENI" title={title} />
      <div className="mb-8 text-body-lg flex flex-col gap-7">
        <p>{t('preferences.description')}</p>
      </div>

      <PersonalDetails />

      {isFeatureEnabled('TMT_INTEGRATION') && (
        <>
          <TmtImportExport />
          <Divider className="my-7" />
        </>
      )}
      {isFeatureEnabled('JAKOLINKKI') && (
        <>
          <ShareLinkSection className="mb-8" />
          <Divider className="my-7" />
        </>
      )}
      <section className="mb-8">
        <h2 className="text-heading-2-mobile sm:text-heading-2 mb-3">{t('preferences.download.title')}</h2>
        <p className="font-arial text-body-md mb-5">{t('preferences.download.description')}</p>
        <Button
          variant="accent"
          label={t('preferences.download.action')}
          linkComponent={DownloadLink}
          testId="pref-download-data"
        />
      </section>
      <section>
        <h2 className="text-heading-2-mobile sm:text-heading-2 mb-3">{t('preferences.delete-profile.title')}</h2>
        <p className="font-arial text-body-md mb-5">{t('preferences.delete-profile.description')}</p>
        <Button
          variant="white-delete"
          label={t('preferences.delete-profile.action')}
          onClick={() => {
            showDialog({
              title: t('preferences.delete-profile.action'),
              description: t('preferences.delete-profile.confirm'),
              onConfirm: deleteProfile,
            });
          }}
          testId="pref-delete-profile"
        />
      </section>
      {lg ? null : <ToolCard testId="preferences-go-to-tool" className="mt-6" />}
    </MainLayout>
  );
};

export default Preferences;
