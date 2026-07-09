import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { OsaamisSuosittelija } from '@/components';

import type { EducationHistoryForm } from './utils';

interface CompetencesStepProps {
  koulutus: number;
}

const CompetencesStep = ({ koulutus }: CompetencesStepProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { getValues, control } = useFormContext<EducationHistoryForm>();

  return (
    <>
      <div className="box-content max-w-modal-content px-5 md:px-9">
        <h3
          className="mb-6 font-poppins text-heading-3-mobile text-primary-gray sm:text-heading-3"
          data-testid="competences-step-header"
        >
          {getValues(`nimi.${language}`)} - {getValues(`koulutukset.${koulutus}.nimi.${language}`)}
        </h3>
        <p className="mb-6 font-arial text-body-md-mobile sm:text-body-md">
          {t('profile.education-history.modals.competences-description')}
        </p>
      </div>
      <div className="box-content max-w-modal-content px-5 md:px-9">
        <Controller
          control={control}
          name={`koulutukset.${koulutus}.osaamiset`}
          render={({ field: { onChange, value } }) => (
            <OsaamisSuosittelija
              onChange={onChange}
              value={value}
              sourceType="KOULUTUS"
              textAreaClassName="max-w-modal-content!"
              tagHeadingLevel="h4"
            />
          )}
        />
      </div>
    </>
  );
};

export default CompetencesStep;
