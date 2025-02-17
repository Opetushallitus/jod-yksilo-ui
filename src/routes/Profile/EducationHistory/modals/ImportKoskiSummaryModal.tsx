import { Button, Modal } from '@jod/design-system';
import { useTranslation } from 'react-i18next';

interface ImportKoskiSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const ImportKoskiSummaryModal = ({ isOpen, onClose, onSave }: ImportKoskiSummaryModalProps) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      content={
        <div className="flex flex-col items-center">
          <div className="text-left">
            <h3 className="mb-5 text-heading-2">{t('education-history-import.summary-modal.title')}</h3>
            <p className="mb-4">{t('education-history-import.summary-modal.description')}</p>
          </div>
        </div>
      }
      footer={
        <div className="flex flex-row justify-between">
          <div />
          <div className="flex flex-row justify-between gap-5">
            <Button label={t('cancel')} variant="white" onClick={onClose} />
            <Button label={t('save')} variant="white" onClick={onSave} />
          </div>
        </div>
      }
    />
  );
};

export default ImportKoskiSummaryModal;
