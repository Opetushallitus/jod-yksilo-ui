import type { components } from '@/api/schema';
import { getLocalizedText } from '@/utils';
import { EmptyState, Tag } from '@jod/design-system';
import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { addPlanStore } from '../store/addPlanStore';
import type { OmaSuunnitelmaForm } from './AddOrEditCustomPlanModal';

const SelectCompetencesStep = () => {
  const { t } = useTranslation();
  const vaaditutOsaamiset = addPlanStore((state) => state.vaaditutOsaamiset);
  const requiredTagsId = React.useId();
  const addedTagsId = React.useId();
  const requiredTagsRef = React.useRef<HTMLUListElement>(null);
  const selectedTagsRef = React.useRef<HTMLUListElement>(null);
  const [filteredVaaditutOsaamiset, setFilteredVaaditutOsaamiset] = React.useState<
    components['schemas']['OsaaminenDto'][]
  >([]);
  const lastClickedIndexRef = React.useRef<{ index: number; group: 'required' | 'selected' } | null>(null);

  const { control } = useFormContext<OmaSuunnitelmaForm>();
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

  const handleKeyboardNavigation = (event: React.KeyboardEvent<HTMLUListElement>, items: readonly unknown[]) => {
    if (items.length === 0) {
      return;
    }

    const currentList = event.currentTarget;
    const buttons = Array.from(currentList.querySelectorAll('button'));

    if (buttons.length === 0) {
      return;
    }

    const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
    let nextIndex = -1;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % buttons.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        nextIndex = currentIndex === -1 ? buttons.length - 1 : (currentIndex - 1 + buttons.length) % buttons.length;
        break;
      default:
        return;
    }

    if (nextIndex !== -1) {
      // Update tabindex for roving tabindex pattern
      buttons.forEach((button, index) => {
        button.setAttribute('tabindex', index === nextIndex ? '0' : '-1');
      });
      buttons[nextIndex]?.focus();
    }
  };

  // Set roving tabindex for required tags
  React.useEffect(() => {
    if (requiredTagsRef.current) {
      const buttons = requiredTagsRef.current.querySelectorAll('button');
      buttons.forEach((button, index) => {
        button.setAttribute('tabindex', index === 0 ? '0' : '-1');
      });

      // Focus previous button after adding a competence
      if (lastClickedIndexRef.current?.group === 'required' && buttons.length > 0) {
        // If clicked was first (index 0), focus the new first (still 0)
        // Otherwise focus the previous one (index - 1)
        const prevIndex =
          lastClickedIndexRef.current.index === 0 ? 0 : Math.max(0, lastClickedIndexRef.current.index - 1);
        const prevButton = buttons[prevIndex];
        prevButton?.focus();
        lastClickedIndexRef.current = null;
      }
    }
  }, [filteredVaaditutOsaamiset]);

  // Set roving tabindex for selected tags
  React.useEffect(() => {
    if (selectedTagsRef.current) {
      const buttons = selectedTagsRef.current.querySelectorAll('button');
      buttons.forEach((button, index) => {
        button.setAttribute('tabindex', index === 0 ? '0' : '-1');
      });

      // Focus previous button after removing a competence
      if (lastClickedIndexRef.current?.group === 'selected' && buttons.length > 0) {
        // If removed was first (index 0), focus the new first (still 0)
        // Otherwise focus the previous one (index - 1)
        const prevIndex =
          lastClickedIndexRef.current.index === 0 ? 0 : Math.max(0, lastClickedIndexRef.current.index - 1);
        const prevButton = buttons[prevIndex];
        prevButton?.focus();
        lastClickedIndexRef.current = null;
      }
    }
  }, [valitutOsaamiset]);

  return (
    <div className="overflow-y-auto w-full">
      <p className="font-arial mb-6">{t('profile.my-goals.custom-plan-competences-description')}</p>

      <div className="sm:mt-6 w-full">
        <div className="sm:text-heading-4 text-heading-4-mobile font-bold sticky top-0 bg-bg-gray font-arial">
          <h2 id={requiredTagsId} className="sm:text-heading-3 text-heading-3-mobile">
            {t('profile.my-goals.required-competences')}
          </h2>
          <p className="text-secondary-gray text-body-sm font-arial mb-4">
            {t('profile.my-goals.add-competence-description')}
          </p>
        </div>
        <div className="overflow-y-auto max-h-[228px] min-h-8 h-[154px] sm:max-h-[25dvh] mb-4">
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
          <ul
            ref={requiredTagsRef}
            className="flex flex-wrap gap-3 p-1"
            role="group"
            aria-labelledby={requiredTagsId}
            onKeyDown={(e) => handleKeyboardNavigation(e, filteredVaaditutOsaamiset)}
          >
            {filteredVaaditutOsaamiset.map((o) => (
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
      </div>

      <div className="sm:mt-8 w-full mt-6">
        <h2 id={addedTagsId} className="font-arial sm:text-heading-3 text-heading-3-mobile">
          {t('profile.my-goals.selected-competences')}
        </h2>
        {valitutOsaamiset.length === 0 && (
          <EmptyState text={t('profile.my-goals.no-chosen-competences')} testId="plan-competences-empty-state" />
        )}
        {valitutOsaamiset.length > 0 && (
          <>
            <p className="text-secondary-gray text-body-sm font-arial mb-4">
              {t('profile.my-goals.remove-competence-description')}
            </p>
            <div className="overflow-y-auto max-h-[228px] min-h-8 h-[154px] sm:max-h-[25dvh]">
              <ul ref={selectedTagsRef} className="flex flex-wrap gap-3 p-1" role="group" aria-labelledby={addedTagsId}>
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
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SelectCompetencesStep;
