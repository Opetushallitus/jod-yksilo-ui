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
  const { register, watch, control } = useFormContext<FreeTimeActivitiesForm>();
  const id = watch('id');
  const patevyysId = watch(`patevyydet.${patevyys}.id`);
  return (
    <>
      <h2 className="mb-4 text-heading-3 text-black sm:mb-5 sm:text-heading-2">
        {type === 'toiminta' && !id && t('free-time-activities.add-new-activity')}
        {type === 'toiminta' && id && t('free-time-activities.edit-activity')}
        {type === 'patevyys' && !patevyysId && t('free-time-activities.add-new-proficiency')}
        {type === 'patevyys' && patevyysId && t('free-time-activities.edit-proficiency')}
      </h2>
      <p className="mb-7 text-body-sm font-arial sm:mb-9 text-todo">
        Lorem ipsum dolor sit amet, no vis verear commodo. Vix quot dicta phaedrum ad. Has eu invenire concludaturque,
        simul accusata no ius. Volumus corpora per te, pri lucilius salutatus iracundia ut. Mutat posse voluptua quo cu,
        in albucius nominavi principes eum, quem facilisi cotidieque mel no.
      </p>
      {type === 'toiminta' && (
        <div className="mb-6">
          <InputField
            label={t('free-time-activities.activity-name')}
            {...register(`nimi.${language}` as const)}
            placeholder="TODO: Lorem ipsum dolor sit amet"
            help="TODO: Help text"
          />
        </div>
      )}
      <div className="mb-6">
        <InputField
          label={t('free-time-activities.proficiency')}
          {...register(`patevyydet.${patevyys}.nimi.${language}` as const)}
          placeholder="TODO: Lorem ipsum dolor sit amet"
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
            name={`patevyydet.${patevyys}.alkuPvm`}
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
            name={`patevyydet.${patevyys}.loppuPvm`}
          />
        </div>
      </div>
    </>
  );
};

export default ActivityStep;
