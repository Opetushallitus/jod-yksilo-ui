import { FilterOpportunityType } from '@/routes/Tool/components/filters/FilterOpportunityType';
import { useToolStore } from '@/stores/useToolStore';
import { FilterName } from '@/stores/useToolStore/ToolStoreModel.ts';
import { Button, Modal, useNoteStack } from '@jod/design-system';
import { JodClose } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FilterSijainti } from './components/filters/FilterSijainti';
import OpportunitiesSorting from './components/filters/OpportunitiesSorting';
import OpportunityWeight from './components/filters/OpportunityWeight';
import { Setting } from './components/Settings';

const SettingsSection = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="sticky top-0 mt-4">
      <div className="max-h-[80vh] overflow-y-auto">
        <ul className="flex flex-col gap-3">{children}</ul>
      </div>
    </div>
  );
};

const ModalSettingsSection = ({ children }: { children: React.ReactNode }) => {
  return <div className="mt-4 overflow-y-auto">{children}</div>;
};

export interface ToolSettingsProps {
  ref: React.RefObject<HTMLDivElement | null>;
  isOpen: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

const SettingsMenu = ({ ref, isModal }: Pick<ToolSettingsProps, 'ref' | 'isModal'>) => {
  const { t } = useTranslation();
  const filters = useToolStore((state) => state.filters);

  const getFilterCount = (filterList: FilterName[]) => {
    return filters ? filterList.reduce((sum, filter) => sum + (filters[filter]?.length ?? 0), 0) : 0;
  };

  const SettingsContainer = isModal ? ModalSettingsSection : SettingsSection;

  return (
    <SettingsContainer>
      <Setting
        title={t('tool.settings.general.filter')}
        ref={ref}
        count={getFilterCount(['opportunityType', 'educationOpportunityType', 'jobOpportunityType', 'ammattiryhmat'])}
        testId="filter-setting"
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
    </SettingsContainer>
  );
};

const ToolSettings = ({ ref, isOpen, onClose, isModal }: ToolSettingsProps) => {
  const { t } = useTranslation();
  const resetSettings = useToolStore((state) => state.resetSettings);
  const resetSection = (className: string) => (
    <div className={`sticky bottom-0 px-4 py-2 ${className}`}>
      <Button
        variant="plain"
        size="sm"
        serviceVariant="yksilo"
        onClick={resetSettings}
        label={t('tool.settings.reset')}
        testId="reset-settings-button"
      />
    </div>
  );
  const { permanentNotesHeight } = useNoteStack();
  const top = `${124 + permanentNotesHeight}px`;

  return isModal ? (
    <Modal
      name={t('tool.settings.controls')}
      open={isOpen}
      onClose={onClose}
      fullWidthContent
      content={
        <div className="bg-bg-gray w-full sm:text-body-sm text-body-sm-mobile flex flex-col gap-2 max-h-full">
          {isModal && (
            <Button
              variant="plain"
              size="sm"
              serviceVariant="yksilo"
              className="self-end text-black!"
              onClick={onClose}
              iconSide="left"
              icon={<JodClose className="text-accent" />}
              label={t('save-and-close')}
            />
          )}
          <SettingsMenu ref={ref} isModal={isModal} />
          {resetSection('bg-bg-gray')}
        </div>
      }
      testId="tool-settings"
    />
  ) : (
    <div
      className="bg-bg-gray-2 rounded mb-7 py-4 px-6 sm:text-body-sm text-body-sm-mobile flex flex-col gap-2 sticky z-10"
      style={{ top }}
    >
      <SettingsMenu ref={ref} isModal={isModal} />
      {resetSection('bg-bg-gray-2')}
    </div>
  );
};

export default ToolSettings;
