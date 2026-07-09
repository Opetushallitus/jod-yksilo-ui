import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { OsaamisSuosittelija } from '@/components';

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
    <div className="box-content max-w-modal-content px-5 md:px-9">
      <h3
        className="mb-6 font-poppins text-heading-3-mobile text-primary-gray sm:text-heading-3"
        data-testid="competences-step-header"
      >
        {getValues(`nimi.${language}`)} - {getValues(`toimenkuvat.${toimenkuva}.nimi.${language}`)}
      </h3>
      <p className="mb-6 font-arial text-body-md-mobile sm:text-body-md">
        {t('profile.work-history.modals.competences-description')}
      </p>
      <Controller
        control={control}
        name={`toimenkuvat.${toimenkuva}.osaamiset`}
        render={({ field: { onChange, value } }) => (
          <OsaamisSuosittelija
            onChange={onChange}
            value={value}
            sourceType="TOIMENKUVA"
            textAreaClassName="max-w-modal-content!"
            tagHeadingLevel="h4"
          />
        )}
      />
    </div>
  );
};

export default CompetencesStep;
