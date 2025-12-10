import { OsaamisSuosittelija } from '@/components';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { WorkHistoryForm } from './utils';

interface CompetencesStepProps {
  toimenkuva: number;
}

const CompetencesStep = ({ toimenkuva }: CompetencesStepProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { getValues, control } = useFormContext<WorkHistoryForm>();

  return (
    <>
      <h3 className="mb-6 font-poppins text-black text-heading-3-mobile sm:text-heading-3">
        {getValues(`nimi.${language}`)} - {getValues(`toimenkuvat.${toimenkuva}.nimi.${language}`)}
      </h3>
      <p className="mb-6 font-arial text-body-md-mobile sm:text-body-md">
        {t('profile.work-history.modals.competences-description')}
      </p>
      <Controller
        control={control}
        name={`toimenkuvat.${toimenkuva}.osaamiset`}
        render={({ field: { onChange, value } }) => (
          <OsaamisSuosittelija onChange={onChange} value={value} sourceType="TOIMENKUVA" />
        )}
      />
    </>
  );
};

export default CompetencesStep;
