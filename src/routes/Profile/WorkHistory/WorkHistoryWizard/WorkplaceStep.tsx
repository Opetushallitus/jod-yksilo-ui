import { FormError, TouchedFormError } from '@/components';
import { DatePickerTranslations, getDatePickerTranslations } from '@/utils';
import { Datepicker, InputField } from '@jod/design-system';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { WorkHistoryForm } from './utils';

interface WorkplaceStepProps {
  type: 'tyopaikka' | 'toimenkuva';
  toimenkuva: number;
}

const WorkplaceStep = ({ type, toimenkuva }: WorkplaceStepProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { register, watch, control, trigger, formState } = useFormContext<WorkHistoryForm>();

  const errors = formState.errors;
  const id = watch('id');
  const toimenkuvaId = watch(`toimenkuvat.${toimenkuva}.id`);

  const alkuPvm = watch(`toimenkuvat.${toimenkuva}.alkuPvm`);
  const loppuPvm = watch(`toimenkuvat.${toimenkuva}.loppuPvm`);
  React.useEffect(() => {
    if (alkuPvm || loppuPvm) {
      trigger();
    }
  }, [alkuPvm, loppuPvm, trigger]);

  return (
    <>
      <h2 className="mb-6 text-black text-hero-mobile sm:text-hero">
        {type === 'tyopaikka' && !id && t('work-history.add-new-workplace')}
        {type === 'tyopaikka' && id && t('work-history.edit-workplace')}
        {type === 'toimenkuva' && !toimenkuvaId && t('work-history.add-new-job-description')}
        {type === 'toimenkuva' && toimenkuvaId && t('work-history.edit-job-description')}
      </h2>
      <p className="mb-6 font-arial text-body-md-mobile sm:text-body-md">
        {t('profile.work-history.modals.description')}
      </p>
      {type === 'tyopaikka' && (
        <div className="mb-6">
          <InputField
            label={t('work-history.employer')}
            {...register(`nimi.${language}` as const)}
            placeholder={t('profile.work-history.modals.workplace-placeholder')}
            help={t('profile.work-history.modals.workplace-help')}
          />
          <FormError name={`nimi.${language}`} errors={errors} />
        </div>
      )}
      <div className="mb-6">
        <InputField
          label={t('work-history.job-description')}
          {...register(`toimenkuvat.${toimenkuva}.nimi.${language}` as const)}
          placeholder={t('profile.work-history.modals.job-description-placeholder')}
          help={t('profile.work-history.modals.job-description-help')}
        />
        <FormError name={`toimenkuvat.${toimenkuva}.nimi.${language}`} errors={errors} />
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
                  trigger(`toimenkuvat.${toimenkuva}.loppuPvm`);
                }}
                placeholder={t('date-placeholder')}
                translations={getDatePickerTranslations(
                  t('datepicker', { returnObjects: true }) as DatePickerTranslations,
                )}
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
        <div className="block w-full">
          <Controller
            control={control}
            render={({ field }) => (
              <Datepicker
                label={t('ended')}
                {...field}
                placeholder={t('date-or-continues-placeholder')}
                translations={getDatePickerTranslations(
                  t('datepicker', { returnObjects: true }) as DatePickerTranslations,
                )}
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
