import { FormError, TouchedFormError } from '@/components';
import { useDatePickerTranslations } from '@/hooks/useDatePickerTranslations';
import { Datepicker, InputField } from '@jod/design-system';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { EducationHistoryForm } from './utils';

interface EducationStepProps {
  type: 'oppilaitos' | 'koulutus';
  koulutus: number;
}

const EducationStep = ({ type, koulutus }: EducationStepProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const {
    register,
    control,
    trigger,
    formState: { errors, touchedFields },
  } = useFormContext<EducationHistoryForm>();

  const datePickerTranslations = useDatePickerTranslations();

  return (
    <div className="max-w-modal-content">
      <p className="mb-6 font-arial text-body-md-mobile sm:text-body-md">
        {t('profile.education-history.modals.description')}
      </p>
      {type === 'oppilaitos' && (
        <div className="mb-6" data-testid="education-education-provider-field">
          <InputField
            label={t('education-history.educational-institution-or-education-provider')}
            {...register(`nimi.${language}` as const)}
            placeholder={t('profile.education-history.modals.workplace-placeholder')}
            requiredText={t('required')}
          />
          <FormError name={`nimi.${language}`} errors={errors} />
        </div>
      )}
      <div className="mb-6" data-testid="education-degree-name-field">
        <InputField
          label={t('education-history.name-of-degree-or-education')}
          {...register(`koulutukset.${koulutus}.nimi.${language}` as const)}
          placeholder={t('profile.education-history.modals.job-description-placeholder')}
          requiredText={t('required')}
        />
        <FormError name={`koulutukset.${koulutus}.nimi.${language}`} errors={errors} />
      </div>
      <div className="mb-6 flex grow gap-6">
        <div className="block w-full">
          <Controller
            control={control}
            render={({ field: { onBlur }, field }) => (
              <Datepicker
                label={t('started')}
                {...field}
                onBlur={() => {
                  onBlur();
                  trigger(`koulutukset.${koulutus}.loppuPvm`);
                }}
                placeholder={t('date-placeholder')}
                translations={datePickerTranslations}
              />
            )}
            name={`koulutukset.${koulutus}.alkuPvm`}
          />
          <TouchedFormError
            touchedFields={touchedFields}
            fieldName={`koulutukset.${koulutus}.alkuPvm`}
            errors={errors}
          />
        </div>
        <div className="block w-full">
          <Controller
            control={control}
            render={({ field }) => (
              <Datepicker
                label={t('ended')}
                {...field}
                placeholder={t('date-or-continues-placeholder')}
                translations={datePickerTranslations}
              />
            )}
            name={`koulutukset.${koulutus}.loppuPvm`}
          />
          <FormError name={`koulutukset.${koulutus}.loppuPvm`} errors={errors} />
        </div>
      </div>
    </div>
  );
};

export default EducationStep;
