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
  const { getValues, watch, control } = useFormContext<WorkHistoryForm>();
  const id = watch(`toimenkuvat.${toimenkuva}.id`);

  return (
    <>
      <h2 className="mb-2 text-heading-3 text-black sm:text-heading-2 font-poppins">
        {id ? t('profile.competences.edit') : t('work-history.identify-competences')}
      </h2>
      <h3 className="mb-4 text-heading-5 font-arial text-black sm:mb-5 sm:text-heading-3 sm:font-poppins">
        {getValues(`nimi.${language}`)} - {getValues(`toimenkuvat.${toimenkuva}.nimi.${language}`)}
      </h3>
      <p className="mb-7 text-body-sm font-arial sm:mb-9">{t('profile.work-history.modals.competences-description')}</p>
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
