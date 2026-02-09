import { client } from '@/api/client';
import { useModal } from '@/hooks/useModal';
import { Button, Spinner, useNoteStack } from '@jod/design-system';
import { JodOpenInNew } from '@jod/design-system/icons';
import React from 'react';
import toast from 'react-hot-toast/headless';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router';

type ErrorResponseType = { errorCode: string } | undefined;
interface ResultRefType {
  error?: ErrorResponseType;
  errorTitle: string;
  errorDescription: string;
  ready: boolean;
}

const STORAGE_KEY = 'tmtOperation' as const;

const TmtImportExport = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { showDialog, closeAllModals } = useModal();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const callbackUrl = encodeURIComponent(new URL(`${globalThis.location.origin}/yksilo${pathname}`).href);
  const operationAttempted = React.useRef(false); // For getting around double API calls in import/export useEffects in React strict mode
  const dialogOpenRef = React.useRef(false);
  const showResultAfterDialog = React.useRef(false);
  const [authorized, setAuthorized] = React.useState(false);
  const [importPending, setImportPending] = React.useState(false);
  const [exportPending, setExportPending] = React.useState(false);
  const { addTemporaryNote } = useNoteStack();

  // Remove URL parameters after handling them
  const cleanUrl = React.useCallback(() => {
    navigate(pathname, { replace: true, preventScrollReset: true });
  }, [navigate, pathname]);

  // Handle authorization status from URL params
  React.useEffect(() => {
    const params = new URLSearchParams(search);

    if (params.has('error')) {
      const error = params.get('error');
      const operation = sessionStorage.getItem(STORAGE_KEY);
      let toastMsg = '';

      if (error === 'authorization_cancelled') {
        toastMsg =
          operation === 'import'
            ? t('preferences.tmt-import-export.import.authorization-cancelled')
            : t('preferences.tmt-import-export.export.authorization-cancelled');
      } else if (error === 'authorization_failed') {
        toastMsg =
          operation === 'import'
            ? t('preferences.tmt-import-export.import.authorization-failed')
            : t('preferences.tmt-import-export.export.authorization-failed');
      }

      toast.error(toastMsg);
      setAuthorized(false);
      cleanUrl();
    } else if (params.has('authorized')) {
      setAuthorized(true);
      cleanUrl();
    }
  }, [search, t, cleanUrl]);

  const getErrorTranslation = React.useCallback(
    (errorCode: string) => {
      switch (errorCode) {
        case 'SERVICE_ERROR':
          return t('preferences.tmt-import-export.errors.unknown');
        case 'AUTHORIZATION_REQUIRED':
          return t('preferences.tmt-import-export.errors.forbidden');
        case 'RESOURCE_NOT_FOUND':
          return t('preferences.tmt-import-export.errors.not-found');
        default:
          return t('preferences.tmt-import-export.errors.unknown');
      }
    },
    [t],
  );

  const showErrorNote = React.useCallback(
    (title: string, description: string, onClick: () => void) => {
      addTemporaryNote(() => ({
        title,
        description,
        variant: 'warning',
        isCollapsed: false,
        readMoreComponent: <Button label={t('try-again')} variant="white" size="sm" onClick={onClick} />,
      }));
    },
    [addTemporaryNote, t],
  );

  const startImport = React.useCallback(() => {
    if (importPending) {
      return;
    }

    showDialog({
      title: t('preferences.tmt-import-export.import.modal.title'),
      description: t('preferences.tmt-import-export.import.modal.step-1-description'),
      confirmText: t('preferences.tmt-import-export.continue-to-tmt'),
      cancelText: t('common:cancel'),
      variant: 'normal',
      onConfirm: async () => {
        sessionStorage.setItem(STORAGE_KEY, 'import');
        globalThis.location.href = `/yksilo/oauth2/authorization/tmt-haku?callback=${callbackUrl}&lang=${language}`;
      },
    });
  }, [callbackUrl, importPending, showDialog, t, language]);

  const startExport = React.useCallback(() => {
    if (exportPending) {
      return;
    }
    showDialog({
      title: t('preferences.tmt-import-export.export.modal.title'),
      description: t('preferences.tmt-import-export.export.modal.step-1-description'),
      confirmText: t('preferences.tmt-import-export.continue-to-tmt'),
      cancelText: t('common:cancel'),
      variant: 'normal',
      onConfirm: async () => {
        sessionStorage.setItem(STORAGE_KEY, 'export');
        globalThis.location.href = `/yksilo/oauth2/authorization/tmt-vienti?callback=${callbackUrl}&lang=${language}`;
      },
    });
  }, [callbackUrl, exportPending, showDialog, t, language]);

  // For triggering the export modals' 2nd phase after successful authorization.
  // If authentication is successful, the TMT export endpoint is immidiately called.
  const exportResultRef = React.useRef<ResultRefType>({
    ready: false,
    error: undefined,
    errorTitle: '',
    errorDescription: '',
  });

  React.useEffect(() => {
    const showExportResult = () => {
      const { error, errorTitle, errorDescription } = exportResultRef.current;
      if (error) {
        showErrorNote(errorTitle, errorDescription, startExport);
      } else {
        toast.success(t('preferences.tmt-import-export.export.success'));
      }
    };

    const doExport = async () => {
      operationAttempted.current = true;
      dialogOpenRef.current = true;
      cleanUrl();
      sessionStorage.removeItem(STORAGE_KEY);

      showDialog({
        title: t('preferences.tmt-import-export.export.modal.title'),
        hideSecondaryButton: true, // Only the main confirm button is needed for closing the dialog
        confirmText: t('close'),
        variant: 'normal',
        onConfirm: () => {
          dialogOpenRef.current = false;
          closeAllModals();
          // If API result is ready, show result now. If not, set flag to show after API finishes.
          if (exportResultRef.current.ready) {
            showExportResult();
          } else {
            showResultAfterDialog.current = true;
          }
        },
        description: <Trans i18nKey="preferences.tmt-import-export.export.modal.step-2-description" />,
      });

      setExportPending(true);
      const res = await client.POST('/api/integraatiot/tmt/vienti');
      setExportPending(false);
      const error = res.error as ErrorResponseType;
      const errorTitle = error ? t('preferences.tmt-import-export.export.error-note-title') : '';
      const errorDescription = error ? getErrorTranslation(error.errorCode) : '';

      exportResultRef.current = {
        error,
        errorTitle,
        errorDescription,
        ready: true,
      };

      // If dialog is already closed, show result now
      if (!dialogOpenRef.current && showResultAfterDialog.current) {
        showExportResult();
        showResultAfterDialog.current = false;
      }
      operationAttempted.current = false;
    };

    if (authorized && sessionStorage.getItem(STORAGE_KEY) === 'export' && !operationAttempted.current) {
      doExport();
    }
  }, [authorized, cleanUrl, closeAllModals, getErrorTranslation, showDialog, showErrorNote, startExport, t]);

  // For triggering the import modals' 2nd phase after successful authorization.
  // If authentication is successful, the TMT import endpoint is immediately called.
  const importResultRef = React.useRef<ResultRefType>({
    ready: false,
    error: undefined,
    errorTitle: '',
    errorDescription: '',
  });
  const importDialogOpenRef = React.useRef(true);
  const showImportResultAfterDialog = React.useRef(false);

  React.useEffect(() => {
    const showImportResult = () => {
      const { error, errorTitle, errorDescription } = importResultRef.current;
      if (error) {
        showErrorNote(errorTitle, errorDescription, startImport);
      } else {
        toast.success(t('preferences.tmt-import-export.import.success'));
      }
    };

    const doImport = async () => {
      operationAttempted.current = true;
      importDialogOpenRef.current = true;
      cleanUrl();
      sessionStorage.removeItem(STORAGE_KEY);

      showDialog({
        title: t('preferences.tmt-import-export.import.modal.title'),
        hideSecondaryButton: true, // Only the main confirm button is needed for closing the dialog
        description: t('preferences.tmt-import-export.import.modal.step-2-description'),
        confirmText: t('close'),
        variant: 'normal',
        onConfirm: () => {
          importDialogOpenRef.current = false;
          closeAllModals();
          // If API result is ready, show result now. If not, set flag to show after API finishes.
          if (importResultRef.current.ready) {
            showImportResult();
          } else {
            showImportResultAfterDialog.current = true;
          }
          operationAttempted.current = false;
        },
      });

      setImportPending(true);
      const res = await client.POST('/api/integraatiot/tmt/haku');
      setImportPending(false);

      const error = res.error as ErrorResponseType;

      importResultRef.current = {
        error,
        errorTitle: error ? t('preferences.tmt-import-export.import.error-note-title') : '',
        errorDescription: error ? getErrorTranslation(error.errorCode) : '',
        ready: true,
      };

      // If dialog is already closed, show result now
      if (!importDialogOpenRef.current && showImportResultAfterDialog.current) {
        showImportResult();
        showImportResultAfterDialog.current = false;
      }
    };

    if (authorized && sessionStorage.getItem(STORAGE_KEY) === 'import' && !operationAttempted.current) {
      doImport();
    }
  }, [authorized, cleanUrl, closeAllModals, getErrorTranslation, showDialog, showErrorNote, startImport, t]);

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-heading-2-mobile sm:text-heading-2">{t('preferences.tmt-import-export.title')}</h2>
      <div className="font-arial">
        <Trans
          i18nKey="preferences.tmt-import-export.description"
          components={{
            Icon: <JodOpenInNew size={18} className="ml-1" ariaLabel={t('common:external-link')} />,
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
      </div>
      <div className="flex gap-4 mt-7">
        <Button
          label={
            importPending
              ? t('preferences.tmt-import-export.import.in-progress')
              : t('preferences.tmt-import-export.import.button-label')
          }
          variant="accent"
          onClick={startImport}
          icon={importPending ? <Spinner size={24} color="white" /> : undefined}
          iconSide={importPending ? 'right' : undefined}
          disabled={exportPending}
        />
        <Button
          label={
            exportPending
              ? t('preferences.tmt-import-export.export.in-progress')
              : t('preferences.tmt-import-export.export.button-label')
          }
          variant="white"
          onClick={startExport}
          icon={exportPending ? <Spinner size={24} color="accent" /> : undefined}
          iconSide={exportPending ? 'right' : undefined}
          disabled={importPending}
        />
      </div>
    </div>
  );
};

export default TmtImportExport;
