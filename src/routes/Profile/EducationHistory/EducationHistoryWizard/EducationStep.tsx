import { FormError, TouchedFormError } from '@/components';
import { DatePickerTranslations, getDatePickerTranslations } from '@/utils';
import { Datepicker, InputField } from '@jod/design-system';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { EducationHistoryForm } from './utils';

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
    watch,
    control,
    trigger,
    formState: { errors, touchedFields },
  } = useFormContext<EducationHistoryForm>();
  const id = watch('id');
  const koulutusId = watch(`koulutukset.${koulutus}.id`);

  return (
    <>
      <h2 className="mb-6 text-black text-hero-mobile sm:text-hero">
        {type === 'oppilaitos' && !id && t('education-history.add-new-education')}
        {type === 'oppilaitos' && id && t('education-history.edit-education')}
        {type === 'koulutus' && !koulutusId && t('education-history.add-studies-to-this-education')}
        {type === 'koulutus' && koulutusId && t('education-history.edit-degree-or-education')}
      </h2>
      <p className="mb-6 font-arial text-body-md-mobile sm:text-body-md">
        {t('profile.education-history.modals.description')}
      </p>
      {type === 'oppilaitos' && (
        <div className="mb-6">
          <InputField
            label={t('education-history.educational-institution-or-education-provider')}
            {...register(`nimi.${language}` as const)}
            placeholder={t('profile.education-history.modals.workplace-placeholder')}
          />
          <FormError name={`nimi.${language}`} errors={errors} />
        </div>
      )}
      <div className="mb-6">
        <InputField
          label={t('education-history.name-of-degree-or-education')}
          {...register(`koulutukset.${koulutus}.nimi.${language}` as const)}
          placeholder={t('profile.education-history.modals.job-description-placeholder')}
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
                translations={getDatePickerTranslations(
                  t('datepicker', { returnObjects: true }) as DatePickerTranslations,
                )}
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
                translations={getDatePickerTranslations(
                  t('datepicker', { returnObjects: true }) as DatePickerTranslations,
                )}
              />
            )}
            name={`koulutukset.${koulutus}.loppuPvm`}
          />
          <FormError name={`koulutukset.${koulutus}.loppuPvm`} errors={errors} />
        </div>
      </div>
    </>
  );
};

export default EducationStep;
