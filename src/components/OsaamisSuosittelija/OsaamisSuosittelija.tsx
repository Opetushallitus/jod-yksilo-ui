import { client } from '@/api/client';
import { osaamiset } from '@/api/osaamiset';
import type { components } from '@/api/schema';
import { ESCO_SKILL_PREFIX, LIMITS } from '@/constants';
import { useDebounceState } from '@/hooks/useDebounceState';
import type { OsaaminenLahdeTyyppi } from '@/routes/types';
import { Textarea, cx, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TagAreas } from './TagAreas';
export interface Osaaminen {
  id: string;
  nimi: components['schemas']['LokalisoituTeksti'];
  kuvaus: components['schemas']['LokalisoituTeksti'];
  tyyppi?: OsaaminenLahdeTyyppi;
  osuvuus: number;
}

export type OsaaminenValue = Pick<Osaaminen, 'id' | 'nimi' | 'kuvaus' | 'tyyppi'>;
type OsaamisSuosittelijaMode = 'osaamiset' | 'kiinnostukset';

export interface OsaamisSuosittelijaProps {
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
  /** Heading level for the tag area headings (proposed & selected tags) */
  tagHeadingLevel: 'h3' | 'h4';
  /** Placeholder text for the textarea */
  placeholder?: string;
  /** Should the selected competences be displayed */
  hideSelected?: boolean;
  /** Should the text area be displayed */
  hideTextAreaLabel?: boolean;
  /** Should animations be used when adding/removing tags */
  useAnimations?: boolean;
  /** Should the textarea scroll when focused or results appear */
  scrollOnFocus?: boolean;
  /** Add spacing and height adjustments for tags. Used in wizards along with the scrollOnFocus */
  isTagSpacing?: boolean;
}

export const OsaamisSuosittelija = ({
  value = [],
  onChange,
  sourceType = 'KARTOITETTU',
  mode = 'osaamiset',
  textAreaClassName = '',
  tagHeadingClassName = '',
  tagHeadingLevel,
  placeholder,
  hideSelected = false,
  hideTextAreaLabel = false,
  useAnimations = true,
  scrollOnFocus = true,
  isTagSpacing = true,
}: OsaamisSuosittelijaProps) => {
  const { i18n, t } = useTranslation();
  const [debouncedTaitosi, taitosi, setTaitosi] = useDebounceState('', 500);
  const [ehdotetutOsaamiset, setEhdotetutOsaamiset] = React.useState<Osaaminen[]>([]);
  const [filteredEhdotetutOsaamiset, setFilteredEhdotetutOsaamiset] = React.useState<Osaaminen[]>([]);
  const [screenReaderResults, setScreenReaderResults] = React.useState('');
  const [isFetching, setIsFetching] = React.useState(false);
  const [hasFetched, setHasFetched] = React.useState(false); // To track if at least one fetch has been made, to avoid showing "0 results found" on initial render
  const [resultChangeReason, setResultChangeReason] = React.useState<'fetch' | 'user' | null>(null); // To track if the change in results was caused by either user input or fetch results. Screen reader should only announce results found after fetch, not after user filtering.
  const pendingTaitosi = React.useRef<string | null>(null);
  const textareaContainerRef = React.useRef<HTMLDivElement>(null);
  const { reduceMotion } = useMediaQueries();
  const shouldAnimate = reduceMotion ? false : useAnimations;

  // Scroll textarea to top when focused
  React.useEffect(() => {
    if (!scrollOnFocus) {
      return;
    }

    const container = textareaContainerRef.current;
    if (!container) {
      return;
    }

    const textarea = container.querySelector('textarea');
    if (!textarea) {
      return;
    }

    const handleFocus = () => {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    textarea.addEventListener('focus', handleFocus);
    return () => textarea.removeEventListener('focus', handleFocus);
  }, [scrollOnFocus]);

  // Scroll textarea to top when results appear
  React.useEffect(() => {
    if (!scrollOnFocus) {
      return;
    }

    const container = textareaContainerRef.current;
    if (!container) {
      return;
    }

    const textarea = container.querySelector('textarea');
    if (!textarea) {
      return;
    }

    // Only scroll if textarea is focused and we have results
    if (document.activeElement === textarea && filteredEhdotetutOsaamiset.length > 0) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [scrollOnFocus, filteredEhdotetutOsaamiset]);

  React.useEffect(() => {
    const fetchCompetences = async (value: string) => {
      if (isFetching) {
        pendingTaitosi.current = value; // Queue the latest value for next fetch
        return;
      }
      try {
        setIsFetching(true);
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
        setIsFetching(false);
        setHasFetched(true);
        setResultChangeReason('fetch');
        // If a new value was queued, fetch it now
        if (pendingTaitosi.current && pendingTaitosi.current !== value) {
          const nextValue = pendingTaitosi.current;
          pendingTaitosi.current = null;
          void fetchCompetences(nextValue);
        }
      }
    };

    // Do not fetch if the input less than 3 characters, but clear suggestions if there are any
    if (debouncedTaitosi?.trim()?.length > 2) {
      void fetchCompetences(debouncedTaitosi);
    } else {
      setEhdotetutOsaamiset([]);
      setHasFetched(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  React.useEffect(() => {
    setScreenReaderResults('');

    // Update the screen reader results count after a short delay to prevent announcing the previous count before the new one
    const timeout = setTimeout(() => {
      setScreenReaderResults(
        mode === 'osaamiset'
          ? t('proposed-competences-found', { count: filteredEhdotetutOsaamiset.length })
          : t('proposed-interests-found', { count: filteredEhdotetutOsaamiset.length }),
      );
    }, 500);
    return () => clearTimeout(timeout);
  }, [isFetching, mode, filteredEhdotetutOsaamiset.length, t]);

  return (
    <>
      <div aria-live="polite" role="status" className="sr-only">
        {isFetching ? t('proposals-loading') : ''}
        {hasFetched && !isFetching && resultChangeReason === 'fetch' ? screenReaderResults : ''}
      </div>
      <div className="mb-4" ref={textareaContainerRef}>
        <Textarea
          placeholder={textareaPlaceholder()}
          value={taitosi}
          hideLabel={hideTextAreaLabel as false} // Weird hack for TypeScript, label and hideLabel props don't play along well.
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setTaitosi(event.target.value)}
          rows={2}
          maxLength={LIMITS.TEXTAREA}
          label={textAreaLabel()}
          className={cx(['bg-bg-gray-2-25! placeholder:text-body-sm', textAreaClassName])}
          testId="osaamissuosittelija-textarea"
        />
        {debouncedTaitosi.trim().length > 0 && taitosi.trim().length > 2 && (
          <div className="font-arial text-secondary-gray mt-3 text-help">
            {mode === 'osaamiset'
              ? t('osaamissuosittelija.competence.search-disclaimer')
              : t('osaamissuosittelija.interest.search-disclaimer')}
          </div>
        )}
      </div>
      <div className="mb-6 flex flex-col">
        <TagAreas
          mode={mode}
          value={value}
          sourceType={sourceType}
          onChange={onChange}
          ehdotetutOsaamiset={filteredEhdotetutOsaamiset}
          isTagSpacing={isTagSpacing}
          useAnimations={shouldAnimate}
          setResultChangeReason={setResultChangeReason}
          hideSelected={hideSelected}
          tagHeadingClassName={tagHeadingClassName}
          tagHeadingLevel={tagHeadingLevel}
        />
      </div>
    </>
  );
};
