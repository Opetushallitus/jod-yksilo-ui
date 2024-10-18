import { OsaamisSuosittelija } from '@/components';
import { useDebounceState } from '@/hooks/useDebounceState';
import { InputField } from '@jod/design-system';
import { ChangeEvent } from 'react';
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
  const [debouncedDescription, description, setDescription] = useDebounceState('', 500);
  const id = watch(`koulutukset.${koulutus}.id`);

  return (
    <>
      <h2 className="mb-2 text-heading-3 text-black sm:text-heading-2 font-poppins">
        {id ? t('education-history.edit-competences') : t('education-history.identify-competences')}
      </h2>
      <h3 className="mb-4 text-heading-5 font-arial text-black sm:mb-5 sm:text-heading-3 sm:font-poppins">
        {getValues(`nimi.${language}`)} - {getValues(`koulutukset.${koulutus}.nimi.${language}`)}
      </h3>
      <p className="mb-7 text-body-sm font-arial sm:mb-9">
        {t('profile.education-history.modals.competences-description')}
      </p>
      <div className="mb-6">
        <InputField
          label={t('education-history.educational-content')}
          value={description}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setDescription(event.target.value)}
          help={t('profile.work-history.modals.competences-help')}
        />
      </div>

      <Controller
        control={control}
        name={`koulutukset.${koulutus}.osaamiset`}
        render={({ field: { onChange, value } }) => (
          <OsaamisSuosittelija
            description={debouncedDescription}
            onChange={onChange}
            value={value}
            sourceType="KOULUTUS"
          />
        )}
      />
    </>
  );
};

export default CompetencesStep;
