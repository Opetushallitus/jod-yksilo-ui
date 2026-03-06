import { FilterOpportunityType } from '@/routes/Tool/components/filters/FilterOpportunityType';
import { useToolStore } from '@/stores/useToolStore';
import { FilterName } from '@/stores/useToolStore/ToolStoreModel.ts';
import { Button, cx, Modal, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';
import { FilterSijainti } from './components/filters/FilterSijainti';
import OpportunitiesSorting from './components/filters/OpportunitiesSorting';
import OpportunityWeight from './components/filters/OpportunityWeight';
import { Setting } from './components/Setting';

export interface ToolSettingsProps {
  isOpen: boolean;
  onClose: (cancel: boolean) => void;
}
const ToolSettings = ({ isOpen, onClose }: ToolSettingsProps) => {
  const { t } = useTranslation();
  const { sm } = useMediaQueries();
  const { resetSettings, filters, setFilters, sorting, setSorting } = useToolStore(
    useShallow((state) => ({
      resetSettings: state.resetSettings,
      filters: state.filters,
      setFilters: state.setFilters,
      sorting: state.sorting,
      setSorting: state.setSorting,
    })),
  );
  const [initialFilters] = React.useState(filters);
  const [initialSorting] = React.useState(sorting);
  const filtersHaveChanged = JSON.stringify(filters) !== JSON.stringify(initialFilters);
  const sortingHasChanged = sorting !== initialSorting;

  const getFilterCount = (filterList: FilterName[]) => {
    if (!filters) {
      return 0;
    }

    return filterList.reduce((sum, filter) => {
      const value = filters[filter];
      if (Array.isArray(value)) {
        return sum + value.length;
      } else if (typeof value === 'number') {
        return sum + value;
      } else {
        return sum;
      }
    }, 0);
  };

  const noFiltersSelected = Object.values(filters ?? {}).every((value) => {
    if (Array.isArray(value)) {
      return value.length === 0;
    } else if (typeof value === 'number') {
      return value === 0;
    } else if (value === null) {
      return true;
    } else {
      return true;
    }
  });

  return (
    <Modal
      name={t('tool.settings.controls')}
      open={isOpen}
      className="sm:h-full!"
      fullWidthContent
      topSlot={<h2 className="sm:text-hero text-heading-2-mobile">{t('tool.settings.modal-title')}</h2>}
      content={
        <div className="bg-bg-gray w-full sm:text-body-sm text-body-sm-mobile flex flex-col gap-2 max-h-full">
          <ul
            className={cx('mt-4', {
              // For shifting the scrollbar to the right
              'w-2/3': sm,
              '-mr-3 pr-3': !sm,
            })}
          >
            <Setting
              title={t('tool.settings.general.filter')}
              count={getFilterCount([
                'opportunityType',
                'educationOpportunityType',
                'jobOpportunityType',
                'ammattiryhmat',
              ])}
              testId="filter-setting"
              initiallyOpen
              hideTopBorder={!sm}
            >
              <FilterOpportunityType />
            </Setting>
            <Setting title={t('tool.settings.general.weight')} testId="weight-setting">
              <OpportunityWeight />
            </Setting>
            <Setting title={t('tool.settings.general.sorting')} testId="sorting-setting">
              <OpportunitiesSorting />
            </Setting>
            <Setting
              title={t('tool.settings.general.location')}
              count={getFilterCount(['region'])}
              className="border-b-2 pb-3"
              testId="location-setting"
            >
              <FilterSijainti />
            </Setting>
          </ul>
        </div>
      }
      footer={
        <div className="flex w-full">
          <div>
            <Button
              variant="white"
              size={sm ? 'lg' : 'sm'}
              onClick={resetSettings}
              label={t('tool.settings.reset')}
              disabled={noFiltersSelected}
            />
          </div>
          <div className="flex gap-4 ml-auto">
            <Button
              variant="white"
              size={sm ? 'lg' : 'sm'}
              className="whitespace-nowrap"
              onClick={() => {
                onClose(true);

                // Revert user changes to filters and sorting on cancel
                setFilters(initialFilters);
                setSorting(initialSorting);
              }}
              label={t('common:cancel')}
              testId="reset-settings-button"
            />
            <Button
              variant="accent"
              size={sm ? 'lg' : 'sm'}
              disabled={!filtersHaveChanged && !sortingHasChanged}
              className="whitespace-nowrap"
              onClick={() => onClose(false)}
              label={t('update-short')}
            />
          </div>
        </div>
      }
      testId="tool-settings"
    />
  );
};

export default ToolSettings;
