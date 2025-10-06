import { useToolStore } from '@/stores/useToolStore';
import { getLocalizedText } from '@/utils';
import { Checkbox } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

const FilterAmmattiryhma = () => {
  const { t } = useTranslation();
  const { fillAmmattiryhmaNimet, ammattiryhmaNimet, filter, addAmmattiryhmaFilter, removeAmmattiryhmaFromFilter } =
    useToolStore(
      useShallow((state) => ({
        fillAmmattiryhmaNimet: state.fillAmmattiryhmaNimet,
        filter: state.filters,
        ammattiryhmaNimet: state.ammattiryhmaNimet,
        addAmmattiryhmaFilter: state.addAmmattiryhmaToFilter,
        removeAmmattiryhmaFromFilter: state.removeAmmattiryhmaFromFilter,
      })),
    );
  const onFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const ammattiRyhma = event.target.value;
    if (filter.ammattiryhmat.includes(ammattiRyhma)) {
      removeAmmattiryhmaFromFilter(ammattiRyhma);
    } else {
      addAmmattiryhmaFilter(ammattiRyhma);
    }
  };

  const upperLevelAmmattiryhmat = React.useMemo(
    () => [
      // eslint-disable-next-line sonarjs/no-clear-text-protocols
      'http://data.europa.eu/esco/isco/C0',
      // eslint-disable-next-line sonarjs/no-clear-text-protocols
      'http://data.europa.eu/esco/isco/C1',
      // eslint-disable-next-line sonarjs/no-clear-text-protocols
      'http://data.europa.eu/esco/isco/C2',
      // eslint-disable-next-line sonarjs/no-clear-text-protocols
      'http://data.europa.eu/esco/isco/C3',
      // eslint-disable-next-line sonarjs/no-clear-text-protocols
      'http://data.europa.eu/esco/isco/C4',
      // eslint-disable-next-line sonarjs/no-clear-text-protocols
      'http://data.europa.eu/esco/isco/C5',
      // eslint-disable-next-line sonarjs/no-clear-text-protocols
      'http://data.europa.eu/esco/isco/C6',
      // eslint-disable-next-line sonarjs/no-clear-text-protocols
      'http://data.europa.eu/esco/isco/C7',
      // eslint-disable-next-line sonarjs/no-clear-text-protocols
      'http://data.europa.eu/esco/isco/C8',
      // eslint-disable-next-line sonarjs/no-clear-text-protocols
      'http://data.europa.eu/esco/isco/C9',
    ],
    [],
  );

  React.useEffect(() => {
    fillAmmattiryhmaNimet(upperLevelAmmattiryhmat);
  }, [fillAmmattiryhmaNimet, upperLevelAmmattiryhmat]);

  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="text-heading-4-mobile sm:text-heading-4 mb-5 sr-only">{t('show')}</legend>
      {upperLevelAmmattiryhmat.map((ar) => (
        <Checkbox
          key={ar}
          ariaLabel={getLocalizedText(ammattiryhmaNimet?.[ar])}
          className="font-poppins!"
          checked={filter.ammattiryhmat?.includes(ar)}
          label={getLocalizedText(ammattiryhmaNimet?.[ar])}
          name={getLocalizedText(ammattiryhmaNimet?.[ar])}
          onChange={onFilterChange}
          value={ar}
          data-testid="upper-level-ammattiryhma-filter"
        />
      ))}
    </fieldset>
  );
};

export default FilterAmmattiryhma;
