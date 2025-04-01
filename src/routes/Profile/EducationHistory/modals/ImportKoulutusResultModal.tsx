import { useEscHandler } from '@/hooks/useEscHandler';
import { Button, Modal } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdArrowForward, MdCheckCircleOutline, MdClear } from 'react-icons/md';
import { Link } from 'react-router';

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
      open={isOpen}
      content={
        <div
          id={modalId}
          className="fixed inset-0 flex items-center justify-center overflow-y-hidden pointer-events-none"
        >
          <div className="flex flex-col items-center pointer-events-auto px-5">
            {isSuccess ? (
              <div className="flex flex-col items-start w-full">
                <div className="w-full flex justify-center mb-4">
                  <MdCheckCircleOutline className="text-heading-1 text-success" />
                </div>
                <div className="mx-8 w-full flex flex-col">
                  <div className="text-heading-2">{t('education-history-import.result-modal.success')}</div>
                  <p className="max-w-full break-words whitespace-pre-line">
                    {t('education-history-import.result-modal.success-osaamiset-info')}
                  </p>
                  <Link
                    to={`/${language}/${t('slugs.basic-information')}/${t('slugs.about-ai')}`}
                    className="text-button-md hover:underline text-accent mt-4"
                  >
                    <div className="flex items-center gap-2">
                      {t('education-history-import.result-modal.success-osaamiset-link-about-ai')}
                      <MdArrowForward size={24} />
                    </div>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <MdClear className="text-heading-1 text-alert-text mb-4" />
                <h3 className="mb-5 sm:text-heading-2 text-heading-2-mobile">
                  {errorText ?? t('education-history-import.result-modal.failure')}
                </h3>
              </>
            )}
          </div>
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
