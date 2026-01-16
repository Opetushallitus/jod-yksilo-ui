import { ModalHeader } from '@/components/ModalHeader';
import { useEscHandler } from '@/hooks/useEscHandler';
import { Button, Modal } from '@jod/design-system';
import { JodArrowRight, JodCheckCircle, JodClose } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ImportKoulutusResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSuccess?: boolean;
  errorText?: string;
}

const ImportKoulutusResultModal = ({ isOpen, onClose, isSuccess, errorText }: ImportKoulutusResultModalProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const modalId = React.useId();
  useEscHandler(onClose, modalId);

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      name={
        isSuccess
          ? t('education-history-import.result-modal.success')
          : t('education-history-import.result-modal.failure')
      }
      open={isOpen}
      fullWidthContent
      content={
        <div id={modalId} className="flex flex-col items-center justify-center px-2 sm:px-5 sm:mt-11 mt-6">
          {isSuccess ? (
            <div className="flex flex-col items-start">
              <div className="w-full flex justify-center mb-4">
                <JodCheckCircle size={20} className="text-heading-1 text-success" />
              </div>
              <div className="lg:px-8 flex flex-col sm:self-center sm:w-3/4 w-full">
                <ModalHeader text={t('education-history-import.result-modal.success')} />
                <p className="max-w-full wrap-break-word whitespace-pre-line">
                  {t('education-history-import.result-modal.success-osaamiset-info')}
                </p>
                <a
                  href={`/${language}/${t('slugs.ai-usage')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-button-md mt-4 text-accent hover:underline"
                >
                  <div className="flex items-center gap-2">
                    {t('education-history-import.result-modal.success-osaamiset-link-about-ai')}
                    <JodArrowRight />
                  </div>
                </a>
              </div>
            </div>
          ) : (
            <>
              <JodClose className="text-heading-1 text-alert-text mb-4" />
              <h3 className="mb-5 sm:text-heading-2 text-heading-2-mobile">
                {errorText ?? t('education-history-import.result-modal.failure')}
              </h3>
            </>
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

export default ImportKoulutusResultModal;
