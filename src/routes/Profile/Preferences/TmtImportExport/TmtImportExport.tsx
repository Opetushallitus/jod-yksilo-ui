import { client } from '@/api/client';
import { useModal } from '@/hooks/useModal';
import { Button } from '@jod/design-system';
import React from 'react';
import toast from 'react-hot-toast/headless';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

const TmtImportExport = () => {
  const { t } = useTranslation();
  const { showDialog } = useModal();
  const origin = globalThis.location.origin;
  const { pathname } = useLocation();
  const url = new URL(`${origin}/yksilo${pathname}`);
  const callback = encodeURIComponent(url.href);
  const isExportAuthorized = globalThis.location.search.includes('authorized');

  React.useEffect(() => {
    if (isExportAuthorized) {
      showDialog({
        title: 'Export GET!',
        description: 'You have authorized the export. Much wow!',
        confirmText: t('preferences.tmt-import-export.continue-to-tmt'),
        variant: 'normal',
        onConfirm: () => {
          globalThis.location.replace(globalThis.location.origin + globalThis.location.pathname);
        },
      });
    }
  }, [isExportAuthorized, showDialog, t]);

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-heading-2-mobile sm:text-heading-2">{t('preferences.tmt-import-export.title')}</h2>
      <div className="font-arial">{t('preferences.tmt-import-export.description')}</div>
      <div className="flex gap-4 mt-7">
        <Button
          label={t('preferences.tmt-import-export.import-button')}
          variant="accent"
          onClick={() =>
            showDialog({
              title: t('preferences.tmt-import-export.import-modal.title'),
              description: t('preferences.tmt-import-export.import-modal.step-1-description'),
              confirmText: t('preferences.tmt-import-export.continue-to-tmt'),
              cancelText: t('cancel'),
              variant: 'normal',
              onConfirm: async () => {
                window.location.href = `/yksilo/oauth2/authorization/tmt-vienti?callback=${callback}`;
              },
            })
          }
        />
        <Button
          label={t('preferences.tmt-import-export.export-button')}
          variant="white"
          onClick={() =>
            showDialog({
              title: t('preferences.tmt-import-export.export-modal.title'),
              description: t('preferences.tmt-import-export.export-modal.step-1-description'),
              confirmText: t('preferences.tmt-import-export.continue-to-tmt'),
              cancelText: t('cancel'),
              variant: 'normal',
              onConfirm: async () => {
                const { error } = await client.POST('/api/integraatiot/tmt/vienti');

                if (error) {
                  toast.error(t('preferences.tmt-import-export.errors.unknown'));
                }
              },
            })
          }
        />
      </div>
    </div>
  );
};

export default TmtImportExport;
