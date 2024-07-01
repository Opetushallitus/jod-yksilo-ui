import { OsaamisSuosittelija } from '@/components';
import { useDebounceState } from '@/hooks/useDebounceState';
import { InputField } from '@jod/design-system';
import { ChangeEvent } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { WorkHistoryForm } from './utils';

interface CompetencesStepProps {
  toimenkuva: number;
}

const CompetencesStep = ({ toimenkuva }: CompetencesStepProps) => {
  const { t } = useTranslation();
  const { getValues, watch, control } = useFormContext<WorkHistoryForm>();
  const [debouncedDescription, description, setDescription] = useDebounceState('', 500);
  const id = watch(`toimenkuvat.${toimenkuva}.id`);

  return (
    <>
      <h2 className="mb-2 text-heading-3 text-black sm:text-heading-2">
        {id ? t('work-history.edit-competences') : t('work-history.identify-competences')}
      </h2>
      <h3 className="mb-4 text-heading-5 text-black sm:mb-5 sm:text-heading-3">
        {getValues('nimi')} - {getValues(`toimenkuvat.${toimenkuva}.nimi`)}
      </h3>
      <p className="mb-7 text-body-sm text-black sm:mb-9">
        Lorem ipsum dolor sit amet, no vis verear commodo. Vix quot dicta phaedrum ad. Has eu invenire concludaturque,
        simul accusata no ius. Volumus corpora per te, pri lucilius salutatus iracundia ut. Mutat posse voluptua quo cu,
        in albucius nominavi principes eum, quem facilisi cotidieque mel no.
      </p>
      <div className="mb-6">
        <InputField
          label={t('work-history.job-duties')}
          value={description}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setDescription(event.target.value)}
          placeholder="Lorem ipsum dolor sit amet"
          help="Help text"
        />
      </div>

      <Controller
        control={control}
        name={`toimenkuvat.${toimenkuva}.osaamiset`}
        render={({ field: { onChange, value } }) => (
          <OsaamisSuosittelija description={debouncedDescription} onChange={onChange} value={value} />
        )}
      />
    </>
  );
};

export default CompetencesStep;
