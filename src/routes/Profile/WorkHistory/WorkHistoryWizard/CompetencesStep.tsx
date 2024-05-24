import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { useDebounceState } from '@/hooks/useDebounceState';
import { type WorkHistoryForm } from './utils';
import { InputField } from '@jod/design-system';
import ConnectCompetences from './ConnectCompetences';

const CompetencesStep = ({ toimenkuva }: { toimenkuva: number }) => {
  const { t } = useTranslation();
  const { getValues, watch } = useFormContext<WorkHistoryForm>();
  const [debouncedTyotehtava, tyotehtava, setTyotehtava] = useDebounceState('', 500);
  const id = watch(`toimenkuvat.${toimenkuva}.id`);

  return (
    <>
      <h2 className="mb-2 text-heading-3 text-black sm:text-heading-2">
        {id ? t('work-history.edit-competences') : t('work-history.identify-competences')}
      </h2>
      <h3 className="mb-4 text-heading-5 text-black sm:mb-5 sm:text-heading-3">
        {getValues('nimi')} - {getValues(`toimenkuvat.${toimenkuva}.nimi`)}
      </h3>
      <p className="mb-7 text-body-sm text-primary-gray sm:mb-9">
        Lorem ipsum dolor sit amet, no vis verear commodo. Vix quot dicta phaedrum ad. Has eu invenire concludaturque,
        simul accusata no ius. Volumus corpora per te, pri lucilius salutatus iracundia ut. Mutat posse voluptua quo cu,
        in albucius nominavi principes eum, quem facilisi cotidieque mel no.
      </p>
      <div className="mb-6">
        <InputField
          label={t('work-history.job-duties')}
          value={tyotehtava}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setTyotehtava(event.target.value)}
          placeholder="Lorem ipsum dolor sit amet"
          help="Help text"
        />
      </div>
      <ConnectCompetences tyotehtava={debouncedTyotehtava} toimenkuva={toimenkuva} />
    </>
  );
};

export default CompetencesStep;