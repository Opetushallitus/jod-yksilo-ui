import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@jod/design-system';
import { JodArticle, JodOpenInNew } from '@jod/design-system/icons';

import { AnchorLink } from '@/components';
import { InfoBox } from '@/components/InfoBox/InfoBox';

import { ACCEPTED_MIME, MAX_PDF_BYTES } from './constants';
import { CvImportError } from './useCvUploadAndPoll';

const getStateErrorMessage = (code: string | undefined, t: (key: string) => string): string => {
  if (code === 'invalid-file-type') {
    return t('preferences.cv-import.attachment.invalid-file-type');
  }
  if (code === 'file-too-large') {
    return t('preferences.cv-import.attachment.file-too-large');
  }
  return t('preferences.cv-import.failed.description');
};

interface AttachmentStepProps {
  selectedFile: File | null;
  onAttachmentChange: (file: File | null) => void;
  fileError: string | null;
  onFileErrorChange: (error: string | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  error?: CvImportError;
}

const AttachmentStep = ({
  selectedFile,
  onAttachmentChange,
  fileError,
  onFileErrorChange,
  fileInputRef,
  error,
}: AttachmentStepProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const handlePickFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onFileErrorChange(null);

    if (!file) {
      onAttachmentChange(null);
      return;
    }

    if (file.type !== ACCEPTED_MIME) {
      onAttachmentChange(null);
      onFileErrorChange(t('preferences.cv-import.invalid-file-type'));
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      onAttachmentChange(null);
      onFileErrorChange(t('preferences.cv-import.file-too-large'));
      return;
    }

    onAttachmentChange(file);
  };

  return (
    <div className="box-content flex max-w-modal-content flex-col px-5 font-arial md:px-9">
      <p className="mb-6">
        <Trans i18nKey="preferences.cv-import.attachment.description" />
      </p>

      <div className="mb-4">
        <p>{t('preferences.cv-import.attachment.ai-info')}</p>
        <br />
        <Trans
          i18nKey="ai-info-tooltip.description-summary"
          components={{
            Icon: <JodOpenInNew size={18} ariaLabel={t('common:external-link')} />,
            CustomLink: (
              <AnchorLink
                href={`/${language}/${t('common:slugs.ai-usage')}`}
                className="inline-flex underline"
                target="_blank"
              />
            ),
          }}
        />
      </div>

      <b className="mb-3">{t('preferences.cv-import.attachment.attach-pdf')}</b>
      <div className="space-between mb-6 flex flex-row items-center gap-6">
        <input ref={fileInputRef} type="file" accept={ACCEPTED_MIME} className="hidden" onChange={handleFileChange} />
        <Button
          label={t('preferences.cv-import.attachment.attach-file')}
          variant={selectedFile ? 'white' : 'accent'}
          ariaHaspopup="dialog"
          onClick={handlePickFile}
          icon={
            selectedFile ? (
              <JodArticle size={24} className="text-primary-gray" />
            ) : (
              <JodArticle size={24} className="text-white" />
            )
          }
          iconSide={'right'}
        />
        {selectedFile && <span className="text-body-md">{selectedFile.name}</span>}
      </div>

      {(fileError ?? error) && (
        <p className="text-danger font-arial text-body-sm" role="alert">
          {fileError ?? getStateErrorMessage(error?.code, t)}
        </p>
      )}

      <InfoBox text={t('preferences.cv-import.attachment.delay-info')} />
    </div>
  );
};

export default AttachmentStep;
