import { addPlanStore } from '@/routes/Profile/MyGoals/addPlan/store/addPlanStore.ts';
import { getLocalizedText } from '@/utils';
import { EmptyState, Tag } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

const SelectCompetencesStep = () => {
  const { t } = useTranslation();
  const { vaaditutOsaamiset, add, selected, remove } = addPlanStore(
    useShallow((state) => ({
      vaaditutOsaamiset: state.vaaditutOsaamiset,
      selected: state.selectedOsaamiset,
      add: state.addSelectedOsaaminen,
      remove: state.removeSelectedOsaaminen,
    })),
  );

  return (
    <div className="max-h-[80vh] overflow-y-auto p-4 w-full">
      <h1 className="text-heading-1-mobile sm:text-heading-1">{t('profile.my-goals.add-custom-plan-header')}</h1>
      <p className="ds:mt-3">{t('profile.my-goals.custom-plan-competences-description')}</p>

      <div className="ds:sm:mt-8 w-full">
        <h2 className="text-heading-3">{t('profile.my-goals.required-competences')}</h2>
        <p className="text-secondary-gray text-body-sm">{t('profile.my-goals.add-competence-description')}</p>
        <ul className="flex flex-wrap gap-2 mt-2">
          {vaaditutOsaamiset
            .filter((vo) => !selected.includes(vo))
            .map((o) => (
              <li key={o.uri}>
                <Tag
                  onClick={() => add(o)}
                  label={getLocalizedText(o.nimi)}
                  tooltip={getLocalizedText(o.kuvaus)}
                  variant="selectable"
                  sourceType="vapaa-ajan-toiminto"
                />
              </li>
            ))}
        </ul>
      </div>

      <div className="ds:sm:mt-8 w-full">
        <h2 className="text-heading-3">{t('profile.my-goals.selected-competences')}</h2>
        {selected.length == 0 && (
          <EmptyState text={t('profile.my-goals.no-chosen-competences')} testId="plan-competences-empty-state" />
        )}
        {selected.length > 0 && (
          <>
            <p className="text-secondary-gray text-body-sm">{t('profile.my-goals.remove-competence-description')}</p>
            <ul className="flex flex-wrap gap-2 mt-3">
              {selected.map((o) => (
                <li key={o.uri}>
                  <Tag
                    onClick={() => remove(o)}
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
