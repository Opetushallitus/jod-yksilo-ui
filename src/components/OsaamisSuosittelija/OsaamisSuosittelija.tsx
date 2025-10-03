import { client } from '@/api/client';
import { osaamiset } from '@/api/osaamiset';
import type { components } from '@/api/schema';
import AddedTags from '@/components/OsaamisSuosittelija/AddedTags';
import { ESCO_SKILL_PREFIX, LIMITS, OSAAMINEN_COLOR_MAP } from '@/constants';
import { useDebounceState } from '@/hooks/useDebounceState';
import type { OsaaminenLahdeTyyppi } from '@/routes/types';
import { getLocalizedText } from '@/utils';
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
}: OsaamisSuosittelijaProps) => {
  const { i18n, t } = useTranslation();
  const [debouncedTaitosi, taitosi, setTaitosi] = useDebounceState('', 500);
  const [ehdotetutOsaamiset, setEhdotetutOsaamiset] = React.useState<Osaaminen[]>([]);
  const [filteredEhdotetutOsaamiset, setFilteredEhdotetutOsaamiset] = React.useState<Osaaminen[]>([]);

  const abortController = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    abortController.current?.abort();
    abortController.current = new AbortController();

    const fetchCompetences = async (value: string) => {
      try {
        const ehdotus = await client.POST('/api/ehdotus/osaamiset', {
          body: { [i18n.language]: value },
          signal: abortController.current?.signal,
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
            abortController.current?.signal,
          ),
        );
      } catch (error) {
        // Ignore abort errors
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          throw error;
        }
      }
    };

    // Do not fetch if the input is empty
    if (debouncedTaitosi?.length > 0) {
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

  const removeOsaaminenById = (id: string) => () => {
    onChange(value.filter((val) => val.id !== id));
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

  const translationKey = React.useMemo(() => (mode === 'osaamiset' ? 'competence' : 'interest'), [mode]);

  return (
    <>
      <div className="mb-6">
        <Textarea
          placeholder={textareaPlaceholder()}
          value={taitosi}
          hideLabel={hideTextAreaLabel as false} // Weird hack for TypeScript, label and hideLabel props don't play along well.
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setTaitosi(event.target.value)}
          rows={2}
          maxLength={LIMITS.TEXTAREA}
          label={textAreaLabel()}
          className={tc(['bg-bg-gray-2-25! placeholder:text-body-sm', textAreaClassName])}
        />
      </div>
      <div className="mb-6 flex flex-col">
        <div
          className={tc([
            'sm:text-heading-4 sm:font-arial text-heading-4-mobile font-bold sticky top-0',
            tagHeadingClassName,
          ])}
        >
          <span>{mode === 'osaamiset' ? t('proposed-competences') : t('proposed-interests')}</span>
          {filteredEhdotetutOsaamiset.length > 0 && (
            <div className="font-arial text-body-sm text-secondary-gray mb-4">
              {t(`osaamissuosittelija.${translationKey}.add`)}
            </div>
          )}
        </div>

        <div className="mb-6 overflow-y-auto max-h-[228px]">
          {filteredEhdotetutOsaamiset.length > 0 ? (
            <ul className="flex flex-wrap gap-3">
              {filteredEhdotetutOsaamiset.map((ehdotettuOsaaminen) => (
                <li key={ehdotettuOsaaminen.id}>
                  <Tag
                    label={getLocalizedText(ehdotettuOsaaminen.nimi)}
                    tooltip={getLocalizedText(ehdotettuOsaaminen.kuvaus)}
                    sourceType={
                      mode === 'osaamiset' ? OSAAMINEN_COLOR_MAP[sourceType] : OSAAMINEN_COLOR_MAP['KIINNOSTUS']
                    }
                    onClick={() => {
                      if (ehdotettuOsaaminen.id && value.find((val) => val.id === ehdotettuOsaaminen.id)) {
                        return; // Prevent adding duplicates by rapid clicking
                      }

                      onChange([
                        ...value,
                        {
                          id: ehdotettuOsaaminen.id,
                          nimi: ehdotettuOsaaminen.nimi,
                          kuvaus: ehdotettuOsaaminen.kuvaus,
                          tyyppi: sourceType,
                        },
                      ]);
                    }}
                    variant="selectable"
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4">
              <EmptyState text={t(`osaamissuosittelija.${translationKey}.none-proposed`)} />
            </div>
          )}
        </div>

        {!hideSelected && (
          <>
            <div
              className={tc([
                'sm:text-heading-4 sm:font-arial text-heading-4-mobile font-bold sticky top-0',
                tagHeadingClassName,
              ])}
            >
              <span>{mode === 'osaamiset' ? t('competences-of-your-choice') : t('interests-of-your-choice')}</span>
              {value.length > 0 && (
                <div className="font-arial text-body-sm text-secondary-gray mb-4">
                  {t(`osaamissuosittelija.${translationKey}.remove`)}
                </div>
              )}
            </div>

            <div className="overflow-y-auto max-h-[228px]">
              {value.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  <AddedTags
                    osaamiset={value}
                    onClick={removeOsaaminenById}
                    lahdetyyppi={mode === 'osaamiset' ? 'MUU_OSAAMINEN' : 'KIINNOSTUS'}
                  />
                </div>
              ) : (
                <div className="mt-4">
                  <EmptyState text={t(`osaamissuosittelija.${translationKey}.none-selected`)} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};
