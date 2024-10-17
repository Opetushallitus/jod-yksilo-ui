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
  const { register, watch, control } = useFormContext<EducationHistoryForm>();
  const id = watch('id');
  const koulutusId = watch(`koulutukset.${koulutus}.id`);

  return (
    <>
      <h2 className="mb-4 text-heading-3 text-black sm:mb-5 sm:text-heading-2">
        {type === 'oppilaitos' && !id && t('education-history.add-new-education')}
        {type === 'oppilaitos' && id && t('education-history.edit-education')}
        {type === 'koulutus' && !koulutusId && t('education-history.add-new-degree')}
        {type === 'koulutus' && koulutusId && t('education-history.edit-degree')}
      </h2>
      <p className="mb-7 text-body-sm font-arial sm:mb-9 text-todo">
        Lorem ipsum dolor sit amet, no vis verear commodo. Vix quot dicta phaedrum ad. Has eu invenire concludaturque,
        simul accusata no ius. Volumus corpora per te, pri lucilius salutatus iracundia ut. Mutat posse voluptua quo cu,
        in albucius nominavi principes eum, quem facilisi cotidieque mel no.
      </p>
      {type === 'oppilaitos' && (
        <div className="mb-6">
          <InputField
            label={t('education-history.educational-institution')}
            {...register(`nimi.${language}` as const)}
            placeholder="Lorem ipsum dolor sit amet"
            help="TODO: Help text"
          />
        </div>
      )}
      <div className="mb-6">
        <InputField
          label={t('education-history.degree')}
          {...register(`koulutukset.${koulutus}.nimi.${language}` as const)}
          placeholder="Lorem ipsum dolor sit amet"
          help="TODO: Help text"
        />
      </div>
      <div className="mb-6 flex grow gap-6">
        <div className="block w-full">
          <Controller
            control={control}
            render={({ field }) => (
              <Datepicker label={t('started')} {...field} placeholder={t('date-placeholder')} help="TODO: Help text" />
            )}
            name={`koulutukset.${koulutus}.alkuPvm`}
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
                help="TODO: Help text"
              />
            )}
            name={`koulutukset.${koulutus}.loppuPvm`}
          />
        </div>
      </div>
    </>
  );
};

export default EducationStep;
