import { FormError, TouchedFormError } from '@/components';
import { ModalHeader } from '@/components/ModalHeader';
import { useDatePickerTranslations } from '@/hooks/useDatePickerTranslations';
import { Datepicker, InputField, Textarea, useMediaQueries } from '@jod/design-system';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { ShareLinkForm } from './types';

export const BasicInfoStep = ({ title }: { title: string }) => {
  const { t } = useTranslation();
  const {
    control,
    register,
    trigger,
    formState: { errors, touchedFields },
  } = useFormContext<ShareLinkForm>();
  const datePickerTranslations = useDatePickerTranslations();
  const { sm } = useMediaQueries();

  return (
    <>
      <ModalHeader text={title} testId="share-link-modal-title" />
      <p className="mb-6 font-arial text-body-md-mobile sm:text-body-md">
        {t('preferences.share.modal.basic-info.description')}
      </p>
      <div className="flex flex-col gap-6">
        <div data-testid="share-link-name-field">
          <InputField
            {...register('nimi' as const)}
            label={t('preferences.share.modal.name')}
            placeholder={t('preferences.share.modal.name-placeholder')}
            testId="share-link-name-input"
            className={sm ? 'max-w-[385px]' : 'w-full'}
          />
          <FormError name="nimi" errors={errors} />
        </div>

        <div className={sm ? 'w-fit' : 'w-full'}>
          <Controller
            control={control}
            render={({ field }) => (
              <Datepicker
                {...field}
                label={t('preferences.share.modal.expires-on')}
                onBlur={() => {
                  field.onBlur();
                  trigger(`voimassaAsti`);
                }}
                placeholder={t('date-placeholder')}
                requiredText={t('required')}
                translations={datePickerTranslations}
                minDate={new Date()}
                testId="share-link-expires-on"
              />
            )}
            name="voimassaAsti"
          />
          <TouchedFormError touchedFields={touchedFields} fieldName="voimassaAsti" errors={errors} />
        </div>

        <div>
          <Textarea
            {...register('muistiinpano' as const)}
            label={t('preferences.share.modal.description')}
            placeholder={t('preferences.share.modal.description-placeholder')}
            testId="share-link-notes-textarea"
          />
        </div>
      </div>
    </>
  );
};
