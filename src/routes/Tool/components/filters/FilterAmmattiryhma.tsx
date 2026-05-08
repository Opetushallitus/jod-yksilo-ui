import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

import { Checkbox } from '@jod/design-system';

import { useToolStore } from '@/stores/useToolStore';
import { getLocalizedText } from '@/utils';

export const FilterAmmattiryhma = () => {
  const { t } = useTranslation();
  const {
    fillAmmattiryhmaNimet,
    addToArray,
    ammattiryhmaNimet,
    filter,
    addAmmattiryhmaFilter,
    removeAmmattiryhmaFromFilter,
  } = useToolStore(
    useShallow((state) => ({
      fillAmmattiryhmaNimet: state.fillAmmattiryhmaNimet,
      filter: state.filters,
      ammattiryhmaNimet: state.ammattiryhmaNimet,
      addAmmattiryhmaFilter: state.addAmmattiryhmaToFilter,
      removeAmmattiryhmaFromFilter: state.removeAmmattiryhmaFromFilter,
      addToArray: state.addToArray,
    })),
  );
  const onFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const ammattiRyhma = event.target.value;
    if (filter.ammattiryhmat.includes(ammattiRyhma)) {
      removeAmmattiryhmaFromFilter(ammattiRyhma);
    } else {
      addAmmattiryhmaFilter(ammattiRyhma);
      addToArray('opportunityType', 'TYOMAHDOLLISUUS');
    }
  };

  const upperLevelAmmattiryhmat = React.useMemo(
    () => [
      'http://data.europa.eu/esco/isco/C0',
      'http://data.europa.eu/esco/isco/C1',
      'http://data.europa.eu/esco/isco/C2',
      'http://data.europa.eu/esco/isco/C3',
      'http://data.europa.eu/esco/isco/C4',
      'http://data.europa.eu/esco/isco/C5',
      'http://data.europa.eu/esco/isco/C6',
      'http://data.europa.eu/esco/isco/C7',
      'http://data.europa.eu/esco/isco/C8',
      'http://data.europa.eu/esco/isco/C9',
    ],
    [],
  );

  React.useEffect(() => {
    void fillAmmattiryhmaNimet(upperLevelAmmattiryhmat);
  }, [fillAmmattiryhmaNimet, upperLevelAmmattiryhmat]);

  const visibleAmmattiRyhmat = upperLevelAmmattiryhmat
    .map((ar) => ({ id: ar, name: ammattiryhmaNimet?.[ar] }))
    .filter((ar) => ar.name !== undefined)
    .map((ar) => ({ name: getLocalizedText(ar.name), id: ar.id }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="sr-only mb-5 text-heading-4-mobile sm:text-heading-4">{t('show')}</legend>
      {visibleAmmattiRyhmat.map((ar) => (
        <Checkbox
          key={ar.id}
          ariaLabel={ar.name}
          className="font-poppins!"
          checked={filter.ammattiryhmat?.includes(ar.id)}
          label={ar.name}
          name={ar.name}
          onChange={onFilterChange}
          value={ar.id}
          testId="upper-level-ammattiryhma-filter"
        />
      ))}
    </fieldset>
  );
};
