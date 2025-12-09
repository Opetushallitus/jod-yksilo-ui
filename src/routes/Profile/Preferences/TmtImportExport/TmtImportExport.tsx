import { client } from '@/api/client';
import { useModal } from '@/hooks/useModal';
import { Button } from '@jod/design-system';
import { JodOpenInNew } from '@jod/design-system/icons';
import React from 'react';
import toast from 'react-hot-toast/headless';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router';

const TmtImportExport = () => {
  const { t } = useTranslation();
  const { showDialog, closeAllModals } = useModal();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const origin = globalThis.location.origin;
  const url = new URL(`${origin}/yksilo${pathname}`);
  const callbackUrl = encodeURIComponent(url.href);
  const isExportAuthorized = globalThis.location.search.includes('authorized');
  const exportAttemptedRef = React.useRef(false); // For getting around double API calls in export useEffect in React strict mode

  // For triggering the export modals' 2nd phase after successful authorization.
  // If authentication is successful, the TMT export endpoint is immidiately called.
  React.useEffect(() => {
    const doExport = async () => {
      if (exportAttemptedRef.current) {
        return;
      }
      exportAttemptedRef.current = true;
      const res = await client.POST('/api/integraatiot/tmt/vienti');
      const error = res.error as { errorCode: string } | undefined;

      if (error) {
        const { errorCode } = error;

        switch (errorCode) {
          case 'SERVICE_ERROR':
            toast.error(t('preferences.tmt-import-export.export.errors.bad-request'));
            break;
          case 'AUTHORIZATION_REQUIRED':
            toast.error(t('preferences.tmt-import-export.export.errors.forbidden'));
            break;
          case 'RESOURCE_NOT_FOUND':
            toast.error(t('preferences.tmt-import-export.export.errors.not-found'));
            break;
          default:
            toast.error(t('preferences.tmt-import-export.export.errors.unknown'));
            break;
        }
      } else {
        toast.success(t('preferences.tmt-import-export.export.success'));
      }
      showDialog({
        title: t('preferences.tmt-import-export.export.modal.title'),
        hideSecondaryButton: true, // Only the main confirm button is needed for closing the dialog
        confirmText: t('close'),
        variant: 'normal',
        onConfirm: () => {
          closeAllModals();
          exportAttemptedRef.current = false; // Reset flag in case user want to try again
        },
        description: (
          <Trans
            i18nKey="preferences.tmt-import-export.export.modal.step-2-description"
            components={{
              Icon: <JodOpenInNew size={18} className="ml-1" ariaLabel={t('external-link')} />,
              CustomLink: (
                <Link
                  to={t('preferences.tmt-import-export.export.modal.tmt-url')}
                  className="inline-flex underline items-center"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
            }}
          />
        ),
      });
      navigate(pathname, { replace: true }); // Clean the URL from query params.
    };

    if (isExportAuthorized) {
      doExport();
    }
  }, [closeAllModals, isExportAuthorized, navigate, origin, pathname, showDialog, t]);

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-heading-2-mobile sm:text-heading-2">{t('preferences.tmt-import-export.title')}</h2>
      <div className="font-arial">{t('preferences.tmt-import-export.description')}</div>
      <div className="flex gap-4 mt-7">
        <Button
          label={t('preferences.tmt-import-export.import.button-label')}
          variant="accent"
          onClick={() =>
            showDialog({
              title: t('preferences.tmt-import-export.import.modal.title'),
              description: t('preferences.tmt-import-export.import.modal.step-1-description'),
              confirmText: t('preferences.tmt-import-export.continue-to-tmt'),
              cancelText: t('cancel'),
              variant: 'normal',
              onConfirm: async () => {
                toast.error('TMT import is not implemented yet.');
              },
            })
          }
        />
        <Button
          label={t('preferences.tmt-import-export.export.button-label')}
          variant="white"
          onClick={() =>
            showDialog({
              title: t('preferences.tmt-import-export.export.modal.title'),
              description: t('preferences.tmt-import-export.export.modal.step-1-description'),
              confirmText: t('preferences.tmt-import-export.continue-to-tmt'),
              cancelText: t('cancel'),
              variant: 'normal',
              onConfirm: async () => {
                window.location.href = `/yksilo/oauth2/authorization/tmt-vienti?callback=${callbackUrl}`;
              },
            })
          }
        />
      </div>
    </div>
  );
};

export default TmtImportExport;
