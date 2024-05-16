import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import { client } from '@/api/client';
import { Osaaminen, type WorkHistoryForm } from './utils';
import { type RootLoaderData } from '@/routes/Root/loader';
import { Tag, useMediaQueries } from '@jod/design-system';

const ConnectCompetences = ({ tyotehtava, toimenkuva }: { tyotehtava: string; toimenkuva: number }) => {
  const { t } = useTranslation();
  const { sm } = useMediaQueries();
  const ehdotetutOsaamisetId = useId();
  const valtisemasiOsaamisetId = useId();
  const { control } = useFormContext<WorkHistoryForm>();
  const { csrf } = useAuth() as { csrf: NonNullable<RootLoaderData['csrf']> };
  const [ehdotetutOsaamiset, setEhdotetutOsaamiset] = useState<Osaaminen[]>([]);
  const [filteredEhdotetutOsaamiset, setFilteredEhdotetutOsaamiset] = useState<Osaaminen[]>([]);
  const abortController = useRef<AbortController>();

  useEffect(() => {
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
    if (tyotehtava.length > 0) {
      void fetchCompetences(tyotehtava);
    } else {
      setEhdotetutOsaamiset([]);
    }
  }, [tyotehtava, csrf]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: `toimenkuvat.${toimenkuva}.osaamiset` as 'toimenkuvat.0.osaamiset',
    keyName: 'key',
  });

  useEffect(() => {
    setFilteredEhdotetutOsaamiset([
      ...ehdotetutOsaamiset.filter((osaaminen) => fields.find((field) => field.id === osaaminen.id) === undefined),
    ]);
  }, [ehdotetutOsaamiset, fields]);

  return (
    <div className={`mb-6 ${sm ? 'grid grid-cols-3 gap-x-5' : 'flex flex-col'}`}>
      <div className={`${sm ? 'col-span-1' : 'order-1'} flex items-end`}>
        <label htmlFor={ehdotetutOsaamisetId} className="mb-4 inline-block align-top text-form-label text-primary-gray">
          {t('work-history.proposed-competences')}
        </label>
      </div>
      <div className={`${sm ? 'col-span-2' : 'order-3'} flex items-end`}>
        <label
          htmlFor={valtisemasiOsaamisetId}
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
                append({ id: ehdotettuOsaaminen.id, nimi: ehdotettuOsaaminen.nimi });
              }}
              variant="selectable"
            />
          ))}
        </div>
      </div>
      <div
        className={`${sm ? 'col-span-2' : 'order-4'} h-[400px] overflow-y-auto rounded-[10px] border-[5px] border-solid border-border-gray p-5`}
      >
        <div id={valtisemasiOsaamisetId} className="flex flex-wrap gap-3">
          {fields.map((field, index) => (
            <Tag
              key={field.key}
              label={field.nimi ?? ''}
              onClick={() => {
                remove(index);
              }}
              variant="added"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConnectCompetences;
