import { getLocalizedText } from '@/utils';
import { EmptyState, Tag } from '@jod/design-system';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { addPlanStore } from '../store/addPlanStore';
import type { OmaSuunnitelmaForm } from './AddOrEditCustomPlanModal';

const SelectCompetencesStep = () => {
  const { t } = useTranslation();
  const vaaditutOsaamiset = addPlanStore((state) => state.vaaditutOsaamiset);

  const { control } = useFormContext<OmaSuunnitelmaForm>();
  const {
    append,
    remove,
    fields: valitutOsaamiset,
  } = useFieldArray({
    control,
    name: 'osaamiset',
  });

  return (
    <div className="max-h-[80vh] overflow-y-auto p-4 w-full">
      <p className="mt-3 font-arial mb-6">{t('profile.my-goals.custom-plan-competences-description')}</p>

      <div className="sm:mt-8 w-full">
        <h2 className="text-heading-3">{t('profile.my-goals.required-competences')}</h2>
        <p className="text-secondary-gray text-body-sm font-arial">
          {t('profile.my-goals.add-competence-description')}
        </p>
        <ul className="flex flex-wrap gap-2 mt-2">
          {vaaditutOsaamiset
            .filter((vo) => !valitutOsaamiset.some((field) => field.uri === vo.uri))
            .map((o) => (
              <li key={o.uri} className="max-w-full">
                <Tag
                  onClick={() => append(o)}
                  label={getLocalizedText(o.nimi)}
                  tooltip={getLocalizedText(o.kuvaus)}
                  variant="selectable"
                  sourceType="koulutus"
                />
              </li>
            ))}
        </ul>
      </div>

      <div className="sm:mt-8 w-full mt-6">
        <h2 className="text-heading-3">{t('profile.my-goals.selected-competences')}</h2>
        {valitutOsaamiset.length === 0 && (
          <EmptyState text={t('profile.my-goals.no-chosen-competences')} testId="plan-competences-empty-state" />
        )}
        {valitutOsaamiset.length > 0 && (
          <>
            <p className="text-secondary-gray text-body-sm font-arial">
              {t('profile.my-goals.remove-competence-description')}
            </p>
            <ul className="flex flex-wrap gap-2 mt-3">
              {valitutOsaamiset.map((o, i) => (
                <li key={o.id} className="max-w-full">
                  <Tag
                    onClick={() => remove(i)}
                    label={getLocalizedText(o.nimi)}
                    tooltip={getLocalizedText(o.kuvaus)}
                    variant="added"
                    sourceType="koulutus"
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default SelectCompetencesStep;
