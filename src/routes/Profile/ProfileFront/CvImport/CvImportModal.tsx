import { ModalHeader } from '@/components/ModalHeader';
import { TooltipWrapper } from '@/components/Tooltip/TooltipWrapper';
import { useEscHandler } from '@/hooks/useEscHandler';
import { ModalComponentProps, useModal } from '@/hooks/useModal';
import { Button, Modal, Spinner, useMediaQueries, useNoteStack } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ACCEPTED_MIME, MAX_PDF_BYTES } from './constants';
import CvImportResultPanel from './CvImportResultPanel';
import { useCvUploadAndPoll } from './useCvUploadAndPoll';

type CvImportModalProps = ModalComponentProps;

const getStateErrorMessage = (code: string | undefined, t: (key: string) => string): string => {
  if (code === 'invalid-file-type') {
    return t('cv-import.invalid-file-type');
  }
  if (code === 'file-too-large') {
    return t('cv-import.file-too-large');
  }
  return t('cv-import.failed-description');
};

const CvImportModal = ({ ...rest }: CvImportModalProps) => {
  const { t } = useTranslation();
  const { closeActiveModal } = useModal();
  const { addTemporaryNote } = useNoteStack();
  const { sm } = useMediaQueries();
  const { state, start, cancel, retry } = useCvUploadAndPoll();

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const cancelButtonRef = React.useRef<HTMLButtonElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const modalId = React.useId();

  useEscHandler(() => cancelButtonRef.current?.click(), modalId);

  const handleClose = React.useCallback(() => {
    if (state.step === 'failed') {
      addTemporaryNote(() => ({
        title: t('cv-import.failed-title'),
        description: t('cv-import.failed-description'),
        variant: 'warning',
        isCollapsed: false,
      }));
    }
    cancel();
    closeActiveModal();
  }, [state.step, cancel, closeActiveModal, addTemporaryNote, t]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFileError(null);
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (file.type !== ACCEPTED_MIME) {
      setSelectedFile(null);
      setFileError(t('cv-import.invalid-file-type'));
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setSelectedFile(null);
      setFileError(t('cv-import.file-too-large'));
      return;
    }
    setSelectedFile(file);
  };

  const handleSend = () => {
    if (selectedFile) {
      void start(selectedFile);
    }
  };

  const handleRetry = () => {
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    retry();
  };

  if (!rest.open) {
    return null;
  }

  const buttonSize = sm ? 'lg' : 'sm';

  const renderContent = () => {
    if (state.step === 'uploading' || state.step === 'polling') {
      return (
        <div className="flex bg-bg-gray-2 rounded w-fit items-center p-4 gap-4">
          <Spinner size={24} color="black" />
          <span className="text-primary-gray font-arial text-body-sm">
            {state.step === 'uploading' ? t('cv-import.uploading') : t('cv-import.analysing')}
          </span>
        </div>
      );
    }

    if (state.step === 'failed') {
      return (
        <div>
          <p className="text-body-md font-arial text-primary-gray font-bold mb-2">{t('cv-import.failed-title')}</p>
          <p className="text-body-md font-arial text-primary-gray">{t('cv-import.failed-description')}</p>
        </div>
      );
    }

    if (state.step === 'done') {
      return <CvImportResultPanel tulos={state.tulos} />;
    }

    // select step
    return (
      <div className="flex flex-col gap-4">
        <p className="text-body-md font-arial text-primary-gray">{t('cv-import.start-description')}</p>
        <div className="flex flex-col gap-3">
          <input
            id={`${modalId}-file`}
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_MIME}
            onChange={handleFileChange}
            className="sr-only"
          />
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="white"
              size={buttonSize}
              label={t('cv-import.choose-file')}
              onClick={() => fileInputRef.current?.click()}
            />
            <span className="text-body-sm font-arial text-primary-gray">
              {selectedFile ? selectedFile.name : t('cv-import.no-file-selected')}
            </span>
          </div>
          {(fileError ?? state.error) && (
            <p className="text-body-sm font-arial text-danger" role="alert">
              {fileError ?? getStateErrorMessage(state.error?.code, t)}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderFooter = () => {
    if (state.step === 'uploading' || state.step === 'polling') {
      return (
        <div className="flex flex-row justify-end flex-1">
          <Button
            ref={cancelButtonRef}
            size={buttonSize}
            variant="white"
            label={t('common:cancel')}
            onClick={handleClose}
          />
        </div>
      );
    }

    if (state.step === 'failed') {
      return (
        <div className="flex flex-row justify-end flex-1 gap-5">
          <Button
            ref={cancelButtonRef}
            size={buttonSize}
            variant="white"
            label={t('common:cancel')}
            onClick={handleClose}
          />
          <Button size={buttonSize} variant="accent" label={t('try-again')} onClick={handleRetry} />
        </div>
      );
    }

    if (state.step === 'done') {
      return (
        <div className="flex flex-row justify-end flex-1 gap-5">
          <Button
            ref={cancelButtonRef}
            size={buttonSize}
            variant="white"
            label={t('common:cancel')}
            onClick={handleClose}
          />
          <TooltipWrapper tooltipContent={t('cv-import.result.save-disabled')} tooltipPlacement="top">
            <Button size={buttonSize} variant="accent" label={t('save')} disabled />
          </TooltipWrapper>
        </div>
      );
    }

    // select step
    return (
      <div className="flex flex-row justify-end flex-1 gap-5">
        <Button
          ref={cancelButtonRef}
          size={buttonSize}
          variant="white"
          label={t('common:cancel')}
          onClick={handleClose}
        />
        <Button
          size={buttonSize}
          variant="accent"
          label={t('cv-import.send-button')}
          disabled={!selectedFile}
          onClick={handleSend}
        />
      </div>
    );
  };

  return (
    <Modal
      name={t('cv-import.title')}
      {...rest}
      fullWidthContent
      topSlot={<ModalHeader text={t('cv-import.title')} />}
      content={
        <div id={modalId} className="max-w-modal-content box-content px-5 md:px-9 py-4">
          {renderContent()}
        </div>
      }
      footer={<div className="flex flex-row justify-end flex-1">{renderFooter()}</div>}
    />
  );
};

export default CvImportModal;
