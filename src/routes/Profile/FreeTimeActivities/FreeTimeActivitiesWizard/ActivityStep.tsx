import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Datepicker, InputField, Textarea } from '@jod/design-system';

import { FormError, TouchedFormError } from '@/components';
import { LIMITS } from '@/constants';
import { useDatePickerTranslations } from '@/hooks/useDatePickerTranslations';
import { isFeatureEnabled } from '@/utils/features';

import type { FreeTimeActivitiesForm } from './utils';

interface ActivityStepProps {
  type: 'toiminta' | 'toiminto';
  toiminto: number;
}

const ActivityStep = ({ type, toiminto }: ActivityStepProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const {
    register,
    watch,
    control,
    trigger,
    formState: { errors, touchedFields },
  } = useFormContext<FreeTimeActivitiesForm>();
  const datePickerTranslations = useDatePickerTranslations();
  const alkuPvm = watch(`toiminnot.${toiminto}.alkuPvm`);
  const loppuPvm = watch(`toiminnot.${toiminto}.loppuPvm`);
  React.useEffect(() => {
    if (alkuPvm || loppuPvm) {
      void trigger();
    }
  }, [alkuPvm, loppuPvm, trigger]);

  return (
    <div className="box-content max-w-modal-content px-5 md:px-9">
      <p className="mb-6 font-arial text-body-md-mobile sm:text-body-md">
        {t('profile.free-time-activities.modals.description')}
      </p>
      {type === 'toiminta' && (
        <div className="mb-6" data-testid="free-time-theme-field">
          <InputField
            label={t('free-time-activities.name-of-free-time-theme')}
            {...register(`nimi.${language}` as const)}
            placeholder={t('profile.free-time-activities.modals.name-of-free-time-theme-placeholder')}
            requiredText={t('common:required')}
            testId="free-time-activities-theme-input"
          />
          <FormError name={`nimi.${language}`} errors={errors} />
        </div>
      )}
      <div className="mb-6" data-testid="free-time-activity-name-field">
        <InputField
          label={t('free-time-activities.name-of-free-time-activity')}
          {...register(`toiminnot.${toiminto}.nimi.${language}` as const)}
          placeholder={t('profile.free-time-activities.modals.name-of-free-time-activity-placeholder')}
          requiredText={t('common:required')}
          testId="free-time-activities-activity-input"
        />
        <FormError name={`toiminnot.${toiminto}.nimi.${language}`} errors={errors} />
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
                  void trigger(`toiminnot.${toiminto}.loppuPvm`);
                }}
                placeholder={t('date-placeholder')}
                requiredText={t('common:required')}
                translations={datePickerTranslations}
                testId="free-time-activities-start-date"
              />
            )}
            name={`toiminnot.${toiminto}.alkuPvm`}
          />
          <TouchedFormError touchedFields={touchedFields} fieldName={`toiminnot.${toiminto}.alkuPvm`} errors={errors} />
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
                testId="free-time-activities-end-date"
              />
            )}
            name={`toiminnot.${toiminto}.loppuPvm`}
          />
          <FormError name={`toiminnot.${toiminto}.loppuPvm`} errors={errors} />
        </div>
      </div>
      {isFeatureEnabled('KOHTAANTO_KUVAUKSET') && (
        <Textarea
          label={t('profile.free-form-input.label')}
          {...register(`toiminnot.${toiminto}.kuvaus.${language}` as const)}
          maxLength={LIMITS.TEXTAREA}
          testId="free-time-activities-free-form-input"
        />
      )}
    </div>
  );
};

export default ActivityStep;
