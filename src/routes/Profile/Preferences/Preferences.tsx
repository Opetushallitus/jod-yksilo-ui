import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button, MainLayout, useMediaQueries } from '@jod/design-system';

import { Breadcrumb } from '@/components';
import { useModal } from '@/hooks/useModal';
import { useSessionGuardedAction } from '@/hooks/useSessionGuardedAction';
import { LogoutFormContext } from '@/routes/Root';
import { useToolStore } from '@/stores/useToolStore';

import { PersonalDetails } from '.';
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
  const guardedAction = useSessionGuardedAction();

  const deleteProfile = async () => {
    resetToolStore();
    const deletionInput = document.createElement('input');
    deletionInput.type = 'hidden';
    deletionInput.name = 'deletion';
    deletionInput.value = 'true';
    logoutForm?.current?.appendChild(deletionInput);
    logoutForm?.current?.submit();
  };

  return (
    <MainLayout
      breadcrumbComponent={<Breadcrumb />}
      navChildren={
        <div className="flex flex-col gap-5">
          <ProfileNavigationList />
          <ToolCard testId="preferences-go-to-tool" />
        </div>
      }
      testId="preferences-page"
    >
      {!lg && (
        <div className="mb-6 px-5 sm:px-6">
          <ProfileNavigationList collapsed />
        </div>
      )}
      <title>{title}</title>
      <div className="px-5 sm:px-6 lg:pr-0 lg:pl-6">
        <ProfileSectionTitle type="ASETUKSENI" title={title} />
        <div className="mb-8 flex flex-col gap-7 text-body-lg-mobile sm:text-body-lg">
          <p>{t('preferences.description')}</p>
        </div>

        <PersonalDetails />

        <section className="mb-8" data-testid="download-section">
          <h2 className="mb-3 text-heading-2-mobile sm:text-heading-2" data-testid="download-title">
            {t('preferences.download.title')}
          </h2>
          <p className="mb-5 font-arial text-body-md">{t('preferences.download.description')}</p>
          <Button
            variant="white"
            label={t('preferences.download.action')}
            size="sm"
            linkComponent={DownloadLink}
            testId="pref-download-data"
          />
        </section>

        <Divider className="mb-7" />

        <section className="mb-7" data-testid="delete-profile-section">
          <h2 className="mb-3 text-heading-2-mobile sm:text-heading-2" data-testid="delete-profile-title">
            {t('preferences.delete-profile.title')}
          </h2>
          <p className="mb-5 font-arial text-body-md">{t('preferences.delete-profile.description')}</p>
          <Button
            variant="white-delete"
            ariaHaspopup="dialog"
            label={t('preferences.delete-profile.action')}
            size="sm"
            onClick={guardedAction(showDialog, {
              title: t('preferences.delete-profile.action'),
              description: t('preferences.delete-profile.confirm'),
              onConfirm: deleteProfile,
            })}
            testId="pref-delete-profile"
          />
        </section>
        {lg ? null : <ToolCard testId="preferences-go-to-tool" className="mt-6" />}
      </div>
    </MainLayout>
  );
};

export default Preferences;
