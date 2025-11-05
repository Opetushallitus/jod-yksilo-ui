import { useToolStore } from '@/stores/useToolStore';
import { Checkbox } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

const maakuntaKoodit = [
  ['01', 'Uusimaa'],
  ['02', 'Varsinais-Suomi'],
  ['04', 'Satakunta'],
  ['05', 'Kanta-Häme'],
  ['06', 'Pirkanmaa'],
  ['07', 'Päijät-Häme'],
  ['08', 'Kymenlaakso'],
  ['09', 'Etelä-Karjala'],
  ['10', 'Etelä-Savo'],
  ['11', 'Pohjois-Savo'],
  ['12', 'Pohjois-Karjala'],
  ['13', 'Keski-Suomi'],
  ['14', 'Etelä-Pohjanmaa'],
  ['15', 'Pohjanmaa'],
  ['16', 'Keski-Pohjanmaa'],
  ['17', 'Pohjois-Pohjanmaa'],
  ['18', 'Kainuu'],
  ['19', 'Lappi'],
  ['20', 'Itä-Uusimaa'],
  ['21', 'Ahvenanmaa'],
].sort((a, b) => a[1].localeCompare(b[1]));

export const FilterSijainti = () => {
  const { t } = useTranslation();
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

  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="text-heading-4-mobile sm:text-heading-4 mb-5 sr-only">{t('show')}</legend>
      {maakuntaKoodit.map((maakunta) => (
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
