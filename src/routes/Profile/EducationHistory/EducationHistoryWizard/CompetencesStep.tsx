import { OsaamisSuosittelija } from '@/components';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { EducationHistoryForm } from './utils';

interface CompetencesStepProps {
  koulutus: number;
}

const CompetencesStep = ({ koulutus }: CompetencesStepProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { getValues, watch, control } = useFormContext<EducationHistoryForm>();
  const id = watch(`koulutukset.${koulutus}.id`);

  return (
    <>
      <h2 className="mb-3 font-poppins text-black text-hero-mobile sm:text-hero">
        {id ? t('profile.competences.edit') : t('education-history.identify-competences')}
      </h2>
      <h3 className="mb-6 font-poppins text-black text-heading-3-mobile sm:text-heading-3">
        {getValues(`nimi.${language}`)} - {getValues(`koulutukset.${koulutus}.nimi.${language}`)}
      </h3>
      <p className="mb-6 font-arial text-body-md-mobile sm:text-body-md">
        {t('profile.education-history.modals.competences-description')}
      </p>
      <Controller
        control={control}
        name={`koulutukset.${koulutus}.osaamiset`}
        render={({ field: { onChange, value } }) => (
          <OsaamisSuosittelija onChange={onChange} value={value} sourceType="KOULUTUS" />
        )}
      />
    </>
  );
};

export default CompetencesStep;
