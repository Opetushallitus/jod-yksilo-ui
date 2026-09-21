import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

import { Checkbox } from '@jod/design-system';

import { LangCode } from '@/i18n/config.ts';
import { useToolStore } from '@/stores/useToolStore';
import { getCodesetItems } from '@/utils/codes/codes.ts';

/**
 * The top level sections of the active toimiala classification, as [code, localized name].
 * Read from the codeset so that the list follows whichever version is active: TOL 2008 has
 * 'X' (Toimiala tuntematon) and TOL 2025 does not, and TOL 2025 has an extra section.
 */
const getToimialaSections = async (lang: LangCode): Promise<[string, string][]> => {
  const items = await getCodesetItems('toimiala', lang).catch(() => []);

  return items
    .filter((item) => item.level === 1)
    .map((item): [string, string] => [item.code, item.classificationItemNames.find((n) => n.lang === lang)?.name ?? ''])
    .filter(([, name]) => name !== '')
    .sort((a, b) => a[1].localeCompare(b[1], lang));
};

export const FilterToimiala = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const [toimialat, setToimialat] = React.useState<[string, string][]>([]);
  const { filter, setFilter, addToArray } = useToolStore(
    useShallow((state) => ({
      filter: state.filters.toimialat,
      setFilter: state.setArrayFilter,
      addToArray: state.addToArray,
    })),
  );
  const onFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = event.target.value;
    if (!filter.includes(newFilter)) {
      //when adding filter, also select the TYOMAHDOLLISUUS opportunity type
      addToArray('opportunityType', 'TYOMAHDOLLISUUS');
    }
    setFilter('toimialat', newFilter);
  };

  React.useEffect(() => {
    void getToimialaSections(language as LangCode).then(setToimialat);
  }, [language]);

  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="sr-only mb-5 text-heading-4-mobile sm:text-heading-4">{t('show')}</legend>
      {toimialat.map(([code, name]) => (
        <Checkbox
          key={code}
          ariaLabel={name}
          className="font-poppins!"
          checked={filter.includes(code)}
          label={name}
          name={code}
          onChange={onFilterChange}
          value={code}
          testId="toimiala-filter"
        />
      ))}
    </fieldset>
  );
};
