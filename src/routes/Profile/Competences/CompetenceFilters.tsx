import type { CompetenceSourceType, FiltersType } from '@/routes/Profile/Competences/constants';
import { getLocalizedText } from '@/utils';
import { Accordion, Checkbox } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface TitleCheckboxProps {
  type: keyof FiltersType;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}
/**
 * This component is used as the top level filter title. It toggles all filters of a specific type.
 */
const TitleCheckbox = ({ type, checked, disabled, onChange }: TitleCheckboxProps) => {
  const { t } = useTranslation();

  const labels: Record<keyof FiltersType, string> = {
    TOIMENKUVA: t('types.competence.TOIMENKUVA'),
    KOULUTUS: t('types.competence.KOULUTUS'),
    PATEVYYS: t('types.competence.PATEVYYS'),
    MUU_OSAAMINEN: t('types.competence.MUU_OSAAMINEN'),
    KIINNOSTUS: t('types.competence.KIINNOSTUS'),
  };

  const name = `do-filter-${type}`;

  return (
    <Checkbox
      label={labels[type]}
      checked={checked}
      onChange={onChange}
      ariaLabel={labels[type]}
      name={name}
      value={type}
      className="min-h-7"
      disabled={disabled}
    />
  );
};

export interface CompetenceFiltersProps {
  filterKeys: (keyof FiltersType)[];
  selectedFilters: FiltersType;
  setSelectedFilters: (value: FiltersType) => void;
  ignoredFilterKeys?: (keyof FiltersType)[];
}

export const CompetenceFilters = ({
  filterKeys,
  selectedFilters,
  setSelectedFilters,
  ignoredFilterKeys = [],
}: CompetenceFiltersProps) => {
  const { t } = useTranslation();

  const [accordionState, setAccordionState] = React.useState<Record<string, boolean>>(
    filterKeys.filter((key) => !ignoredFilterKeys.includes(key)).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
  );

  // Toggle single filter item
  const toggleSingleFilter = (type: CompetenceSourceType, index: number) => () => {
    const newFilters = { ...selectedFilters };
    if (newFilters[type]) {
      newFilters[type][index] = newFilters[type][index] ?? { checked: true };
      newFilters[type][index].checked = !newFilters[type][index].checked;
    }
    setSelectedFilters(newFilters);
  };

  // Check if any filter of a specific type is checked
  const isFilterTypeChecked = (type: CompetenceSourceType) => {
    const filter = selectedFilters[type];
    return filter?.some((item) => item.checked) === true;
  };

  // Toggle all filters of a specific type
  const toggleFiltersByType = (type: CompetenceSourceType) => () => {
    const newFilter = { ...selectedFilters };
    newFilter[type] = newFilter[type] ?? [];

    // If there are any checked items, uncheck all, otherwise check all
    const targetState = !isFilterTypeChecked(type);

    for (const item of newFilter[type] ?? []) {
      item.checked = targetState;
    }

    setSelectedFilters(newFilter);
  };

  const ariaLabels = React.useMemo(
    () => ({
      TOIMENKUVA: t('types.competence.TOIMENKUVA'),
      KOULUTUS: t('types.competence.KOULUTUS'),
      PATEVYYS: t('types.competence.PATEVYYS'),
    }),
    [t],
  );

  return (
    <ul className="flex flex-col gap-y-3 py-4 overflow-y-auto">
      {filterKeys
        .filter((key) => !ignoredFilterKeys.includes(key))
        .map((key) => (
          <React.Fragment key={key}>
            {key !== 'MUU_OSAAMINEN' && key !== 'KIINNOSTUS' && selectedFilters[key]?.length > 0 ? (
              <li className="pb-3">
                <Accordion
                  title={
                    <TitleCheckbox type={key} checked={isFilterTypeChecked(key)} onChange={toggleFiltersByType(key)} />
                  }
                  ariaLabel={ariaLabels[key]}
                  isOpen={accordionState[key]}
                  setIsOpen={(open) => setAccordionState((prev) => ({ ...prev, [key]: open }))}
                >
                  <ul className="gap-y-4 flex-col flex mt-4">
                    {selectedFilters[key]?.map((item, idx) => (
                      <li className="pl-7" key={getLocalizedText(item.label)}>
                        <Checkbox
                          name={getLocalizedText(item.label)}
                          ariaLabel={`${key} ${getLocalizedText(item.label)}`}
                          label={getLocalizedText(item.label)}
                          checked={item.checked}
                          onChange={toggleSingleFilter(key, idx)}
                          value={JSON.stringify(item.value)}
                        />
                      </li>
                    ))}
                  </ul>
                </Accordion>
              </li>
            ) : (
              <li className="pb-3">
                <TitleCheckbox
                  type={key}
                  checked={isFilterTypeChecked(key)}
                  onChange={toggleFiltersByType(key)}
                  disabled={selectedFilters[key]?.length === 0}
                />
              </li>
            )}
          </React.Fragment>
        ))}
    </ul>
  );
};
