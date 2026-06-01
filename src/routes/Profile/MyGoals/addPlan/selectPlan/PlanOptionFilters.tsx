import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

import { Button, Modal, useMediaQueries } from '@jod/design-system';

import { useModal } from '@/hooks/useModal';
import { ModalComponentProps } from '@/hooks/useModal/utils';
import { FilterEducationOpportunityType } from '@/routes/Profile/MyGoals/addPlan/selectPlan/FilterEducationOpportunityType';
import { FilterKesto } from '@/routes/Profile/MyGoals/addPlan/selectPlan/FilterKesto';
import { addPlanStore } from '@/routes/Profile/MyGoals/addPlan/store/addPlanStore';
import { MAX_KESTO_VALUE, MIN_KESTO_VALUE } from '@/routes/Profile/MyGoals/addPlan/store/PlanOptionStoreModel';
import { Setting } from '@/routes/Tool/components/Setting';
import { getFilterCount, noFiltersSelected } from '@/utils/FilterUtils';

export interface PlanOptionFiltersProps extends ModalComponentProps {
  onConfirm: () => void;
}
const SettingsMenu = () => {
  const { t } = useTranslation();
  const filters = addPlanStore((state) => state.filters);
  const { sm } = useMediaQueries();

  // Return 1 if kesto filter values differ from default, else 0
  const getKestoCount = () => {
    const { minDuration, maxDuration } = filters;
    const sixYears = 6 * 12;
    const isMinValue = minDuration === MIN_KESTO_VALUE || minDuration === null;
    const isMaxValue = maxDuration === MAX_KESTO_VALUE || maxDuration === null || maxDuration === sixYears;
    const isDefaultValue = isMinValue && isMaxValue;
    return isDefaultValue ? 0 : 1;
  };

  return (
    <div className="flex max-h-full flex-col gap-2 bg-bg-gray text-body-sm-mobile sm:text-body-sm">
      <ul>
        <Setting
          initiallyOpen
          title={t('tool.settings.general.education-opportunity-type')}
          count={getFilterCount(filters, ['educationOpportunityType'])}
          hideTopBorder={!sm}
        >
          <FilterEducationOpportunityType />
        </Setting>
        <Setting
          initiallyOpen
          title={t('tool.settings.general.duration')}
          count={getKestoCount()}
          className="border-b-2 pb-3"
        >
          <FilterKesto />
        </Setting>
      </ul>
    </div>
  );
};

const PlanOptionFilters = ({ onConfirm, ...rest }: PlanOptionFiltersProps) => {
  const { t } = useTranslation();
  const { resetSettings, setFilters } = addPlanStore(
    useShallow((state) => ({ resetSettings: state.resetSettings, setFilters: state.setFilters })),
  );
  const filters = addPlanStore((state) => state.filters);
  const { sm } = useMediaQueries();
  const [initialFilters] = React.useState(filters);
  const filtersHaveChanged = JSON.stringify(filters) !== JSON.stringify(initialFilters);
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const { closeActiveModal } = useModal();

  React.useEffect(() => {
    if (rest.open && titleRef.current) {
      titleRef.current.focus();
    }
  }, [rest.open]);

  return (
    <Modal
      name={t('tool.settings.controls')}
      {...rest}
      topSlot={
        <h2 ref={titleRef} tabIndex={-1} className="text-heading-2-mobile focus-visible:outline-0 sm:text-hero">
          {t('profile.my-goals.adjust-list')}
        </h2>
      }
      fullWidthContent
      className="h-[90dvh]!"
      content={
        <div className="box-content flex max-w-modal-content flex-col gap-6 bg-bg-gray px-5 text-body-sm-mobile sm:pl-9 sm:text-body-sm">
          <SettingsMenu />
        </div>
      }
      footer={
        <div className="flex w-full items-center justify-between">
          <div>
            <Button
              variant="white"
              size={sm ? 'lg' : 'sm'}
              className="whitespace-nowrap"
              onClick={resetSettings}
              disabled={noFiltersSelected(filters)}
              label={t('tool.settings.reset')}
            />
          </div>
          <div className="flex flex-row gap-5">
            <Button
              label={t('common:cancel')}
              className="whitespace-nowrap"
              variant="white"
              onClick={() => {
                setFilters(initialFilters);
                closeActiveModal();
              }}
              size={sm ? 'lg' : 'sm'}
            />
            <Button
              label={t('update-short')}
              variant="accent"
              className="whitespace-nowrap"
              disabled={!filtersHaveChanged}
              onClick={() => {
                onConfirm();
                closeActiveModal();
              }}
              size={sm ? 'lg' : 'sm'}
            />
          </div>
        </div>
      }
    />
  );
};

export default PlanOptionFilters;
