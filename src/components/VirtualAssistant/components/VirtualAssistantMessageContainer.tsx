import React from 'react';
import { useTranslation } from 'react-i18next';

import { Tag } from '@jod/design-system';

import { type OsaaminenDto } from '@/api/osaamiset';
import { useArrowKeyControls } from '@/hooks/useArrowKeyControls';

import { getVirtualAssistantConfig } from '../virtualAssistantConfig';
import type { VirtualAssistantMessageRow, VirtualAssistantVariant } from '../virtualAssistantTypes';
import { VirtualAssistantMessageBubble } from './VirtualAssistantMessageBubble';

export interface VirtualAssistantMessageContainerProps {
  row: VirtualAssistantMessageRow;
  type: VirtualAssistantVariant;
  selected: OsaaminenDto[];
  setSelected: React.Dispatch<React.SetStateAction<OsaaminenDto[]>>;
  animateTagToSelectedTab: (element: HTMLElement) => void;
}

export const VirtualAssistantMessageContainer = ({
  row,
  type,
  selected,
  setSelected,
  animateTagToSelectedTab,
}: VirtualAssistantMessageContainerProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const config = getVirtualAssistantConfig(type, t);
  const { ref, handleKeyDown, setLastClickedIndex } = useArrowKeyControls(row.ehdotukset ?? []);

  return (
    <>
      <VirtualAssistantMessageBubble message={row.message} isUser={true} />
      <VirtualAssistantMessageBubble
        message={row.answer ? row.answer : t('tool.my-own-data.virtual-assistant.loading')}
        isUser={false}
        testId={`${type}-virtual-assistant-message-bubble-answer${row.answer ? '' : '-loading'}`}
      />
      {row.ehdotukset && row.ehdotukset.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className={'font-bold text-heading-4-mobile sm:font-arial sm:text-heading-4'}>
            <span>{config.labels.proposed}</span>
            <div className="font-arial text-body-sm text-secondary-gray">{t('osaamissuosittelija.interest.add')}</div>
          </div>
          <div className="max-h-[228px] overflow-y-auto">
            <ul className="flex flex-wrap gap-3 p-1" ref={ref} onKeyDown={handleKeyDown}>
              {row.ehdotukset
                .filter((k) => !selected.some((val) => val.uri === k.uri))
                .map((k, index) => (
                  <li key={k.uri} className="max-w-full">
                    <Tag
                      label={k.nimi[language] ?? k.uri}
                      sourceType={config.tagSourceType}
                      onClick={(e) => {
                        animateTagToSelectedTab(e.currentTarget);
                        setLastClickedIndex(index);
                        setSelected((prev) => [k, ...prev]);
                      }}
                      variant="selectable"
                      testId="proposed-interest-tag"
                    />
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};
