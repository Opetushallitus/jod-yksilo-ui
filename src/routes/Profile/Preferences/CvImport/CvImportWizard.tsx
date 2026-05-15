import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Modal, useMediaQueries, useNoteStack, WizardProgress } from '@jod/design-system';
import { JodArrowLeft, JodArrowRight, JodCheckmark } from '@jod/design-system/icons';

import { ModalHeader } from '@/components/ModalHeader';
import { ModalComponentProps } from '@/hooks/useModal';

import AttachmentStep from './AttachmentStep';
import SummaryStep from './SummaryStep';
import { useCvUploadAndPoll } from './useCvUploadAndPoll';
import { buildSaveDto, convertTulosToTableRows } from './utils';

interface FooterButtonProps {
  ref?: React.Ref<HTMLButtonElement>;
  onClick: () => void;
  label: string;
  variant?: 'white' | 'red-delete' | 'white-delete' | 'accent' | 'plain' | 'gray';
  icon?: React.ReactNode;
  testId: string;
  disabled?: boolean;
}

const FooterButton = ({ ref, onClick, label, variant = 'white', icon, testId, disabled }: FooterButtonProps) => {
  const { sm } = useMediaQueries();

  return (
    <Button
      ref={ref}
      onClick={onClick}
      label={label}
      variant={variant}
      icon={sm ? undefined : icon}
      className="whitespace-nowrap"
      testId={testId}
      size={sm ? 'lg' : 'sm'}
      disabled={disabled}
    />
  );
};

const CvImportWizard = ({ onClose, ...rest }: ModalComponentProps) => {
  const { t } = useTranslation();
  const [step, setStep] = React.useState(1);
  const steps = 2;

  const isAttachmentStep = React.useMemo(() => step === 1, [step]);
  const isSummaryStep = React.useMemo(() => step === steps, [step, steps]);

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null!);
  const isFileAttached = selectedFile !== null;

  const modalId = React.useId();
  const { state, start, cancel, retry, save } = useCvUploadAndPoll();
  const cancelButtonRef = React.useRef<HTMLButtonElement>(null);
  const { addTemporaryNote } = useNoteStack();

  const isLoading = state.step === 'uploading' || state.step === 'polling';
  const convertedData = React.useMemo(() => (state.tulos ? convertTulosToTableRows(state.tulos) : null), [state.tulos]);

  const headerText = React.useMemo(() => {
    if (isAttachmentStep) {
      return t('preferences.cv-import.attachment.title');
    }
    if (isSummaryStep) {
      return t('preferences.cv-import.summary.title');
    }
    return '';
  }, [t, isAttachmentStep, isSummaryStep]);

  const handleClose = React.useCallback(() => {
    if (state.step === 'failed') {
      addTemporaryNote(() => ({
        title: t('preferences.cv-import.failed.title'),
        description: t('preferences.cv-import.failed.description'),
        variant: 'warning',
        isCollapsed: false,
      }));
    }
    cancel();
    onClose();
  }, [state.step, cancel, onClose, addTemporaryNote, t]);

  const handleSend = React.useCallback(() => {
    if (selectedFile) {
      void start(selectedFile);
    }
  }, [selectedFile, start]);

  const handleRetry = React.useCallback(() => {
    retry();
    handleSend();
  }, [retry, handleSend]);

  const handlePrevious = React.useCallback(() => {
    setStep(step - 1);
  }, [step]);

  const handleNext = React.useCallback(() => {
    handleSend();
    setStep(step + 1);
  }, [handleSend, step]);

  const handleSave = React.useCallback(async () => {
    if (!convertedData) {
      return;
    }
    const ok = await save(buildSaveDto(convertedData));
    if (ok) {
      handleClose();
      addTemporaryNote(() => ({
        title: t('preferences.cv-import.save.success.title'),
        description: t('preferences.cv-import.save.success.description'),
        variant: 'success',
        isCollapsed: false,
      }));
    } else {
      addTemporaryNote(() => ({
        title: t('preferences.cv-import.save.failed.title'),
        description: t('preferences.cv-import.save.failed.description'),
        variant: 'warning',
        isCollapsed: false,
      }));
    }
  }, [convertedData, save, handleClose, addTemporaryNote, t]);

  const topSlot = React.useMemo(
    () => <ModalHeader text={headerText} step={step} testId="cv-import-wizard-header" />,
    [step, headerText],
  );

  const footer = React.useMemo(
    () => (
      <div className="flex flex-1 justify-between gap-3" data-testid="cv-import-wizard-footer">
        <div className="flex gap-3"></div>
        <div className="flex gap-3">
          <FooterButton
            ref={cancelButtonRef}
            onClick={handleClose}
            label={t('common:cancel')}
            testId="cv-import-cancel"
          />

          {step < steps && (
            <FooterButton
              onClick={handleNext}
              label={t('next')}
              variant={isFileAttached ? 'accent' : 'white'}
              icon={<JodArrowRight />}
              disabled={!isFileAttached}
              testId="cv-import-next"
            />
          )}
          {step > 1 && (
            <FooterButton
              onClick={handlePrevious}
              label={t('previous')}
              icon={<JodArrowLeft />}
              testId="cv-import-previous"
              disabled={isLoading}
            />
          )}
          {state.step === 'failed' && isSummaryStep && (
            <FooterButton
              label={t('try-again')}
              variant="accent"
              disabled={!isFileAttached}
              testId="cv-import-retry"
              onClick={handleRetry}
            />
          )}
          {step === steps && state.step !== 'failed' && (
            <FooterButton
              label={t('preferences.cv-import.import-data')}
              icon={<JodCheckmark />}
              variant="accent"
              disabled={!convertedData}
              testId="cv-import-save"
              onClick={handleSave}
            />
          )}
        </div>
      </div>
    ),
    [
      isFileAttached,
      t,
      handleClose,
      step,
      steps,
      handleNext,
      handlePrevious,
      state.step,
      handleRetry,
      convertedData,
      handleSave,
      isLoading,
      isSummaryStep,
    ],
  );

  const StepComponent = React.useMemo(() => {
    if (isAttachmentStep) {
      return (
        <AttachmentStep
          error={state.error}
          selectedFile={selectedFile}
          onAttachmentChange={setSelectedFile}
          fileError={fileError}
          onFileErrorChange={setFileError}
          fileInputRef={fileInputRef}
        />
      );
    } else if (isSummaryStep) {
      return <SummaryStep isLoading={isLoading} convertedData={convertedData} />;
    }
    return <></>;
  }, [isAttachmentStep, isSummaryStep, selectedFile, fileError, fileInputRef, convertedData, isLoading, state.error]);

  const progress = React.useMemo(
    () => (
      <WizardProgress
        labelText={t('wizard.label')}
        stepText={t('wizard.step')}
        completedText={t('wizard.completed')}
        currentText={t('wizard.current')}
        steps={steps}
        currentStep={step}
      />
    ),
    [t, steps, step],
  );

  return (
    <Modal
      name={t('preferences.cv-import.title')}
      {...rest}
      testId="cv-import-wizard"
      fullWidthContent
      topSlot={topSlot}
      content={<div id={modalId}>{StepComponent}</div>}
      footer={footer}
      className="h-[90vh]! sm:h-full!"
      progress={progress}
    />
  );
};

export default CvImportWizard;
