import { LangCode } from '@/i18n/config';
import { useToolStore } from '@/stores/useToolStore';
import { maakuntaKoodit, translateMaakunta } from '@/utils/maakuntaUtils.ts';
import { Checkbox } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

export const FilterSijainti = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const [maakunnatList, setMaakunnatList] = React.useState<[string, string][]>([]);
  const { filter, setFilter } = useToolStore(
    useShallow((state) => ({
      filter: state.filters.region,
      setFilter: state.setArrayFilter,
    })),
  );
  const onFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = event.target.value;
    setFilter('region', newFilter);
  };

  React.useEffect(() => {
    Promise.all(maakuntaKoodit.map((maakunta) => translateMaakunta(maakunta, language as LangCode))).then(
      (translatedMaakunnat) => {
        translatedMaakunnat.sort((a, b) => a[1].localeCompare(b[1]));
        setMaakunnatList(translatedMaakunnat);
      },
    );
  }, [language]);

  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="text-heading-4-mobile sm:text-heading-4 mb-5 sr-only">{t('show')}</legend>
      {maakunnatList.map((maakunta) => (
        <Checkbox
          key={maakunta[1]}
          ariaLabel={maakunta[1]}
          className="font-poppins!"
          checked={filter.includes(maakunta[0])}
          label={maakunta[1]}
          name={maakunta[1]}
          onChange={onFilterChange}
          value={maakunta[0]}
          testId="upper-level-ammattiryhma-filter"
        />
      ))}
    </fieldset>
  );
};
