import { Button, ConfirmDialog, Textarea } from '@jod/design-system';
import { JodAi, JodThumbDown, JodThumbDownFilled, JodThumbUp, JodThumbUpFilled } from '@jod/design-system/icons';
import React from 'react';
import toast from 'react-hot-toast/headless';
import { useTranslation } from 'react-i18next';

interface RateAiContentProps {
  isLiked?: boolean;
  isDisliked?: boolean;
  variant: 'kohtaanto' | 'mahdollisuus';
  area: 'Kohtaanto työkalu' | 'Työmahdollisuus' | 'Koulutusmahdollisuus';
}

export const RateAiContent = ({ isLiked, isDisliked, variant, area }: RateAiContentProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const LikeIcon = isLiked ? JodThumbUpFilled : JodThumbUp;
  const DislikeIcon = isDisliked ? JodThumbDownFilled : JodThumbDown;
  const [value, setValue] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const headerText =
    variant === 'kohtaanto' ? t('rate-ai-content.kohtaanto.header') : t('rate-ai-content.mahdollisuus.header');
  const bodyDescription =
    variant === 'kohtaanto' ? t('rate-ai-content.kohtaanto.body') : t('rate-ai-content.mahdollisuus.body');

  const onSubmit = async (rating: 1 | -1, message?: string) => {
    try {
      setIsSubmitting(true);
      const body = JSON.stringify({
        section: 'Osaamispolkuni',
        area,
        language: message ? language : undefined,
        details: window.location.href,
        rating,
        message,
        timestamp: new Date().toISOString(),
      });
      const response = await fetch('/api/arvostelu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-amz-content-sha256': Array.from(
            new Uint8Array(await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(body))),
          )
            .map((b) => b.toString(16).padStart(2, '0'))
            .join(''),
        },
        body,
      });

      if (!response.ok) {
        throw new Error();
      }

      toast.success(t('rate-ai-content.toast'));

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error(t('rate-ai-content.toast-error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (hideDialog: () => void) => (
    <div className="ds:flex ds:flex-row ds:justify-between ds:gap-5">
      <Button
        onClick={() => {
          setValue('');
          hideDialog();
        }}
        label={t('rate-ai-content.modal.close')}
      />
      <Button
        disabled={value.trim().length === 0 || isSubmitting}
        onClick={() => {
          onSubmit(-1, value);
          setValue('');
          hideDialog();
        }}
        label={t('rate-ai-content.modal.send')}
      />
    </div>
  );

  return (
    <div className="bg-accent flex flex-col rounded-lg min-h-[271px] p-6">
      <div className="flex items-start mb-2">
        <h2 className="text-heading-2 text-white mr-2">{headerText}</h2>
        <div className="text-white">
          <JodAi aria-label={t('rate-ai-content.icon')} size={32} />
        </div>
      </div>
      <div className="flex items-center mb-2">
        <p className="text-body-lg text-white">{bodyDescription}</p>
      </div>
      <div className="flex flex-row items-center justify-between w-[128px] h-9 rounded-[30px] mt-auto">
        <button
          className="bg-white rounded-l-[30px] flex-1 h-full w-full items-center justify-center pl-6 pr-5 flex cursor-pointer"
          aria-label={t('rate-ai-content.like')}
          disabled={isSubmitting}
          onClick={() => onSubmit(1)}
        >
          <LikeIcon className="text-accent" />
        </button>
        <div className="h-9 min-w-1 bg-border-gray" aria-hidden="true" />
        <ConfirmDialog
          title={t('rate-ai-content.modal.header')}
          description={t('rate-ai-content.modal.body')}
          footer={footer}
          content={
            <Textarea
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
              }}
              placeholder={t('rate-ai-content.modal.placeholder')}
              maxLength={5000}
            />
          }
        >
          {(showDialog) => (
            <button
              className="bg-white rounded-r-[30px] flex-1 h-full items-center justify-center pl-5 pr-6 flex cursor-pointer"
              aria-label={t('rate-ai-content.dislike')}
              disabled={isSubmitting}
              onClick={showDialog}
            >
              <DislikeIcon className="text-accent" />
            </button>
          )}
        </ConfirmDialog>
      </div>
    </div>
  );
};
