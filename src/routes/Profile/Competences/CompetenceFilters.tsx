import { OSAAMINEN_COLOR_MAP } from '@/constants';
import type { CompetenceSourceType, FiltersType } from '@/routes/Profile/Competences/constants';
import { Accordion, Checkbox } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface TitleCheckboxProps {
  type: keyof FiltersType;
  checked: boolean;
  onChange: () => void;
}
/**
 * This component is used as the top level filter title. It toggles all filters of a specific type.
 */
const TitleCheckbox = ({ type, checked, onChange }: TitleCheckboxProps) => {
  const { t, i18n } = useTranslation();
  return (
    <Checkbox
      label={
        <span className="flex items-center hyphens-auto" lang={i18n.language}>
          <div className={`mx-3 h-5 w-5 flex-none rounded-full ds-bg-tag-${OSAAMINEN_COLOR_MAP[type]}`} aria-hidden />
          {t(`types.competence.${type}`)}
        </span>
      }
      checked={checked}
      onChange={onChange}
      ariaLabel={t(`types.competence.${type}`)}
      name={t('profile.competences.do-filter')}
      value={type}
      className="min-h-7"
    />
  );
};

export interface CompetenceFiltersProps {
  filterKeys: (keyof FiltersType)[];
  selectedFilters: FiltersType;
  setSelectedFilters: (value: FiltersType) => void;
}

export const CompetenceFilters = ({ filterKeys, selectedFilters, setSelectedFilters }: CompetenceFiltersProps) => {
  const { t, i18n } = useTranslation();

  // Toggle single filter item
  const toggleSingleFilter = (type: CompetenceSourceType, index: number) => () => {
    const newFilters = { ...selectedFilters };
    newFilters[type][index] = newFilters[type][index] ?? { checked: true };
    newFilters[type][index].checked = !newFilters[type][index].checked;
    setSelectedFilters(newFilters);
  };

  // Check if any filter of a specific type is checked
  const isFilterTypeChecked = (type: CompetenceSourceType) => {
    const filter = selectedFilters[type];
    return (filter.length > 0 && filter?.some((item) => item.checked)) ?? false;
  };

  // Toggle all filters of a specific type
  const toggleFiltersByType = (type: CompetenceSourceType) => () => {
    const newFilter = { ...selectedFilters };
    newFilter[type] = newFilter[type] ?? [];

    // If there are any checked items, uncheck all, otherwise check all
    const targetState = !isFilterTypeChecked(type);

    newFilter[type]?.forEach((item) => {
      item.checked = targetState;
    });

    setSelectedFilters(newFilter);
  };

  return (
    // Height = viewport height - header and footer heights - padding
    <ul className="flex flex-col gap-y-3 py-4 max-h-[calc(100vh-296px-64px)] overflow-y-auto">
      {filterKeys.map((key) => (
        <React.Fragment key={key}>
          {key !== 'MUU_OSAAMINEN' ? (
            <li>
              <Accordion
                title={
                  <TitleCheckbox type={key} checked={isFilterTypeChecked(key)} onChange={toggleFiltersByType(key)} />
                }
                titleText={t(`types.competence.${key}`)}
                lang={i18n.language}
              >
                <ul className="gap-y-3 flex-col flex">
                  {selectedFilters[key]?.map((item, idx) => (
                    <li className="pl-6" key={item.label}>
                      <Checkbox
                        name={item.label}
                        ariaLabel={`${key} ${item.label}`}
                        label={item.label}
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
            <li>
              <TitleCheckbox type={key} checked={isFilterTypeChecked(key)} onChange={toggleFiltersByType(key)} />
            </li>
          )}
        </React.Fragment>
      ))}
    </ul>
  );
};
