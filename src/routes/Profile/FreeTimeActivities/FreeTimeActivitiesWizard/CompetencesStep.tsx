import { OsaamisSuosittelija } from '@/components';
import { useDebounceState } from '@/hooks/useDebounceState';
import { InputField } from '@jod/design-system';
import { ChangeEvent } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FreeTimeActivitiesForm } from './utils';

interface CompetencesStepProps {
  patevyys: number;
}

const CompetencesStep = ({ patevyys }: CompetencesStepProps) => {
  const { t } = useTranslation();
  const { getValues, watch, control } = useFormContext<FreeTimeActivitiesForm>();
  const [debouncedDescription, description, setDescription] = useDebounceState('', 500);
  const id = watch(`patevyydet.${patevyys}.id`);

  return (
    <>
      <h2 className="mb-2 text-heading-3 text-black sm:text-heading-2">
        {id ? t('free-time-activities.edit-proficiencies') : t('free-time-activities.identify-proficiencies')}
      </h2>
      <h3 className="mb-4 text-heading-5 font-arial text-black sm:mb-5 sm:text-heading-3 sm:font-poppins">
        {getValues('nimi')} - {getValues(`patevyydet.${patevyys}.nimi`)}
      </h3>
      <p className="mb-7 text-body-sm font-arial sm:mb-9 text-todo">
        Lorem ipsum dolor sit amet, no vis verear commodo. Vix quot dicta phaedrum ad. Has eu invenire concludaturque,
        simul accusata no ius. Volumus corpora per te, pri lucilius salutatus iracundia ut. Mutat posse voluptua quo cu,
        in albucius nominavi principes eum, quem facilisi cotidieque mel no.
      </p>
      <div className="mb-6">
        <InputField
          label={t('free-time-activities.activity-content')}
          value={description}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setDescription(event.target.value)}
          placeholder="TODO: Lorem ipsum dolor sit amet"
          help="TODO: Help text"
        />
      </div>

      <Controller
        control={control}
        name={`patevyydet.${patevyys}.osaamiset`}
        render={({ field: { onChange, value } }) => (
          <OsaamisSuosittelija
            description={debouncedDescription}
            onChange={onChange}
            value={value}
            sourceType="PATEVYYS"
          />
        )}
      />
    </>
  );
};

export default CompetencesStep;
