import { FilterName, useToolStore } from '@/stores/useToolStore';
import { Accordion, Button, Modal } from '@jod/design-system';
import { JodClose } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import FilterOpporunityType from './components/filters/FilterOpportunityType';
import OpportunitiesSorting from './components/filters/OpportunitiesSorting';
import OpportunityWeight from './components/filters/OpportunityWeight';

const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <div>
      <div className="border-b-2 border-border-gray pb-3 mb-3">{title}</div>
      <ul className="flex flex-col gap-3">{children}</ul>
    </div>
  );
};

const Setting = ({
  title,
  children,
  ref,
  count,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
  /** Ref is used to reference accordion open button for focusing */
  ref?: React.RefObject<HTMLDivElement | null>;
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const [isOpen, setIsOpen] = React.useState(false);
  const countStr = count ? ` (${count})` : '';

  return (
    <li>
      <Accordion
        title={
          <div ref={ref} className="w-full">
            <button onClick={() => setIsOpen(!isOpen)} className="block w-full text-left cursor-pointer p-1">
              <span>{title + countStr}</span>
            </button>
          </div>
        }
        lang={language}
        titleText={t('sorting')}
        initialState={false}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      >
        <div className="pl-4">{children}</div>
      </Accordion>
    </li>
  );
};

export interface ToolSettingsProps {
  ref: React.RefObject<HTMLDivElement | null>;
  isOpen: boolean;
  onClose?: () => void;
  isModal?: boolean;
}
const SettingsMenu = ({ ref }: Pick<ToolSettingsProps, 'ref'>) => {
  const { t } = useTranslation();

  const filters = useToolStore((state) => state.filters);

  const getFilterCount = (filter: FilterName) => filters?.[filter]?.length ?? 0;

  return (
    <SettingsSection title={t('tool.settings.general.title')}>
      <Setting title={t('tool.settings.general.filter')} ref={ref} count={getFilterCount('opportunityType')}>
        <FilterOpporunityType />
      </Setting>
      <Setting title={t('tool.settings.general.weight')}>
        <OpportunityWeight />
      </Setting>
      <Setting title={t('tool.settings.general.sorting')}>
        <OpportunitiesSorting />
      </Setting>
    </SettingsSection>
  );
};

const ToolSettings = ({ ref, isOpen, onClose, isModal }: ToolSettingsProps) => {
  const { t } = useTranslation();
  const resetSettings = useToolStore((state) => state.resetSettings);
  const resetSection = (
    <>
      <hr className="border-0 border-b-2 border-border-gray mt-6 -mb-5" />
      <Button
        variant="plain"
        size="sm"
        serviceVariant="yksilo"
        onClick={resetSettings}
        label={t('tool.settings.reset')}
      />
    </>
  );

  return isModal ? (
    <Modal
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

export default ToolSettings;
