import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Datepicker, InputField, Textarea } from '@jod/design-system';

import { LIMITS } from '@/constants';
import { useDatePickerTranslations } from '@/hooks/useDatePickerTranslations';
import { getFormErrorMessage } from '@/utils';

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
    watch,
    formState: { errors, touchedFields },
  } = useFormContext<EducationHistoryForm>();

  const datePickerTranslations = useDatePickerTranslations();

  // For triggering "date-range" error when "alkuPvm" is set after "loppuPvm"
  const alkuPvm = watch(`koulutukset.${koulutus}.alkuPvm`);
  const loppuPvm = watch(`koulutukset.${koulutus}.loppuPvm`);
  React.useEffect(() => {
    if (alkuPvm || loppuPvm) {
      void trigger();
    }
  }, [alkuPvm, loppuPvm, trigger]);

  return (
    <div className="box-content max-w-modal-content px-5 md:px-9">
      <p className="mb-6 font-arial text-body-md-mobile sm:text-body-md">
        {t('profile.education-history.modals.description')}
      </p>
      {type === 'oppilaitos' && (
        <div className="mb-6" data-testid="education-education-provider-field">
          <InputField
            label={t('education-history.educational-institution-or-education-provider')}
            {...register(`nimi.${language}` as const)}
            placeholder={t('profile.education-history.modals.workplace-placeholder')}
            requiredText={t('common:required')}
            errorMessage={getFormErrorMessage(errors, `nimi.${language}`)}
          />
        </div>
      )}
      <div className="mb-6" data-testid="education-degree-name-field">
        <InputField
          label={t('education-history.name-of-degree-or-education')}
          {...register(`koulutukset.${koulutus}.nimi.${language}` as const)}
          placeholder={t('profile.education-history.modals.job-description-placeholder')}
          requiredText={t('common:required')}
          errorMessage={getFormErrorMessage(errors, `koulutukset.${koulutus}.nimi.${language}`)}
        />
      </div>
      <div className="mb-6 flex grow gap-4">
        <div className="w-full sm:max-w-input-short">
          <Controller
            control={control}
            render={({ field: { onBlur }, field }) => (
              <Datepicker
                label={t('started')}
                {...field}
                onBlur={() => {
                  onBlur();
                  void trigger(`koulutukset.${koulutus}.loppuPvm`);
                }}
                placeholder={t('date-placeholder')}
                translations={datePickerTranslations}
                errorMessage={getFormErrorMessage(errors, `koulutukset.${koulutus}.alkuPvm`, touchedFields)}
              />
            )}
            name={`koulutukset.${koulutus}.alkuPvm`}
          />
        </div>
        <div className="w-full sm:max-w-input-short">
          <Controller
            control={control}
            render={({ field }) => (
              <Datepicker
                label={t('ended')}
                {...field}
                placeholder={t('date-or-continues-placeholder')}
                translations={datePickerTranslations}
                errorMessage={getFormErrorMessage(errors, `koulutukset.${koulutus}.loppuPvm`)}
              />
            )}
            name={`koulutukset.${koulutus}.loppuPvm`}
          />
        </div>
      </div>
      <Textarea
        label={t('profile.free-form-input.label')}
        {...register(`koulutukset.${koulutus}.kuvaus.${language}` as const)}
        maxLength={LIMITS.TEXTAREA}
      />
    </div>
  );
};

export default EducationStep;
