import { FormError, TouchedFormError } from '@/components';
import { ModalHeader } from '@/components/ModalHeader';
import { useDatePickerTranslations } from '@/hooks/useDatePickerTranslations';
import { Datepicker, InputField } from '@jod/design-system';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { WorkHistoryForm } from './utils';

interface WorkplaceStepProps {
  type: 'tyopaikka' | 'toimenkuva';
  toimenkuva: number;
  headerText: string;
}

const WorkplaceStep = ({ type, toimenkuva, headerText }: WorkplaceStepProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { register, watch, control, trigger, formState } = useFormContext<WorkHistoryForm>();

  const datePickerTranslations = useDatePickerTranslations();
  const errors = formState.errors;
  const alkuPvm = watch(`toimenkuvat.${toimenkuva}.alkuPvm`);
  const loppuPvm = watch(`toimenkuvat.${toimenkuva}.loppuPvm`);
  React.useEffect(() => {
    if (alkuPvm || loppuPvm) {
      trigger();
    }
  }, [alkuPvm, loppuPvm, trigger]);

  return (
    <>
      <ModalHeader text={headerText} testId="work-history-step-title" />
      <p className="mb-6 font-arial text-body-md-mobile sm:text-body-md">
        {t('profile.work-history.modals.description')}
      </p>
      {type === 'tyopaikka' && (
        <div className="mb-6" data-testid="work-history-employer-field">
          <InputField
            label={t('work-history.employer')}
            {...register(`nimi.${language}` as const)}
            placeholder={t('profile.work-history.modals.workplace-placeholder')}
            requiredText={t('required')}
            testId="work-history-workplace-input"
          />
          <FormError name={`nimi.${language}`} errors={errors} />
        </div>
      )}
      <div className="mb-6" data-testid="work-history-job-description-field">
        <InputField
          label={t('work-history.job-description')}
          {...register(`toimenkuvat.${toimenkuva}.nimi.${language}` as const)}
          requiredText={t('required')}
          placeholder={t('profile.work-history.modals.job-description-placeholder')}
          help={t('profile.work-history.modals.job-description-help')}
          testId="work-history-job-description-input"
        />
        <FormError name={`toimenkuvat.${toimenkuva}.nimi.${language}`} errors={errors} />
      </div>
      <div className="mb-6 flex grow gap-6">
        <div className="block w-full" data-testid="work-history-started-field">
          <Controller
            control={control}
            render={({ field: { onBlur }, field }) => (
              <Datepicker
                label={t('started')}
                {...field}
                onBlur={() => {
                  onBlur();
                  trigger(`toimenkuvat.${toimenkuva}.loppuPvm`);
                }}
                placeholder={t('date-placeholder')}
                requiredText={t('required')}
                translations={datePickerTranslations}
                testId="work-history-start-date"
              />
            )}
            name={`toimenkuvat.${toimenkuva}.alkuPvm`}
          />
          <TouchedFormError
            touchedFields={formState.touchedFields}
            fieldName={`toimenkuvat.${toimenkuva}.alkuPvm`}
            errors={errors}
          />
        </div>
        <div className="block w-full" data-testid="work-history-ended-field">
          <Controller
            control={control}
            render={({ field }) => (
              <Datepicker
                label={t('ended')}
                {...field}
                placeholder={t('date-or-continues-placeholder')}
                translations={datePickerTranslations}
                testId="work-history-end-date"
              />
            )}
            name={`toimenkuvat.${toimenkuva}.loppuPvm`}
          />
          <FormError name={`toimenkuvat.${toimenkuva}.loppuPvm`} errors={errors} />
        </div>
      </div>
    </>
  );
};

export default WorkplaceStep;
