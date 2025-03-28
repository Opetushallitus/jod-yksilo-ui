import { Button, Modal } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { MdCheckCircleOutline, MdClear } from 'react-icons/md';

interface ImportKoulutusResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSuccess?: boolean;
  errorText?: string;
}

const ImportKoulutusResultModal = ({ isOpen, onClose, isSuccess, errorText }: ImportKoulutusResultModalProps) => {
  const { t } = useTranslation();

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      renderFooter={(onCloseClick) => (
        <div className="flex flex-row justify-end">
          <Button label={t('close')} variant="white" onClick={onCloseClick} />
        </div>
      )}
    >
      <div className="fixed inset-0 flex items-center justify-center overflow-y-hidden pointer-events-none">
        <div className="flex flex-col items-center pointer-events-auto">
          {isSuccess ? (
            <>
              <MdCheckCircleOutline className="text-heading-1 text-success" />
              <h3 className="mb-5 text-heading-2">{t('education-history-import.result-modal.success')}</h3>
            </>
          ) : (
            <>
              <MdClear className="text-heading-1 text-alert-text" />
              <h3 className="mb-5 text-heading-2">{errorText ?? t('education-history-import.result-modal.failure')}</h3>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ImportKoulutusResultModal;
