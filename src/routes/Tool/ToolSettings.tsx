import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

import { Button, Modal, useMediaQueries } from '@jod/design-system';

import { ModalComponentProps, useModal } from '@/hooks/useModal';
import { FilterOpportunityType } from '@/routes/Tool/components/filters/FilterOpportunityType';
import { useToolStore } from '@/stores/useToolStore';
import { getFilterCount, noFiltersSelected } from '@/utils/FilterUtils';

import { FilterSijainti } from './components/filters/FilterSijainti';
import OpportunitiesSorting from './components/filters/OpportunitiesSorting';
import OpportunityWeight from './components/filters/OpportunityWeight';
import { Setting } from './components/Setting';

export interface ToolSettingsProps extends ModalComponentProps {
  onUpdate: () => void;
}
const ToolSettings = ({ onUpdate, ...rest }: ToolSettingsProps) => {
  const { t } = useTranslation();
  const { sm } = useMediaQueries();
  const {
    resetSettings,
    filters,
    setFilters,
    sorting,
    setSorting,
    settingsHaveChanged,
    setSettingsHaveChanged,
    osaamisKiinnostusPainotus,
    setOsaamisKiinnostusPainotus,
  } = useToolStore(
    useShallow((state) => ({
      resetSettings: state.resetSettings,
      filters: state.filters,
      setFilters: state.setFilters,
      sorting: state.sorting,
      setSorting: state.setSorting,
      settingsHaveChanged: state.settingsHaveChanged,
      setSettingsHaveChanged: state.setSettingsHaveChanged,
      osaamisKiinnostusPainotus: state.osaamisKiinnostusPainotus,
      setOsaamisKiinnostusPainotus: state.setOsaamisKiinnostusPainotus,
    })),
  );
  const { closeActiveModal } = useModal();
  const [initialFilters] = React.useState(filters);
  const [initialSorting] = React.useState(sorting);
  const [initialOsaamisKiinnostusPainotus] = React.useState(osaamisKiinnostusPainotus);
  const [initialSettingsHaveChanged] = React.useState(settingsHaveChanged);

  const filtersHaveChanged = JSON.stringify(filters) !== JSON.stringify(initialFilters);
  const sortingHasChanged = sorting !== initialSorting;
  const osaamisKiinnostusPainotusHasChanged = osaamisKiinnostusPainotus !== initialOsaamisKiinnostusPainotus;

  return (
    <Modal
      name={t('tool.settings.controls')}
      {...rest}
      className="h-[90vh]! sm:h-full!"
      fullWidthContent
      topSlot={<h2 className="text-heading-2-mobile sm:text-hero">{t('tool.settings.modal-title')}</h2>}
      content={
        <div className="flex max-h-full w-full flex-col gap-2 bg-bg-gray text-body-sm-mobile sm:text-body-sm">
          <ul className="box-content max-w-modal-content px-5 md:px-9">
            <Setting
              title={t('tool.settings.general.filter')}
              count={getFilterCount(filters, [
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
              count={getFilterCount(filters, ['region'])}
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
              disabled={noFiltersSelected(filters)}
              testId="reset-settings-button"
            />
          </div>
          <div className="ml-auto flex gap-4">
            <Button
              variant="white"
              size={sm ? 'lg' : 'sm'}
              className="whitespace-nowrap"
              onClick={() => {
                closeActiveModal();
                // Revert user changes to filters and sorting on cancel
                setFilters(initialFilters);
                setSorting(initialSorting);
                setSettingsHaveChanged(initialSettingsHaveChanged);
                setOsaamisKiinnostusPainotus(initialOsaamisKiinnostusPainotus);
              }}
              label={t('common:cancel')}
              testId="cancel-settings-button"
            />
            <Button
              variant="accent"
              size={sm ? 'lg' : 'sm'}
              disabled={!filtersHaveChanged && !sortingHasChanged && !osaamisKiinnostusPainotusHasChanged}
              className="whitespace-nowrap"
              onClick={() => {
                closeActiveModal();
                onUpdate();
              }}
              label={t('update-short')}
              testId="update-settings-button"
            />
          </div>
        </div>
      }
      testId="tool-settings"
    />
  );
};

export default ToolSettings;
