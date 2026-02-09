import { FilterEducationOpportunityType } from '@/routes/Profile/MyGoals/addPlan/selectPlan/FilterEducationOpportunityType.tsx';
import { FilterKesto } from '@/routes/Profile/MyGoals/addPlan/selectPlan/FilterKesto.tsx';
import { addPlanStore } from '@/routes/Profile/MyGoals/addPlan/store/addPlanStore.ts';
import {
  FilterName,
  MAX_KESTO_VALUE,
  MIN_KESTO_VALUE,
} from '@/routes/Profile/MyGoals/addPlan/store/PlanOptionStoreModel.ts';
import { Accordion, Button, Modal, useMediaQueries } from '@jod/design-system';
import { JodClose } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

const Setting = ({
  title,
  children,
  hidden,
  ref,
  count,
}: {
  title: string;
  /** Amount of selected settings/filters */
  count?: number;
  hidden?: boolean;
  children: React.ReactNode;
  /** Ref is used to reference accordion open button for focusing */
  ref?: React.RefObject<HTMLSpanElement | null>;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const titleText = title + (count ? ` (${count})` : '');
  const id = title.toLocaleLowerCase().replaceAll(/\s+/g, '-');
  const triggerId = `accordion-${id}`;
  const contentId = `accordion-${id}-content`;

  if (hidden) {
    return <></>;
  }
  return (
    <li className="border-b-2 border-b-primary-light-2 pb-4">
      <Accordion
        triggerId={triggerId}
        ariaControls={contentId}
        title={
          <span ref={ref} className="block w-full text-left cursor-pointer p-1 text-body-sm" aria-controls={id}>
            {titleText}
          </span>
        }
        ariaLabel={titleText}
        initialState={false}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      >
        <section className="pl-4" id={contentId} aria-labelledby={triggerId}>
          {children}
        </section>
      </Accordion>
    </li>
  );
};

export interface PlanOptionFiltersProps {
  isOpen: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

const SettingsMenu = () => {
  const { t } = useTranslation();
  const filters = addPlanStore((state) => state.filters);

  const getFilterCount = (filterList: FilterName[]) => {
    if (!filters) return 0;

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
    <div className="sticky top-0 mt-4">
      <div className="max-h-[80vh] overflow-y-auto">
        <ul className="flex flex-col gap-3 border-t-2 border-primary-light-2 pt-4">
          <Setting
            title={t('tool.settings.general.education-opportunity-type')}
            count={getFilterCount(['educationOpportunityType'])}
          >
            <FilterEducationOpportunityType />
          </Setting>
          <Setting title={t('tool.settings.general.duration')} count={getKestoCount()}>
            <FilterKesto />
          </Setting>
        </ul>
      </div>
    </div>
  );
};

const PlanOptionFilters = ({ isOpen, onClose, isModal }: PlanOptionFiltersProps) => {
  const { t } = useTranslation();
  const resetSettings = addPlanStore((state) => state.resetSettings);
  const { sm } = useMediaQueries();
  const resetSection = (
    <div className="sticky bottom-0 py-2">
      <Button
        variant="plain"
        size="sm"
        serviceVariant="yksilo"
        onClick={resetSettings}
        label={t('tool.settings.reset')}
      />
    </div>
  );

  return isModal ? (
    <Modal
      name={t('tool.settings.controls')}
      open={isOpen}
      onClose={onClose}
      topSlot={<h2 className="sm:text-heading-3 text-heading-3-mobile">{t('profile.my-goals.adjust-list')}</h2>}
      fullWidthContent
      className="h-full"
      footer={
        !sm && (
          <div className="flex flex-row gap-5 flex-1 justify-end">
            <Button label={t('common:cancel')} variant="white" onClick={onClose} size="sm" />
            <Button label={t('save')} variant="accent" onClick={onClose} size="sm" />
          </div>
        )
      }
      content={
        <div className="bg-bg-gray w-full sm:text-body-sm text-body-sm-mobile flex flex-col gap-6">
          {sm && (
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
          <SettingsMenu />
          {resetSection}
        </div>
      }
    />
  ) : (
    <div className="bg-bg-gray-2 rounded p-4 sm:text-body-sm text-body-sm-mobile flex flex-col gap-6">
      <SettingsMenu />
      {resetSection}
    </div>
  );
};

export default PlanOptionFilters;
