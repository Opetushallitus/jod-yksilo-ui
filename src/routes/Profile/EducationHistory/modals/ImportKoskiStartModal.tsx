import { useEscHandler } from '@/hooks/useEscHandler';
import { Button, Modal } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ImportKoskiStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClickImport: () => void;
}

const ImportKoskiStartModal = ({ isOpen, onClose, onClickImport }: ImportKoskiStartModalProps) => {
  const { t } = useTranslation();

  const modalId = React.useId();
  useEscHandler(onClose, modalId);

  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      content={
        <div id={modalId} className="flex flex-col items-center">
          <div className="text-left">
            <h3 className="mb-5 text-heading-2">{t('education-history-import.start-modal.title')}</h3>
            <p className="mb-4">{t('education-history-import.start-modal.description')}</p>
          </div>
          <div className="mt-4">
            <Button
              variant="white"
              label={t('education-history-import.start-modal.import-button')}
              onClick={onClickImport}
            />
          </div>
        </div>
      }
      footer={
        <div className="flex flex-row justify-between gap-5">
          <div />
          <Button label={t('close')} variant="white" onClick={onClose} />
        </div>
      }
    />
  );
};

export default ImportKoskiStartModal;
