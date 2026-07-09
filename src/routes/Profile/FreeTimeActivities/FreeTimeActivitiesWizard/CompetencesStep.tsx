import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { OsaamisSuosittelija } from '@/components';

import type { FreeTimeActivitiesForm } from './utils';

interface CompetencesStepProps {
  toiminto: number;
}

const CompetencesStep = ({ toiminto }: CompetencesStepProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { getValues, control } = useFormContext<FreeTimeActivitiesForm>();

  return (
    <div className="box-content max-w-modal-content px-5 md:px-9">
      <h3
        className="mb-6 font-poppins text-heading-3-mobile text-primary-gray sm:text-heading-3"
        data-testid="competences-step-header"
      >
        {getValues(`nimi.${language}`)} - {getValues(`toiminnot.${toiminto}.nimi.${language}`)}
      </h3>
      <p className="mb-6 font-arial text-body-md-mobile sm:text-body-md">
        {t('profile.free-time-activities.modals.competences-description')}
      </p>
      <Controller
        control={control}
        name={`toiminnot.${toiminto}.osaamiset`}
        render={({ field: { onChange, value } }) => (
          <OsaamisSuosittelija
            onChange={onChange}
            value={value}
            sourceType="TOIMINTO"
            placeholder={t('profile.free-time-activities.modals.competences-placeholder')}
            textAreaClassName="max-w-modal-content!"
            tagHeadingLevel="h4"
          />
        )}
      />
    </div>
  );
};

export default CompetencesStep;
