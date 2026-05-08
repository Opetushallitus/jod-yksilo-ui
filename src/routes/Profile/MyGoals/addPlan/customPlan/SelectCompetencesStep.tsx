import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { EmptyState, Tag, useMediaQueries } from '@jod/design-system';

import type { components } from '@/api/schema';
import AddedTags from '@/components/OsaamisSuosittelija/AddedTags';
import { useArrowKeyControls } from '@/hooks/useArrowKeyControls';
import { getLocalizedText } from '@/utils';
import { animateElementToTarget } from '@/utils/animations';

import { addPlanStore } from '../store/addPlanStore';
import type { OmaSuunnitelmaForm } from './AddOrEditCustomPlanModal';

const SelectCompetencesStep = () => {
  const { t } = useTranslation();
  const vaaditutOsaamiset = addPlanStore((state) => state.vaaditutOsaamiset);
  const requiredTagsId = React.useId();
  const addedTagsId = React.useId();
  const selectedTagsContainerRef = React.useRef<HTMLDivElement>(null); // For animation target
  const [skillsToAdd, setSkillsToAdd] = React.useState<string[]>([]);
  const [filteredVaaditutOsaamiset, setFilteredVaaditutOsaamiset] = React.useState<
    components['schemas']['OsaaminenDto'][]
  >([]);

  const { control } = useFormContext<OmaSuunnitelmaForm>();
  const { reduceMotion } = useMediaQueries();
  const {
    append,
    remove,
    fields: valitutOsaamiset,
  } = useFieldArray({
    control,
    name: 'osaamiset',
  });

  React.useEffect(() => {
    setFilteredVaaditutOsaamiset([
      ...vaaditutOsaamiset.filter((osaaminen) => !valitutOsaamiset.some((val) => val.uri === osaaminen.uri)),
    ]);
  }, [vaaditutOsaamiset, valitutOsaamiset]);

  const {
    ref: requiredTagsRef,
    handleKeyDown: handleRequiredTagsKeyboardNavigation,
    setLastClickedIndex: setLastRequiredTagClickedIndex,
  } = useArrowKeyControls(filteredVaaditutOsaamiset);

  const {
    ref: selectedTagsRef,
    handleKeyDown: handleSelectedTagsKeyboardNavigation,
    setLastClickedIndex: setLastSelectedTagClickedIndex,
  } = useArrowKeyControls(valitutOsaamiset);

  const removeOsaaminenById = React.useCallback(
    (ids: string[]) => () => {
      // Assume that last clicked osaaminen is the first one on the list
      const id = ids[0];

      const idx = valitutOsaamiset.findIndex((val) => val.uri === id);
      setLastSelectedTagClickedIndex(idx);
      remove(idx);
    },
    [remove, setLastSelectedTagClickedIndex, valitutOsaamiset],
  );

  return (
    <div className="box-content max-w-modal-content overflow-y-auto px-5 md:px-9">
      <p className="mb-6 font-arial">{t('profile.my-goals.custom-plan-competences-description')}</p>

      <div className="w-full sm:mt-6">
        <div className="font-bold sticky top-0 bg-bg-gray font-arial text-heading-4-mobile sm:text-heading-4">
          <h2 id={requiredTagsId} className="text-heading-3-mobile sm:text-heading-3">
            {t('profile.my-goals.required-competences')}
          </h2>
          <p className="mb-4 font-arial text-body-sm text-secondary-gray">
            {t('profile.my-goals.add-competence-description')}
          </p>
        </div>
        <div className="mb-4 h-[154px] max-h-[228px] min-h-8 overflow-y-auto sm:max-h-[25dvh]">
          <ul
            ref={requiredTagsRef}
            className="flex flex-wrap gap-3 p-1"
            aria-labelledby={requiredTagsId}
            onKeyDown={handleRequiredTagsKeyboardNavigation}
          >
            {filteredVaaditutOsaamiset.map((o, index) => (
              <li key={o.uri} className="max-w-full">
                <Tag
                  onClick={(e) => {
                    skillsToAdd.push(o.uri);
                    append(o);
                    setLastRequiredTagClickedIndex(index);
                    animateElementToTarget(e.currentTarget, selectedTagsContainerRef.current!, () => {
                      setSkillsToAdd((prev) => prev.filter((uri) => uri !== o.uri));
                    });
                  }}
                  label={getLocalizedText(o.nimi)}
                  tooltip={
                    // Do not show tooltip if user has clicked to add the skill
                    skillsToAdd.includes(o.uri) ? undefined : getLocalizedText(o.kuvaus)
                  }
                  screenReaderTooltip={t('description-for', { description: getLocalizedText(o.kuvaus) })}
                  variant="selectable"
                  sourceType="koulutus"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 w-full sm:mt-8">
        <h2 id={addedTagsId} className="font-arial text-heading-3-mobile sm:text-heading-3">
          {t('profile.my-goals.selected-competences')}
        </h2>
        <div ref={selectedTagsContainerRef}>
          {valitutOsaamiset.length === 0 && (
            <EmptyState text={t('profile.my-goals.no-chosen-competences')} testId="plan-competences-empty-state" />
          )}
          {valitutOsaamiset.length > 0 && (
            <>
              <p className="mb-4 font-arial text-body-sm text-secondary-gray">
                {t('profile.my-goals.remove-competence-description')}
              </p>
              <div className="h-[154px] max-h-[228px] min-h-8 overflow-y-auto sm:max-h-[25dvh]">
                <ul
                  ref={selectedTagsRef}
                  className="flex flex-wrap gap-3 p-1"
                  aria-labelledby={addedTagsId}
                  onKeyDown={handleSelectedTagsKeyboardNavigation}
                >
                  <AddedTags
                    osaamiset={valitutOsaamiset.map((o) => ({ id: o.uri, nimi: o.nimi, kuvaus: o.kuvaus }))}
                    onClick={removeOsaaminenById}
                    lahdetyyppi="KOULUTUS"
                    useAnimations={!reduceMotion}
                  />
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectCompetencesStep;
