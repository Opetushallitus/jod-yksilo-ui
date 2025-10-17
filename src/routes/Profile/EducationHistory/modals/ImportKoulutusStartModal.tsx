import { ModalHeader } from '@/components/ModalHeader';
import { useEscHandler } from '@/hooks/useEscHandler';
import { Button, Modal } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ImportKoulutusStartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImportKoulutusStartModal = ({ isOpen, onClose }: ImportKoulutusStartModalProps) => {
  const { t, i18n } = useTranslation();
  const [error, setError] = React.useState<Error | undefined>(undefined);

  const modalId = React.useId();
  useEscHandler(onClose, modalId);

  const triggerGivePermissionToImportKoulutusData = () => {
    setError(undefined);
    try {
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `/yksilo/oauth2/authorize/koski?callback=${currentUrl}&lang=${i18n.language}`;
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
      } else {
        setError(new Error(String(error)));
      }
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      open={isOpen}
      content={
        <div
          id={modalId}
          className="flex flex-col items-center justify-center fixed inset-0 overflow-hidden pointer-events-none"
        >
          <div className="text-left max-w-lg px-5">
            <ModalHeader text={t('education-history-import.start-modal.title')} />
            <p className="mb-4 sm:text-body-md text-body-md-mobile">
              {t('education-history-import.start-modal.description')}
            </p>
          </div>
          <div className="mt-4 pointer-events-auto">
            <Button
              variant="white"
              label={t('education-history-import.start-modal.import-button')}
              onClick={triggerGivePermissionToImportKoulutusData}
            />
          </div>
          {error && (
            <p className="mt-4 text-alert-text">{t('education-history-import.start-modal.import-redirect-fail')}</p>
          )}
        </div>
      }
      footer={
        <div className="flex flex-row justify-end flex-1">
          <Button label={t('close')} variant="white" onClick={onClose} className="whitespace-nowrap" />
        </div>
      }
    />
  );
};

export default ImportKoulutusStartModal;
