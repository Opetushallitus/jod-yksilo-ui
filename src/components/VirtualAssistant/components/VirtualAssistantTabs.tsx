import { cx } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
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
    <div role="tablist" aria-labelledby={titleId} className="flex flex-row gap-1 min-h-9">
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
          'flex-1 bg-white rounded-t-md p-3 text-[1rem] leading-[110%] font-bold tracking-[0.16px] truncate cursor-pointer hover:underline',
          selectedVisible ? 'text-primary-gray bg-bg-gray-2' : 'text-accent bg-white',
        )}
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
          'flex-1 rounded-t-md p-3 text-[1rem] leading-[110%] font-bold tracking-[0.16px] truncate cursor-pointer hover:underline',
          selectedVisible ? 'text-accent bg-white' : 'text-primary-gray bg-bg-gray-2',
        )}
      >
        {config.labels.selectedTab}
        {!isSelectedEmpty && ` (${selected.length})`}
      </button>
    </div>
  );
};
