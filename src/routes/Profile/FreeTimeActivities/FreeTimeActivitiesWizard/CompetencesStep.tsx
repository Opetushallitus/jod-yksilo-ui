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
      <h2
        className="mb-3 font-poppins text-black text-hero-mobile sm:text-hero"
        data-testid="free-time-competences-title"
      >
        {id ? t('profile.competences.edit') : t('free-time-activities.identify-proficiencies')}
      </h2>
      <h3 className="mb-6 font-poppins text-black text-heading-3-mobile sm:text-heading-3">
        {getValues(`nimi.${language}`)} - {getValues(`patevyydet.${patevyys}.nimi.${language}`)}
      </h3>
      <p className="mb-6 font-arial text-body-md-mobile sm:text-body-md">
        {t('profile.free-time-activities.modals.competences-description')}
      </p>
      <Controller
        control={control}
        name={`patevyydet.${patevyys}.osaamiset`}
        render={({ field: { onChange, value } }) => (
          <OsaamisSuosittelija
            onChange={onChange}
            value={value}
            sourceType="PATEVYYS"
            placeholder={t('profile.free-time-activities.modals.competences-placeholder')}
            data-testid="free-time-competences-picker"
          />
        )}
      />
    </>
  );
};

export default CompetencesStep;
