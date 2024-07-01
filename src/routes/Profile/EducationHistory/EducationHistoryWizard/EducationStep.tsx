import { Datepicker, InputField } from '@jod/design-system';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { EducationHistoryForm } from './utils';

interface EducationStepProps {
  type: 'koulutus' | 'tutkinto';
  tutkinto: number;
}

const EducationStep = ({ type, tutkinto }: EducationStepProps) => {
  const { t } = useTranslation();
  const { register, watch, control } = useFormContext<EducationHistoryForm>();
  const id = watch('id');
  const tutkintoId = watch(`koulutukset.${tutkinto}.id`);

  return (
    <>
      <h2 className="mb-4 text-heading-3 text-black sm:mb-5 sm:text-heading-2">
        {type === 'koulutus' && !id && t('education-history.add-new-education')}
        {type === 'koulutus' && id && t('education-history.edit-education')}
        {type === 'tutkinto' && !tutkintoId && t('education-history.add-new-degree-or-course')}
        {type === 'tutkinto' && tutkintoId && t('education-history.edit-degree')}
      </h2>
      <p className="mb-7 text-body-sm text-black sm:mb-9">
        Lorem ipsum dolor sit amet, no vis verear commodo. Vix quot dicta phaedrum ad. Has eu invenire concludaturque,
        simul accusata no ius. Volumus corpora per te, pri lucilius salutatus iracundia ut. Mutat posse voluptua quo cu,
        in albucius nominavi principes eum, quem facilisi cotidieque mel no.
      </p>
      {type === 'koulutus' && (
        <div className="mb-6">
          <InputField
            label={t('education-history.educational-institution')}
            {...register('nimi')}
            placeholder="Lorem ipsum dolor sit amet"
            help="Help text"
          />
        </div>
      )}
      <div className="mb-6">
        <InputField
          label={type === 'koulutus' ? t('education-history.degree') : t('education-history.degree-or-course')}
          {...register(`koulutukset.${tutkinto}.nimi` as const)}
          placeholder="Lorem ipsum dolor sit amet"
          help="Help text"
        />
      </div>
      <div className="mb-6 flex grow gap-6">
        <div className="block w-full">
          <Controller
            control={control}
            render={({ field }) => (
              <Datepicker
                label={t('work-history.started')}
                {...field}
                placeholder={t('date-placeholder')}
                help="Help text"
              />
            )}
            name={`koulutukset.${tutkinto}.alkuPvm`}
          />
        </div>
        <div className="block w-full">
          <Controller
            control={control}
            render={({ field }) => (
              <Datepicker
                label={t('work-history.ended')}
                {...field}
                placeholder={t('date-or-continues-placeholder')}
                help="Help text"
              />
            )}
            name={`koulutukset.${tutkinto}.loppuPvm`}
          />
        </div>
      </div>
    </>
  );
};

export default EducationStep;
