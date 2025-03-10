import { client } from '@/api/client';
import { osaamiset } from '@/api/osaamiset';
import { components } from '@/api/schema';
import { ESCO_SKILL_PREFIX, OSAAMINEN_COLOR_MAP } from '@/constants';
import { useDebounceState } from '@/hooks/useDebounceState';
import { getLocalizedText, removeDuplicates } from '@/utils';
import { Tag, Textarea, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type OsaaminenLahdeTyyppi = components['schemas']['OsaamisenLahdeDto']['tyyppi'] | 'KIINNOSTUS' | 'KARTOITETTU';
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
  /** Should display skills by categories. False by default. */
  categorized?: boolean;
  /** Mode that tells which translations to use and what color to use for tags */
  mode?: OsaamisSuosittelijaMode;
  /** Additional class name */
  className?: string;
  /** Placeholder text for the textarea */
  placeholder?: string;
}

type CategorizedValue = Record<OsaaminenLahdeTyyppi, OsaaminenValue[]>;

export const OsaamisSuosittelija = ({
  value = [],
  onChange,
  sourceType = 'KARTOITETTU',
  categorized = false,
  mode = 'osaamiset',
  className = '',
  placeholder,
}: OsaamisSuosittelijaProps) => {
  const { i18n, t } = useTranslation();
  const { sm } = useMediaQueries();
  const [debouncedTaitosi, taitosi, setTaitosi] = useDebounceState('', 500);
  const [ehdotetutOsaamiset, setEhdotetutOsaamiset] = React.useState<Osaaminen[]>([]);
  const [filteredEhdotetutOsaamiset, setFilteredEhdotetutOsaamiset] = React.useState<Osaaminen[]>([]);
  const [categorizedValue, setCategorizedValue] = React.useState<CategorizedValue>({
    MUU_OSAAMINEN: [],
    KOULUTUS: [],
    TOIMENKUVA: [],
    PATEVYYS: [],
    KIINNOSTUS: [],
    KARTOITETTU: [],
  });
  const categoryOrder = ['KARTOITETTU', 'MUU_OSAAMINEN', 'TOIMENKUVA', 'KOULUTUS', 'PATEVYYS', 'KIINNOSTUS'] as const;
  const sortCategories = (a: OsaaminenLahdeTyyppi, b: OsaaminenLahdeTyyppi) =>
    categoryOrder.indexOf(a) - categoryOrder.indexOf(b);

  React.useEffect(() => {
    setCategorizedValue({
      KARTOITETTU: value.filter((val) => val.tyyppi === 'KARTOITETTU'),
      MUU_OSAAMINEN: value.filter((val) => val.tyyppi === 'MUU_OSAAMINEN'),
      PATEVYYS: value.filter((val) => val.tyyppi === 'PATEVYYS'),
      KOULUTUS: value.filter((val) => val.tyyppi === 'KOULUTUS'),
      TOIMENKUVA: value.filter((val) => val.tyyppi === 'TOIMENKUVA'),
      KIINNOSTUS: value.filter((val) => val.tyyppi === 'KIINNOSTUS'),
    });
  }, [value]);

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

  const getTag = (osaaminen: OsaaminenValue) => (
    <Tag
      key={osaaminen.id}
      label={getLocalizedText(osaaminen.nimi)}
      title={getLocalizedText(osaaminen.kuvaus)}
      sourceType={
        mode === 'osaamiset' ? OSAAMINEN_COLOR_MAP[osaaminen.tyyppi ?? sourceType] : OSAAMINEN_COLOR_MAP['KIINNOSTUS']
      }
      onClick={() => {
        onChange(value.filter((selectedValue) => selectedValue.id !== osaaminen.id));
      }}
      variant="added"
    />
  );

  const textareaPlaceholder = () => {
    if (placeholder) {
      return placeholder;
    } else if (mode === 'osaamiset') {
      return t('tool.my-own-data.competences.textarea-placeholder');
    } else {
      return t('osaamissuosittelija.interest.textarea-placeholder');
    }
  };

  return (
    <>
      <div className="mb-6">
        <Textarea
          placeholder={textareaPlaceholder()}
          value={taitosi}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setTaitosi(event.target.value)}
          rows={2}
          maxLength={10000}
          hideLabel
          className={className}
        />
      </div>
      <div className="mb-6 flex flex-col">
        <div className={`${sm ? 'text-heading-4 font-arial' : 'text-heading-4-mobile'} font-bold mb-2`}>
          {mode === 'osaamiset' ? t('proposed-competences') : t('proposed-interests')}
        </div>
        <div className={`${sm ? 'text-body-sm font-arial' : 'text-body-sm-mobile'} mb-3`}>
          {mode === 'osaamiset' ? t('osaamissuosittelija.competence.add') : t('osaamissuosittelija.interest.add')}
        </div>
        <div
          className={`mb-6 h-[144px] overflow-y-auto rounded border border-border-gray p-5 bg-white ${className}`.trim()}
        >
          <div className="flex flex-wrap gap-3">
            {filteredEhdotetutOsaamiset.map((ehdotettuOsaaminen) => (
              <Tag
                key={ehdotettuOsaaminen.id}
                label={getLocalizedText(ehdotettuOsaaminen.nimi)}
                title={getLocalizedText(ehdotettuOsaaminen.kuvaus)}
                sourceType={mode === 'osaamiset' ? OSAAMINEN_COLOR_MAP[sourceType] : OSAAMINEN_COLOR_MAP['KIINNOSTUS']}
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
            ))}
          </div>
        </div>

        <div className={`${sm ? 'text-heading-4 font-arial' : 'text-heading-4-mobile'} font-bold mb-2`}>
          {mode === 'osaamiset' ? t('competences-of-your-choice') : t('interests-of-your-choice')}
        </div>
        <div className={`${sm ? 'text-body-sm font-arial' : 'text-body-sm-mobile'} mb-3`}>
          {mode === 'osaamiset' ? t('osaamissuosittelija.competence.remove') : t('osaamissuosittelija.interest.remove')}
        </div>
        <div
          className={`min-h-[144px] overflow-y-auto rounded border border-border-gray p-5 bg-white ${className}`.trim()}
        >
          <div className="flex flex-wrap gap-3">
            {categorized ? (
              <div className="flex-col">
                <div className="text-heading-4 uppercase mb-3">
                  {mode === 'osaamiset' ? t('mapped-competences') : t('mapped-interests')}
                </div>
                <div className="flex flex-wrap gap-3 mb-4 min-h-[28px]">{categorizedValue.KARTOITETTU.map(getTag)}</div>

                <div className="text-heading-4 uppercase mb-3">
                  {mode === 'osaamiset' ? t('competences-from-profile') : t('interests-from-profile')}
                </div>

                <div className="min-h-[28px]">
                  {(Object.entries(categorizedValue) as [OsaaminenLahdeTyyppi, OsaaminenValue[]][])
                    .filter(([skillType, skills]) => skillType !== 'KARTOITETTU' && skills.length > 0)
                    .sort(([a], [b]) => sortCategories(a, b))
                    .map(([skillType, skills]) => (
                      <React.Fragment key={skillType}>
                        {mode === 'osaamiset' && (
                          <div className="text-body-sm mb-3 uppercase">{t(`osaamissuosittelija.my-${skillType}`)}</div>
                        )}
                        <div className="flex flex-wrap gap-3 mb-3">{removeDuplicates(skills, 'id').map(getTag)}</div>
                      </React.Fragment>
                    ))}
                </div>
              </div>
            ) : (
              value.map(getTag)
            )}
          </div>
        </div>
      </div>
    </>
  );
};
