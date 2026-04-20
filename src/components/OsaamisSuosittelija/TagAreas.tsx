import { OSAAMINEN_COLOR_MAP } from '@/constants';
import { useArrowKeyControls } from '@/hooks/useArrowKeyControls';
import { getLocalizedText } from '@/utils';
import { animateElementToTarget } from '@/utils/animations';
import { cx, EmptyState, Tag } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AddedTags from './AddedTags';
import type { OsaaminenValue, OsaamisSuosittelijaProps } from './OsaamisSuosittelija';

interface TagAreasProps {
  ehdotetutOsaamiset: OsaaminenValue[];
  hideSelected?: OsaamisSuosittelijaProps['hideSelected'];
  isTagSpacing?: OsaamisSuosittelijaProps['isTagSpacing'];
  mode: OsaamisSuosittelijaProps['mode'];
  sourceType: OsaamisSuosittelijaProps['sourceType'];
  tagHeadingClassName?: OsaamisSuosittelijaProps['tagHeadingClassName'];
  tagHeadingLevel: 'h3' | 'h4';
  useAnimations?: OsaamisSuosittelijaProps['useAnimations'];
  value: OsaamisSuosittelijaProps['value'];
  onChange: OsaamisSuosittelijaProps['onChange'];
  setResultChangeReason: (reason: 'user' | 'fetch') => void;
}
export const TagAreas = ({
  ehdotetutOsaamiset,
  hideSelected,
  isTagSpacing,
  mode = 'osaamiset',
  sourceType = 'KARTOITETTU',
  tagHeadingClassName,
  tagHeadingLevel,
  useAnimations,
  value = [],
  onChange,
  setResultChangeReason,
}: TagAreasProps) => {
  const { t } = useTranslation();
  const suggestedTagsId = React.useId();
  const addedTagsId = React.useId();
  const selectedTagsContainerRef = React.useRef<HTMLDivElement>(null); // For animation target
  const [skillsToAdd, setSkillsToAdd] = React.useState<string[]>([]);

  const {
    ref: suggestedTagsRef,
    handleKeyDown: handleSuggestedTagsKeyboardNavigation,
    setLastClickedIndex: setLastSuggestedTagClickedIndex,
  } = useArrowKeyControls(ehdotetutOsaamiset);

  const {
    ref: selectedTagsRef,
    handleKeyDown: handleSelectedTagsKeyboardNavigation,
    setLastClickedIndex: setLastSelectedTagClickedIndex,
  } = useArrowKeyControls(value);

  const removeOsaaminenById = React.useCallback(
    (ids: string[]) => () => {
      // Assume that last clicked osaaminen is the first one on the list
      const id = ids[0];
      const indexInValue = value.findIndex((val) => val.id === id);

      setLastSelectedTagClickedIndex(indexInValue);
      const valueWithoutRemoved = value.filter((val) => !ids.includes(val.id));
      onChange(valueWithoutRemoved);
      setResultChangeReason('user');
    },
    [value, setLastSelectedTagClickedIndex, onChange, setResultChangeReason],
  );

  const Title = tagHeadingLevel;

  return (
    <>
      <div className={cx(['sticky top-0 bg-bg-gray text-primary-gray', tagHeadingClassName])}>
        <Title id={suggestedTagsId} className="text-heading-4-mobile sm:text-heading-4">
          {mode === 'osaamiset' ? t('proposed-competences') : t('proposed-interests')}
        </Title>
        {ehdotetutOsaamiset.length > 0 && (
          <div className="font-arial text-body-sm text-secondary-gray mb-4">
            {mode === 'osaamiset' ? t(`osaamissuosittelija.competence.add`) : t(`osaamissuosittelija.interest.add`)}
          </div>
        )}
      </div>
      <div
        className={cx(
          'overflow-y-auto max-h-[228px]',
          isTagSpacing ? 'min-h-8 h-[100px] sm:max-h-[25dvh] mb-4' : 'mb-6',
        )}
      >
        {ehdotetutOsaamiset.length > 0 ? (
          // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
          <ul
            ref={suggestedTagsRef}
            className="flex flex-wrap gap-3 p-1"
            data-testid="osaamissuosittelija-suggested-competences"
            role="group"
            onKeyDown={handleSuggestedTagsKeyboardNavigation}
            aria-labelledby={suggestedTagsId}
          >
            {ehdotetutOsaamiset.map((ehdotettuOsaaminen, index) => (
              <li key={ehdotettuOsaaminen.id} className="max-w-full">
                <Tag
                  label={getLocalizedText(ehdotettuOsaaminen.nimi)}
                  tooltip={
                    // Do not show tooltip if user has clicked to add the skill
                    skillsToAdd.includes(ehdotettuOsaaminen.id)
                      ? undefined
                      : getLocalizedText(ehdotettuOsaaminen.kuvaus)
                  }
                  screenReaderTooltip={t('description-for', {
                    description: getLocalizedText(ehdotettuOsaaminen.kuvaus),
                  })}
                  sourceType={
                    mode === 'osaamiset' ? OSAAMINEN_COLOR_MAP[sourceType] : OSAAMINEN_COLOR_MAP['KIINNOSTUS']
                  }
                  onClick={(e) => {
                    if (ehdotettuOsaaminen.id && value.find((val) => val.id === ehdotettuOsaaminen.id)) {
                      return; // Prevent adding duplicates by rapid clicking
                    }

                    setResultChangeReason('user');
                    setLastSuggestedTagClickedIndex(index);
                    skillsToAdd.push(ehdotettuOsaaminen.id);

                    // Call onChange before animation, otherwise only the first value will be added when selecting competences rapidly.
                    // To compensate, animation delay is added in AddedTags component.
                    onChange([
                      {
                        id: ehdotettuOsaaminen.id,
                        nimi: ehdotettuOsaaminen.nimi,
                        kuvaus: ehdotettuOsaaminen.kuvaus,
                        tyyppi: sourceType,
                      },
                      ...value,
                    ]);

                    if (useAnimations) {
                      animateElementToTarget(e.currentTarget, selectedTagsContainerRef.current!, () => {
                        // eslint-disable-next-line sonarjs/no-nested-functions
                        setSkillsToAdd((prev) => prev.filter((id) => id !== ehdotettuOsaaminen.id));
                      });
                    }
                  }}
                  variant="selectable"
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4" data-testid="osaamissuosittelija-suggested-competences-empty">
            <EmptyState
              text={
                mode === 'osaamiset'
                  ? t(`osaamissuosittelija.competence.none-proposed`)
                  : t(`osaamissuosittelija.interest.none-proposed`)
              }
            />
          </div>
        )}
      </div>

      {!hideSelected && (
        <>
          <div className={cx(['sticky top-0 bg-bg-gray text-primary-gray', tagHeadingClassName])}>
            <Title id={addedTagsId} className="text-heading-4-mobile sm:text-heading-4">
              {mode === 'osaamiset' ? t('competences-of-your-choice') : t('interests-of-your-choice')}
            </Title>
            {value.length > 0 && (
              <div className="font-arial text-body-sm text-secondary-gray mb-4">
                {mode === 'osaamiset'
                  ? t(`osaamissuosittelija.competence.remove`)
                  : t(`osaamissuosittelija.interest.remove`)}
              </div>
            )}
          </div>

          <div
            className={cx('overflow-y-auto max-h-[228px]', isTagSpacing && 'min-h-8 h-[100px] sm:max-h-[25dvh]')}
            ref={selectedTagsContainerRef}
          >
            {value.length > 0 ? (
              // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
              <ul
                className="flex flex-wrap gap-3 p-1"
                data-testid="osaamissuosittelija-selected-competences"
                role="group"
                onKeyDown={handleSelectedTagsKeyboardNavigation}
                ref={selectedTagsRef}
                aria-labelledby={addedTagsId}
              >
                <AddedTags
                  osaamiset={value}
                  onClick={removeOsaaminenById}
                  lahdetyyppi={mode === 'osaamiset' ? sourceType : 'KIINNOSTUS'}
                  useAnimations={useAnimations}
                />
              </ul>
            ) : (
              <div className="mt-4" data-testid="osaamissuosittelija-selected-competences-empty">
                <EmptyState
                  text={
                    mode === 'osaamiset'
                      ? t(`osaamissuosittelija.competence.none-selected`)
                      : t(`osaamissuosittelija.interest.none-selected`)
                  }
                />
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};
