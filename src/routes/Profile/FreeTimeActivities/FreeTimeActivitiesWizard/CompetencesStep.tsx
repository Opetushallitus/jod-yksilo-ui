import { OsaamisSuosittelija } from '@/components';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FreeTimeActivitiesForm } from './utils';

interface CompetencesStepProps {
  patevyys: number;
}

const CompetencesStep = ({ patevyys }: CompetencesStepProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { getValues, watch, control } = useFormContext<FreeTimeActivitiesForm>();
  const id = watch(`patevyydet.${patevyys}.id`);

  return (
    <>
      <h2 className="mb-2 text-heading-3 text-black sm:text-heading-2">
        {id ? t('profile.competences.edit') : t('free-time-activities.identify-proficiencies')}
      </h2>
      <h3 className="mb-4 text-heading-5 font-arial text-black sm:mb-5 sm:text-heading-3 sm:font-poppins">
        {getValues(`nimi.${language}`)} - {getValues(`patevyydet.${patevyys}.nimi.${language}`)}
      </h3>
      <p className="mb-7 text-body-sm font-arial sm:mb-9 text-todo">
        Lorem ipsum dolor sit amet, no vis verear commodo. Vix quot dicta phaedrum ad. Has eu invenire concludaturque,
        simul accusata no ius. Volumus corpora per te, pri lucilius salutatus iracundia ut. Mutat posse voluptua quo cu,
        in albucius nominavi principes eum, quem facilisi cotidieque mel no.
      </p>
      <Controller
        control={control}
        name={`patevyydet.${patevyys}.osaamiset`}
        render={({ field: { onChange, value } }) => (
          <OsaamisSuosittelija onChange={onChange} value={value} sourceType="PATEVYYS" />
        )}
      />
    </>
  );
};

export default CompetencesStep;
