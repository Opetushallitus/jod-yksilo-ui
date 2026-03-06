import { FilterEducationOpportunityType } from '@/routes/Profile/MyGoals/addPlan/selectPlan/FilterEducationOpportunityType';
import { FilterKesto } from '@/routes/Profile/MyGoals/addPlan/selectPlan/FilterKesto';
import { addPlanStore } from '@/routes/Profile/MyGoals/addPlan/store/addPlanStore';
import {
  FilterName,
  MAX_KESTO_VALUE,
  MIN_KESTO_VALUE,
} from '@/routes/Profile/MyGoals/addPlan/store/PlanOptionStoreModel';
import { Setting } from '@/routes/Tool/components/Setting';
import { Button, cx, Modal, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

export interface PlanOptionFiltersProps {
  isOpen: boolean;
  onClose: (cancel: boolean) => void;
}
const SettingsMenu = () => {
  const { t } = useTranslation();
  const filters = addPlanStore((state) => state.filters);
  const { sm } = useMediaQueries();

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
    <div className="bg-bg-gray w-full sm:text-body-sm text-body-sm-mobile flex flex-col gap-2 max-h-full">
      <ul
        className={cx('mt-4 overflow-y-auto', {
          // For shifting the scrollbar to the right
          'w-2/3': sm,
          '-mr-3 pr-3': !sm,
        })}
      >
        <Setting
          title={t('tool.settings.general.education-opportunity-type')}
          count={getFilterCount(['educationOpportunityType'])}
          hideTopBorder={!sm}
        >
          <FilterEducationOpportunityType />
        </Setting>
        <Setting title={t('tool.settings.general.duration')} count={getKestoCount()} className="border-b-2 pb-3">
          <FilterKesto />
        </Setting>
      </ul>
    </div>
  );
};

const PlanOptionFilters = ({ isOpen, onClose }: PlanOptionFiltersProps) => {
  const { t } = useTranslation();
  const { resetSettings, setFilters } = addPlanStore(
    useShallow((state) => ({ resetSettings: state.resetSettings, setFilters: state.setFilters })),
  );
  const filters = addPlanStore((state) => state.filters);
  const { sm } = useMediaQueries();
  const [initialFilters] = React.useState(filters);
  const filtersHaveChanged = JSON.stringify(filters) !== JSON.stringify(initialFilters);
  const titleRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    if (isOpen && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isOpen]);

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
      topSlot={
        <h2 ref={titleRef} tabIndex={-1} className="sm:text-hero text-heading-2-mobile focus-visible:outline-0">
          {t('profile.my-goals.adjust-list')}
        </h2>
      }
      fullWidthContent
      className="h-[90dvh]!"
      content={
        <div className="bg-bg-gray w-full sm:text-body-sm text-body-sm-mobile flex flex-col gap-6">
          <SettingsMenu />
        </div>
      }
      footer={
        <div className="flex justify-between w-full items-center">
          <div>
            <Button
              variant="white"
              size={sm ? 'lg' : 'sm'}
              className="whitespace-nowrap"
              onClick={resetSettings}
              disabled={noFiltersSelected}
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
                onClose(true);
              }}
              size={sm ? 'lg' : 'sm'}
            />
            <Button
              label={t('update-short')}
              variant="accent"
              className="whitespace-nowrap"
              disabled={!filtersHaveChanged}
              onClick={() => onClose(false)}
              size={sm ? 'lg' : 'sm'}
            />
          </div>
        </div>
      }
    />
  );
};

export default PlanOptionFilters;
