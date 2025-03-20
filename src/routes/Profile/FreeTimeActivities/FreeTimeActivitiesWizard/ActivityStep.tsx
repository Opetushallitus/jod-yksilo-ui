import { FormError, TouchedFormError } from '@/components';
import { DatePickerTranslations, getDatePickerTranslations } from '@/utils';
import { Datepicker, InputField } from '@jod/design-system';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FreeTimeActivitiesForm } from './utils';

interface ActivityStepProps {
  type: 'toiminta' | 'patevyys';
  patevyys: number;
}

const ActivityStep = ({ type, patevyys }: ActivityStepProps) => {
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
  const id = watch('id');
  const patevyysId = watch(`patevyydet.${patevyys}.id`);
  return (
    <>
      <h2 className="mb-4 text-heading-3 text-black sm:mb-5 sm:text-heading-2">
        {type === 'toiminta' && !id && t('free-time-activities.add-new-free-time-activity')}
        {type === 'toiminta' && id && t('free-time-activities.edit-activity')}
        {type === 'patevyys' && !patevyysId && t('free-time-activities.add-new-activity')}
        {type === 'patevyys' && patevyysId && t('free-time-activities.edit-proficiency')}
      </h2>
      <p className="mb-7 text-body-sm font-arial sm:mb-9">{t('profile.free-time-activities.modals.description')}</p>
      {type === 'toiminta' && (
        <div className="mb-6">
          <InputField
            label={t('free-time-activities.name-of-free-time-theme')}
            {...register(`nimi.${language}` as const)}
            placeholder={t('profile.free-time-activities.modals.name-of-free-time-theme-placeholder')}
          />
          <FormError name={`nimi.${language}`} errors={errors} />
        </div>
      )}
      <div className="mb-6">
        <InputField
          label={t('free-time-activities.name-of-free-time-activity')}
          {...register(`patevyydet.${patevyys}.nimi.${language}` as const)}
          placeholder={t('profile.free-time-activities.modals.name-of-free-time-activity-placeholder')}
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
                translations={getDatePickerTranslations(
                  t('datepicker', { returnObjects: true }) as DatePickerTranslations,
                )}
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
                translations={getDatePickerTranslations(
                  t('datepicker', { returnObjects: true }) as DatePickerTranslations,
                )}
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
