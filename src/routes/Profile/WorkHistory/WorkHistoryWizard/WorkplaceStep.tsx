import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Datepicker, InputField, Textarea } from '@jod/design-system';

import { LIMITS } from '@/constants';
import { useDatePickerTranslations } from '@/hooks/useDatePickerTranslations';
import { getFormErrorMessage } from '@/utils';

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

  const datePickerTranslations = useDatePickerTranslations();
  const errors = formState.errors;
  const alkuPvm = watch(`toimenkuvat.${toimenkuva}.alkuPvm`);
  const loppuPvm = watch(`toimenkuvat.${toimenkuva}.loppuPvm`);
  React.useEffect(() => {
    if (alkuPvm || loppuPvm) {
      void trigger();
    }
  }, [alkuPvm, loppuPvm, trigger]);

  return (
    <div className="box-content max-w-modal-content px-5 md:px-9">
      <p className="mb-6 font-arial text-body-md-mobile sm:text-body-md">
        {t('profile.work-history.modals.description')}
      </p>
      {type === 'tyopaikka' && (
        <div className="mb-6" data-testid="work-history-employer-field">
          <InputField
            label={t('work-history.employer')}
            {...register(`nimi.${language}` as const)}
            placeholder={t('profile.work-history.modals.workplace-placeholder')}
            requiredText={t('common:required')}
            testId="work-history-workplace-input"
            errorMessage={getFormErrorMessage(errors, `nimi.${language}`)}
          />
        </div>
      )}
      <div className="mb-6" data-testid="work-history-job-description-field">
        <InputField
          label={t('work-history.job-description')}
          {...register(`toimenkuvat.${toimenkuva}.nimi.${language}` as const)}
          requiredText={t('common:required')}
          placeholder={t('profile.work-history.modals.job-description-placeholder')}
          help={t('profile.work-history.modals.job-description-help')}
          testId="work-history-job-description-input"
          errorMessage={getFormErrorMessage(errors, `toimenkuvat.${toimenkuva}.nimi.${language}`)}
        />
      </div>
      <div className="mb-6 flex grow gap-4">
        <div className="w-full sm:max-w-input-short" data-testid="work-history-started-field">
          <Controller
            control={control}
            render={({ field: { onBlur }, field }) => (
              <Datepicker
                label={t('started')}
                {...field}
                onBlur={() => {
                  onBlur();
                  void trigger(`toimenkuvat.${toimenkuva}.loppuPvm`);
                }}
                placeholder={t('date-placeholder')}
                requiredText={t('common:required')}
                translations={datePickerTranslations}
                testId="work-history-start-date"
                errorMessage={getFormErrorMessage(errors, `toimenkuvat.${toimenkuva}.alkuPvm`, formState.touchedFields)}
              />
            )}
            name={`toimenkuvat.${toimenkuva}.alkuPvm`}
          />
        </div>
        <div className="w-full sm:max-w-input-short" data-testid="work-history-ended-field">
          <Controller
            control={control}
            render={({ field }) => (
              <Datepicker
                label={t('ended')}
                {...field}
                placeholder={t('date-or-continues-placeholder')}
                translations={datePickerTranslations}
                testId="work-history-end-date"
                errorMessage={getFormErrorMessage(errors, `toimenkuvat.${toimenkuva}.loppuPvm`)}
              />
            )}
            name={`toimenkuvat.${toimenkuva}.loppuPvm`}
          />
        </div>
      </div>
      <Textarea
        label={t('profile.free-form-input.label')}
        {...register(`toimenkuvat.${toimenkuva}.kuvaus.${language}` as const)}
        maxLength={LIMITS.TEXTAREA}
      />
    </div>
  );
};

export default WorkplaceStep;
