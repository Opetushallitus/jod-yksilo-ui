import { client } from '@/api/client';
import { osaamiset } from '@/api/osaamiset';
import type { components } from '@/api/schema';
import AddedTags from '@/components/OsaamisSuosittelija/AddedTags';
import { ESCO_SKILL_PREFIX, LIMITS, OSAAMINEN_COLOR_MAP } from '@/constants';
import { useDebounceState } from '@/hooks/useDebounceState';
import type { OsaaminenLahdeTyyppi } from '@/routes/types';
import { getLocalizedText } from '@/utils';
import { animateElementToTarget } from '@/utils/animations';
import { EmptyState, Tag, Textarea, tidyClasses as tc } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
export interface Osaaminen {
  id: string;
  nimi: components['schemas']['LokalisoituTeksti'];
  kuvaus: components['schemas']['LokalisoituTeksti'];
  tyyppi?: OsaaminenLahdeTyyppi;
  osuvuus: number;
}

export type OsaaminenValue = Pick<Osaaminen, 'id' | 'nimi' | 'kuvaus' | 'tyyppi'>;

type OsaamisSuosittelijaMode = 'osaamiset' | 'kiinnostukset';

interface OsaamisSuosittelijaProps {
  /** Callback that handles data on change */
  onChange: (values: OsaaminenValue[]) => void;
  /** Initial values */
  value?: OsaaminenValue[];
  /** Type of the source */
  sourceType?: Osaaminen['tyyppi'];
  /** Mode that tells which translations to use and what color to use for tags */
  mode?: OsaamisSuosittelijaMode;
  /** Additional class name for the text area input */
  textAreaClassName?: string;
  /** Additional class name for the tag area headings (proposed & selected tags) */
  tagHeadingClassName?: string;
  /** Placeholder text for the textarea */
  placeholder?: string;
  /** Should the selected competences be displayed */
  hideSelected?: boolean;
  /** Should the text area be displayed */
  hideTextAreaLabel?: boolean;
  /** Should animations be used when adding/removing tags */
  useAnimations?: boolean;
}

export const OsaamisSuosittelija = ({
  value = [],
  onChange,
  sourceType = 'KARTOITETTU',
  mode = 'osaamiset',
  textAreaClassName = '',
  tagHeadingClassName = '',
  placeholder,
  hideSelected = false,
  hideTextAreaLabel = false,
  useAnimations = false,
}: OsaamisSuosittelijaProps) => {
  const { i18n, t } = useTranslation();
  const [debouncedTaitosi, taitosi, setTaitosi] = useDebounceState('', 500);
  const [ehdotetutOsaamiset, setEhdotetutOsaamiset] = React.useState<Osaaminen[]>([]);
  const [filteredEhdotetutOsaamiset, setFilteredEhdotetutOsaamiset] = React.useState<Osaaminen[]>([]);
  const isFetching = React.useRef(false);
  const addedTagsId = React.useId();
  const suggestedTagsId = React.useId();
  const pendingTaitosi = React.useRef<string | null>(null);
  const suggestedTagsRef = React.useRef<HTMLUListElement>(null);
  const selectedTagsRef = React.useRef<HTMLUListElement>(null);
  const selectedAreaRef = React.useRef<HTMLDivElement>(null); // For animation target
  const lastClickedIndexRef = React.useRef<{ index: number; group: 'suggested' | 'selected' } | null>(null);
  const [skillsToAdd, setSkillsToAdd] = React.useState<string[]>([]);
  const textareaContainerRef = React.useRef<HTMLDivElement>(null);

  // Scroll textarea to top when focused
  React.useEffect(() => {
    const container = textareaContainerRef.current;
    if (!container) return;

    const textarea = container.querySelector('textarea');
    if (!textarea) return;

    const handleFocus = () => {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    textarea.addEventListener('focus', handleFocus);
    return () => textarea.removeEventListener('focus', handleFocus);
  }, []);

  // Scroll textarea to top when results appear
  React.useEffect(() => {
    const container = textareaContainerRef.current;
    if (!container) return;

    const textarea = container.querySelector('textarea');
    if (!textarea) return;

    // Only scroll if textarea is focused and we have results
    if (document.activeElement === textarea && filteredEhdotetutOsaamiset.length > 0) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [filteredEhdotetutOsaamiset]);

  // Set roving tabindex for suggested tags
  React.useEffect(() => {
    if (suggestedTagsRef.current) {
      const buttons = suggestedTagsRef.current.querySelectorAll('button');
      buttons.forEach((button, index) => {
        button.setAttribute('tabindex', index === 0 ? '0' : '-1');
      });

      // Focus previous button after adding a competence
      if (lastClickedIndexRef.current?.group === 'suggested' && buttons.length > 0) {
        // If clicked was first (index 0), focus the new first (still 0)
        // Otherwise focus the previous one (index - 1)
        const prevIndex =
          lastClickedIndexRef.current.index === 0 ? 0 : Math.max(0, lastClickedIndexRef.current.index - 1);
        const prevButton = buttons[prevIndex];
        prevButton?.focus();
        lastClickedIndexRef.current = null;
      }
    }
  }, [filteredEhdotetutOsaamiset]);

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
  }, [value]);

  React.useEffect(() => {
    const fetchCompetences = async (value: string) => {
      if (isFetching.current) {
        pendingTaitosi.current = value; // Queue the latest value for next fetch
        return;
      }
      try {
        isFetching.current = true;
        const ehdotus = await client.POST('/api/ehdotus/osaamiset', {
          body: { [i18n.language]: value },
        });
        setEhdotetutOsaamiset(
          await osaamiset.combine(
            mode === 'osaamiset' ? ehdotus.data?.filter((e) => e.uri.startsWith(ESCO_SKILL_PREFIX)) : ehdotus.data,
            (e) => e.uri,
            (e, o) => {
              return {
                id: o.uri,
                nimi: o.nimi,
                kuvaus: o.kuvaus,
                osuvuus: e.osuvuus ?? 0,
              };
            },
          ),
        );
      } finally {
        isFetching.current = false;
        // If a new value was queued, fetch it now
        if (pendingTaitosi.current && pendingTaitosi.current !== value) {
          const nextValue = pendingTaitosi.current;
          pendingTaitosi.current = null;
          void fetchCompetences(nextValue);
        }
      }
    };

    // Do not fetch if the input is empty
    if (debouncedTaitosi?.length > 2) {
      void fetchCompetences(debouncedTaitosi);
    } else {
      setEhdotetutOsaamiset([]);
    }
  }, [debouncedTaitosi, i18n.language, mode]);

  React.useEffect(() => {
    setFilteredEhdotetutOsaamiset([
      ...ehdotetutOsaamiset.filter((osaaminen) => value.find((val) => val.id === osaaminen.id) === undefined),
    ]);
  }, [ehdotetutOsaamiset, value]);

  const textareaPlaceholder = () => {
    if (placeholder) {
      return placeholder;
    } else if (mode === 'osaamiset') {
      return t('tool.my-own-data.competences.textarea-placeholder');
    } else {
      return t('osaamissuosittelija.interest.textarea-placeholder');
    }
  };

  const removeOsaaminenById = React.useCallback(
    (ids: string[]) => () => {
      // Assume that last clicked osaaminen is the first one on the list
      const id = ids[0];
      lastClickedIndexRef.current = { index: value.findIndex((val) => val.id === id), group: 'selected' };
      const valueWithoutRemoved = value.filter((val) => !ids.includes(val.id));
      onChange(valueWithoutRemoved);
    },
    [onChange, value],
  );

  const textAreaLabel = () => {
    if (hideTextAreaLabel) {
      return '';
    }
    if (mode === 'osaamiset') {
      return t('osaamissuosittelija.competence.identify');
    } else {
      return t('osaamissuosittelija.interest.identify');
    }
  };

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

  return (
    <>
      <div className="mb-4" ref={textareaContainerRef}>
        <Textarea
          placeholder={textareaPlaceholder()}
          value={taitosi}
          hideLabel={hideTextAreaLabel as false} // Weird hack for TypeScript, label and hideLabel props don't play along well.
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setTaitosi(event.target.value)}
          rows={2}
          maxLength={LIMITS.TEXTAREA}
          label={textAreaLabel()}
          className={tc(['bg-bg-gray-2-25! placeholder:text-body-sm', textAreaClassName])}
          testId="osaamissuosittelija-textarea"
        />
        {debouncedTaitosi.length > 0 && taitosi.length > 2 && (
          <div className="font-arial text-secondary-gray mt-3 text-help">
            {mode === 'osaamiset'
              ? t('osaamissuosittelija.competence.search-disclaimer')
              : t('osaamissuosittelija.interest.search-disclaimer')}
          </div>
        )}
      </div>
      <div className="mb-6 flex flex-col">
        <div
          className={tc([
            'sm:text-heading-4 sm:font-arial text-heading-4-mobile font-bold sticky top-0 bg-bg-gray',
            tagHeadingClassName,
          ])}
        >
          <span id={suggestedTagsId}>{mode === 'osaamiset' ? t('proposed-competences') : t('proposed-interests')}</span>
          {filteredEhdotetutOsaamiset.length > 0 && (
            <div className="font-arial text-body-sm text-secondary-gray mb-4">
              {mode === 'osaamiset' ? t(`osaamissuosittelija.competence.add`) : t(`osaamissuosittelija.interest.add`)}
            </div>
          )}
        </div>

        <div className="mb-4 overflow-y-auto min-h-[40px] h-[100px] max-h-[228px] sm:max-h-[25dvh]">
          {filteredEhdotetutOsaamiset.length > 0 ? (
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
            <ul
              ref={suggestedTagsRef}
              className="flex flex-wrap gap-3 p-1"
              data-testid="osaamissuosittelija-suggested-competences"
              role="group"
              onKeyDown={(e) => handleKeyboardNavigation(e, filteredEhdotetutOsaamiset)}
              aria-labelledby={suggestedTagsId}
            >
              {filteredEhdotetutOsaamiset.map((ehdotettuOsaaminen, index) => (
                <li key={ehdotettuOsaaminen.id} className="max-w-full">
                  <Tag
                    label={getLocalizedText(ehdotettuOsaaminen.nimi)}
                    tooltip={
                      // Do not show tooltip if user has clicked to add the skill
                      skillsToAdd.includes(ehdotettuOsaaminen.id)
                        ? undefined
                        : getLocalizedText(ehdotettuOsaaminen.kuvaus)
                    }
                    sourceType={
                      mode === 'osaamiset' ? OSAAMINEN_COLOR_MAP[sourceType] : OSAAMINEN_COLOR_MAP['KIINNOSTUS']
                    }
                    onClick={(e) => {
                      if (ehdotettuOsaaminen.id && value.find((val) => val.id === ehdotettuOsaaminen.id)) {
                        return; // Prevent adding duplicates by rapid clicking
                      }

                      lastClickedIndexRef.current = { index, group: 'suggested' };
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
                        animateElementToTarget(e.currentTarget, selectedAreaRef.current!, () => {
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
            <div
              className={tc([
                'sm:text-heading-4 sm:font-arial text-heading-4-mobile font-bold sticky top-0 bg-bg-gray',
                tagHeadingClassName,
              ])}
            >
              <span id={addedTagsId}>
                {mode === 'osaamiset' ? t('competences-of-your-choice') : t('interests-of-your-choice')}
              </span>
              {value.length > 0 && (
                <div className="font-arial text-body-sm text-secondary-gray mb-4">
                  {mode === 'osaamiset'
                    ? t(`osaamissuosittelija.competence.remove`)
                    : t(`osaamissuosittelija.interest.remove`)}
                </div>
              )}
            </div>

            <div
              className="overflow-y-auto min-h-[40px] h-[100px] max-h-[228px] sm:max-h-[25dvh] "
              ref={selectedAreaRef}
            >
              {value.length > 0 ? (
                // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                <ul
                  ref={selectedTagsRef}
                  className="flex flex-wrap gap-3 p-1"
                  data-testid="osaamissuosittelija-selected-competences"
                  role="group"
                  onKeyDown={(e) => handleKeyboardNavigation(e, value)}
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
      </div>
    </>
  );
};
