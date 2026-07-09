import { useTranslation } from 'react-i18next';

import { cx } from '@jod/design-system';

import type { useVirtualAssistantChat } from '../hooks/useVirtualAssistantChat';
import { getVirtualAssistantConfig } from '../virtualAssistantConfig';
import type { VirtualAssistantVariant } from '../virtualAssistantTypes';

type VirtualAssistantChatState = ReturnType<typeof useVirtualAssistantChat>;

export interface VirtualAssistantTabsProps {
  type: VirtualAssistantVariant;
  selection: VirtualAssistantChatState['selection'];
  tabs: VirtualAssistantChatState['tabs'];
}

export const VirtualAssistantTabs = ({ type, selection, tabs }: VirtualAssistantTabsProps) => {
  const { t } = useTranslation();
  const config = getVirtualAssistantConfig(type, t);
  const { isSelectedEmpty, selected, setSelected, setTagsPendingRemoval, tagsPendingRemoval } = selection;
  const {
    conversationTabButtonId,
    conversationTabPanelId,
    selectedTabButtonId,
    selectedTabButtonRef,
    selectedTabPanelId,
    selectedVisible,
    setSelectedVisible,
    titleId,
  } = tabs;

  return (
    <div role="tablist" aria-labelledby={titleId} className="flex min-h-9 flex-row gap-1">
      <button
        id={conversationTabButtonId}
        type="button"
        role="tab"
        onClick={() => {
          setSelectedVisible(false);
          setSelected((prevState) => {
            return prevState.filter((k) => !tagsPendingRemoval.includes(k.uri));
          });
          setTagsPendingRemoval([]);
        }}
        aria-selected={selectedVisible ? 'false' : 'true'}
        aria-controls={conversationTabPanelId}
        className={cx(
          'font-bold flex-1 cursor-pointer truncate rounded-t-md bg-white p-3 text-[1rem] leading-[110%] tracking-[0.16px] hover:underline',
          selectedVisible ? 'bg-bg-gray-2 text-primary-gray' : 'bg-white text-accent',
        )}
        data-testid="virtual-assistant-tabs-conversation-tab-button"
      >
        {t('tool.my-own-data.virtual-assistant.conversation')}
      </button>
      <button
        id={selectedTabButtonId}
        ref={selectedTabButtonRef}
        type="button"
        role="tab"
        onClick={() => {
          setSelectedVisible(true);
        }}
        aria-selected={selectedVisible ? 'true' : 'false'}
        aria-controls={selectedTabPanelId}
        className={cx(
          'font-bold flex-1 cursor-pointer truncate rounded-t-md p-3 text-[1rem] leading-[110%] tracking-[0.16px] hover:underline',
          selectedVisible ? 'bg-white text-accent' : 'bg-bg-gray-2 text-primary-gray',
        )}
        data-testid="virtual-assistant-tabs-selected-tab-button"
      >
        {config.labels.selectedTab}
        {!isSelectedEmpty && ` (${selected.length})`}
      </button>
    </div>
  );
};
