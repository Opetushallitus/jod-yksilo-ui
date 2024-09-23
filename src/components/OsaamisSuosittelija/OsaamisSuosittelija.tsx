import { client } from '@/api/client';
import { osaamiset } from '@/api/osaamiset';
import { components } from '@/api/schema';
import { OSAAMINEN_COLOR_MAP } from '@/constants';
import { Tag, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface Osaaminen {
  id: string;
  nimi: string;
  tyyppi?: components['schemas']['OsaamisenLahdeDto']['tyyppi'] | 'JOTAIN_MUUTA' | 'KIINNOSTUS';
  osuvuus: number;
}

export type OsaaminenValue = Pick<Osaaminen, 'id' | 'nimi' | 'tyyppi'>;

interface OsaamisSuosittelijaProps {
  /** Description text that is used to search for competences */
  description: string;
  /** Callback that handles data on change */
  onChange: (values: OsaaminenValue[]) => void;
  /** Initial values */
  value?: OsaaminenValue[];
  /** Type of the source */
  sourceType?: Osaaminen['tyyppi'];
}
export const OsaamisSuosittelija = ({
  description,
  value = [],
  onChange,
  sourceType = 'JOTAIN_MUUTA',
}: OsaamisSuosittelijaProps) => {
  const { i18n, t } = useTranslation();
  const { sm } = useMediaQueries();
  const [ehdotetutOsaamiset, setEhdotetutOsaamiset] = React.useState<Osaaminen[]>([]);
  const [filteredEhdotetutOsaamiset, setFilteredEhdotetutOsaamiset] = React.useState<Osaaminen[]>([]);

  const abortController = React.useRef<AbortController>();

  React.useEffect(() => {
    abortController.current?.abort();
    abortController.current = new AbortController();

    const fetchCompetences = async (kuvaus: string) => {
      try {
        const ehdotus = await client.POST('/api/ehdotus/osaamiset', {
          body: { [i18n.language]: kuvaus },
          signal: abortController.current?.signal,
        });
        setEhdotetutOsaamiset(
          await osaamiset.combine(
            ehdotus.data,
            (e) => e.uri,
            (e, o) => {
              return {
                id: o.uri,
                nimi: o.nimi[i18n.language],
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
    if (description?.length > 0) {
      void fetchCompetences(description);
    } else {
      setEhdotetutOsaamiset([]);
    }
  }, [description, i18n.language]);

  React.useEffect(() => {
    setFilteredEhdotetutOsaamiset([
      ...ehdotetutOsaamiset.filter((osaaminen) => value.find((val) => val.id === osaaminen.id) === undefined),
    ]);
  }, [ehdotetutOsaamiset, value]);

  return (
    <div className={`mb-6 ${sm ? 'grid grid-cols-3 gap-x-5' : 'flex flex-col'}`}>
      <div
        className={`${sm ? 'col-span-1' : 'order-2 mb-6'} h-[400px] overflow-y-auto rounded border border-border-gray p-5 bg-white`}
      >
        <div aria-label={t('work-history.proposed-competences')} className="flex flex-wrap gap-3">
          {filteredEhdotetutOsaamiset.map((ehdotettuOsaaminen) => (
            <Tag
              key={ehdotettuOsaaminen.id}
              label={ehdotettuOsaaminen.nimi ?? ''}
              sourceType={OSAAMINEN_COLOR_MAP[sourceType]}
              onClick={() => {
                onChange([...value, { id: ehdotettuOsaaminen.id, nimi: ehdotettuOsaaminen.nimi, tyyppi: sourceType }]);
              }}
              variant="selectable"
            />
          ))}
        </div>
      </div>
      <div
        className={`${sm ? 'col-span-2' : 'order-4'} h-[400px] overflow-y-auto rounded border border-border-gray p-5 bg-white`}
      >
        <div aria-label={t('work-history.competences-of-your-choice')} className="flex flex-wrap gap-3">
          {value.map((val) => (
            <Tag
              key={val.id}
              label={val.nimi ?? ''}
              sourceType={OSAAMINEN_COLOR_MAP[val.tyyppi ? val.tyyppi : sourceType]}
              onClick={() => {
                onChange(value.filter((selectedValue) => selectedValue.id !== val.id));
              }}
              variant="added"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
