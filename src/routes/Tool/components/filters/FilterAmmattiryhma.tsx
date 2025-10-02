import { ammatit } from '@/api/ammatit.ts';
import { useToolStore } from '@/stores/useToolStore';
import { getLocalizedText } from '@/utils';
import { Checkbox } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

const FilterAmmattiryhma = () => {
  const { t } = useTranslation();
  const { ammattiryhmaNimet, filter, addAmmattiryhmaFilter, removeAmmattiryhmaFromFilter } = useToolStore(
    useShallow((state) => ({
      ammattiryhmaNimet: state.ammattiryhmaNimet,
      filter: state.filters,
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

  const upperLevelAmmattiryhmat = [
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
  ];

  React.useEffect(
    () => {
      async function fetchUpperLevelAmmattiryhmanimet() {
        const ammattiryhmat = await ammatit.find(upperLevelAmmattiryhmat);
        ammattiryhmat.forEach((ar) => {
          ammattiryhmaNimet[ar.uri] = ar.nimi;
        });
      }

      fetchUpperLevelAmmattiryhmanimet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="text-heading-4-mobile sm:text-heading-4 mb-5 sr-only">{t('show')}</legend>
      {upperLevelAmmattiryhmat.map((ar) => (
        <Checkbox
          key={ar}
          ariaLabel={getLocalizedText(ammattiryhmaNimet?.[ar])}
          className="font-poppins!"
          checked={filter.ammattiryhmat.includes(ar)}
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
