import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { InputField } from '@jod/design-system';
import { WorkHistoryForm } from './utils';

const TyopaikkaOrToimenkuvaStep = ({ type, toimenkuva }: { type: 'tyopaikka' | 'toimenkuva'; toimenkuva: number }) => {
  const { t } = useTranslation();
  const { register, watch } = useFormContext<WorkHistoryForm>();
  const id = watch('id');
  const toimenkuvaId = watch(`toimenkuvat.${toimenkuva}.id`);

  return (
    <>
      <h2 className="mb-4 text-heading-3 text-black sm:mb-5 sm:text-heading-2">
        {type === 'tyopaikka' && !id && t('work-history.add-new-workplace')}
        {type === 'tyopaikka' && id && t('work-history.edit-workplace')}
        {type === 'toimenkuva' && !toimenkuvaId && t('work-history.add-new-job-description')}
        {type === 'toimenkuva' && toimenkuvaId && t('work-history.edit-job-description')}
      </h2>
      <p className="mb-7 text-body-sm text-primary-gray sm:mb-9">
        Lorem ipsum dolor sit amet, no vis verear commodo. Vix quot dicta phaedrum ad. Has eu invenire concludaturque,
        simul accusata no ius. Volumus corpora per te, pri lucilius salutatus iracundia ut. Mutat posse voluptua quo cu,
        in albucius nominavi principes eum, quem facilisi cotidieque mel no.
      </p>
      {type === 'tyopaikka' && (
        <div className="mb-6">
          <InputField
            label={t('work-history.employer')}
            {...register('nimi')}
            placeholder="Lorem ipsum dolor sit amet"
            help="Help text"
          />
        </div>
      )}
      <div className="mb-6">
        <InputField
          label={t('work-history.job-description')}
          {...register(`toimenkuvat.${toimenkuva}.nimi` as const)}
          placeholder="Lorem ipsum dolor sit amet"
          help="Help text"
        />
      </div>
      <div className="mb-6 flex grow gap-6">
        <div className="block w-full">
          <InputField
            label={t('work-history.started')}
            {...register(`toimenkuvat.${toimenkuva}.alkuPvm` as const)}
            placeholder={t('date-placeholder')}
            help="Help text"
          />
        </div>
        <div className="block w-full">
          <InputField
            label={t('work-history.ended')}
            {...register(`toimenkuvat.${toimenkuva}.loppuPvm` as const)}
            placeholder={t('date-or-continues-placeholder')}
            help="Help text"
          />
        </div>
      </div>
    </>
  );
};

export default TyopaikkaOrToimenkuvaStep;
