import { FormError, TouchedFormError } from '@/components';
import { ModalHeader } from '@/components/ModalHeader';
import { useDatePickerTranslations } from '@/hooks/useDatePickerTranslations';
import { Datepicker, InputField } from '@jod/design-system';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { FreeTimeActivitiesForm } from './utils';

interface ActivityStepProps {
  type: 'toiminta' | 'patevyys';
  patevyys: number;
  headerText: string;
}

const ActivityStep = ({ headerText, type, patevyys }: ActivityStepProps) => {
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
  const alkuPvm = watch(`patevyydet.${patevyys}.alkuPvm`);
  const loppuPvm = watch(`patevyydet.${patevyys}.loppuPvm`);
  React.useEffect(() => {
    if (alkuPvm || loppuPvm) {
      trigger();
    }
  }, [alkuPvm, loppuPvm, trigger]);

  return (
    <>
      <ModalHeader text={headerText} testId="free-time-step-title" />
      <p className="mb-6 font-arial text-body-md-mobile sm:text-body-md">
        {t('profile.free-time-activities.modals.description')}
      </p>
      {type === 'toiminta' && (
        <div className="mb-6" data-testid="free-time-theme-field">
          <InputField
            label={t('free-time-activities.name-of-free-time-theme')}
            {...register(`nimi.${language}` as const)}
            placeholder={t('profile.free-time-activities.modals.name-of-free-time-theme-placeholder')}
            requiredText={t('required')}
            testId="free-time-activities-theme-input"
          />
          <FormError name={`nimi.${language}`} errors={errors} />
        </div>
      )}
      <div className="mb-6" data-testid="free-time-activity-name-field">
        <InputField
          label={t('free-time-activities.name-of-free-time-activity')}
          {...register(`patevyydet.${patevyys}.nimi.${language}` as const)}
          placeholder={t('profile.free-time-activities.modals.name-of-free-time-activity-placeholder')}
          requiredText={t('required')}
          testId="free-time-activities-activity-input"
        />
        <FormError name={`patevyydet.${patevyys}.nimi.${language}`} errors={errors} />
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
                  trigger(`patevyydet.${patevyys}.loppuPvm`);
                }}
                placeholder={t('date-placeholder')}
                requiredText={t('required')}
                translations={datePickerTranslations}
                testId="free-time-activities-start-date"
              />
            )}
            name={`patevyydet.${patevyys}.alkuPvm`}
          />
          <TouchedFormError
            touchedFields={touchedFields}
            fieldName={`patevyydet.${patevyys}.alkuPvm`}
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
                testId="free-time-activities-end-date"
              />
            )}
            name={`patevyydet.${patevyys}.loppuPvm`}
          />
          <FormError name={`patevyydet.${patevyys}.loppuPvm`} errors={errors} />
        </div>
      </div>
    </>
  );
};

export default ActivityStep;
