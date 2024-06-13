import { client } from '@/api/client';
import { useAuth } from '@/hooks/useAuth';
import { type RootLoaderData } from '@/routes/Root/loader';
import { Tag, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type OsaaminenValue = Pick<Osaaminen, 'id' | 'nimi'>;

interface OsaamisSuosittelijaProps {
  /** Description text that is used to search for competences */
  description: string;
  /** Callback that handles data on change */
  onChange: (values: OsaaminenValue[]) => void;
  /** Initial values */
  value?: OsaaminenValue[];
}
export const OsaamisSuosittelija = ({ description, value = [], onChange }: OsaamisSuosittelijaProps) => {
  const { t } = useTranslation();
  const { sm } = useMediaQueries();
  const ehdotetutOsaamisetId = React.useId();
  const valitsemasiOsaamisetId = React.useId();
  const { csrf } = useAuth() as { csrf: NonNullable<RootLoaderData['csrf']> };
  const [ehdotetutOsaamiset, setEhdotetutOsaamiset] = React.useState<Osaaminen[]>([]);
  const [filteredEhdotetutOsaamiset, setFilteredEhdotetutOsaamiset] = React.useState<Osaaminen[]>([]);

  const abortController = React.useRef<AbortController>();

  React.useEffect(() => {
    abortController.current?.abort();
    abortController.current = new AbortController();

    const fetchCompetences = async (kuvaus: string) => {
      try {
        const { data } = (await client.POST('/api/ehdotus/osaamiset', {
          headers: {
            'Content-Type': 'application/json',
            [csrf.headerName]: csrf.token,
          },
          body: { kuvaus },
          signal: abortController.current?.signal,
        })) as { data: Osaaminen[] };
        setEhdotetutOsaamiset([...data]);
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
  }, [description, csrf]);

  React.useEffect(() => {
    setFilteredEhdotetutOsaamiset([
      ...ehdotetutOsaamiset.filter((osaaminen) => value.find((val) => val.id === osaaminen.id) === undefined),
    ]);
  }, [ehdotetutOsaamiset, value]);

  return (
    <div className={`mb-6 ${sm ? 'grid grid-cols-3 gap-x-5' : 'flex flex-col'}`}>
      <div className={`${sm ? 'col-span-1' : 'order-1'} flex items-end`}>
        <label htmlFor={ehdotetutOsaamisetId} className="mb-4 inline-block align-top text-form-label text-primary-gray">
          {t('work-history.proposed-competences')}
        </label>
      </div>
      <div className={`${sm ? 'col-span-2' : 'order-3'} flex items-end`}>
        <label
          htmlFor={valitsemasiOsaamisetId}
          className="mb-4 inline-block align-top text-form-label text-primary-gray"
        >
          {t('work-history.competences-of-your-choice')}
        </label>
      </div>
      <div
        className={`${sm ? 'col-span-1' : 'order-2 mb-6'} h-[400px] overflow-y-auto rounded-[10px] border-[5px] border-solid border-border-gray p-5`}
      >
        <div id={ehdotetutOsaamisetId} className="flex flex-wrap gap-3">
          {filteredEhdotetutOsaamiset.map((ehdotettuOsaaminen) => (
            <Tag
              key={ehdotettuOsaaminen.id}
              label={ehdotettuOsaaminen.nimi ?? ''}
              onClick={() => {
                onChange([...value, { id: ehdotettuOsaaminen.id, nimi: ehdotettuOsaaminen.nimi }]);
              }}
              variant="selectable"
            />
          ))}
        </div>
      </div>
      <div
        className={`${sm ? 'col-span-2' : 'order-4'} h-[400px] overflow-y-auto rounded-[10px] border-[5px] border-solid border-border-gray p-5`}
      >
        <div id={valitsemasiOsaamisetId} className="flex flex-wrap gap-3">
          {value.map((val) => (
            <Tag
              key={val.id}
              label={val.nimi ?? ''}
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
