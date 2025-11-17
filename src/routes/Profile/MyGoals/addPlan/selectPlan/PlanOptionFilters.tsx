import { FilterEducationOpportunityType } from '@/routes/Profile/MyGoals/addPlan/selectPlan/FilterEducationOpportunityType.tsx';
import { addPlanStore } from '@/routes/Profile/MyGoals/addPlan/store';
import { FilterName } from '@/stores/useToolStore/ToolStoreModel.ts';
import { Accordion, Button, Modal } from '@jod/design-system';
import { JodClose } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

const SettingsSection = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="sticky top-0 mt-4">
      <div className="max-h-[80vh] overflow-y-auto">
        <ul className="flex flex-col gap-3">{children}</ul>
      </div>
    </div>
  );
};

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
  const id = title.toLocaleLowerCase().replace(/\s+/g, '-');
  const triggerId = `accordion-${id}`;
  const contentId = `accordion-${id}-content`;

  if (hidden) {
    return <></>;
  }
  return (
    <li>
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
  ref: React.RefObject<HTMLDivElement | null>;
  isOpen: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

const SettingsMenu = () => {
  const { t } = useTranslation();
  const filters = addPlanStore((state) => state.filters);

  const getFilterCount = (filterList: FilterName[]) => {
    return filters ? filterList.reduce((sum, filter) => sum + (filters[filter]?.length ?? 0), 0) : 0;
  };

  return (
    <SettingsSection>
      <Setting
        title={t('tool.settings.general.education-opportunity-type')}
        count={getFilterCount(['educationOpportunityType'])}
      >
        <FilterEducationOpportunityType />
      </Setting>
    </SettingsSection>
  );
};

const PlanOptionFilters = ({ ref, isOpen, onClose, isModal }: PlanOptionFiltersProps) => {
  const { t } = useTranslation();
  const resetSettings = addPlanStore((state) => state.resetSettings);
  const resetSection = (
    <div className="sticky bottom-0 bg-bg-gray-2 px-4 py-2">
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
      fullWidthContent
      content={
        <div className="bg-bg-gray w-full sm:text-body-sm text-body-sm-mobile flex flex-col gap-6 mb-11">
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
          <SettingsMenu ref={ref} />
          {resetSection}
        </div>
      }
    />
  ) : (
    <div className="bg-bg-gray-2 rounded-t mb-7 py-4 px-6 sm:text-body-sm text-body-sm-mobile flex flex-col gap-6 sticky top-[124px] z-10">
      <SettingsMenu ref={ref} />
      {resetSection}
    </div>
  );
};

export default PlanOptionFilters;
