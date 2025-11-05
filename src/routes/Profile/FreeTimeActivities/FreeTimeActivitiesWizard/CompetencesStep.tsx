import { OsaamisSuosittelija } from '@/components';
import { ModalHeader } from '@/components/ModalHeader';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { FreeTimeActivitiesForm } from './utils';

interface CompetencesStepProps {
  patevyys: number;
  headerText: string;
}

const CompetencesStep = ({ patevyys, headerText }: CompetencesStepProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { getValues, control } = useFormContext<FreeTimeActivitiesForm>();

  return (
    <>
      <ModalHeader text={headerText} testId="free-time-competences-title" />
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
          />
        )}
      />
    </>
  );
};

export default CompetencesStep;
