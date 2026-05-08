import { useTranslation } from 'react-i18next';

import { cx } from '@jod/design-system';

import type { useVirtualAssistantChat } from '../hooks/useVirtualAssistantChat';
import { getVirtualAssistantConfig } from '../virtualAssistantConfig';
import type { VirtualAssistantVariant } from '../virtualAssistantTypes';
import { VirtualAssistantMessageBubble } from './VirtualAssistantMessageBubble';
import { VirtualAssistantMessageContainer } from './VirtualAssistantMessageContainer';

type VirtualAssistantChatState = ReturnType<typeof useVirtualAssistantChat>;

export interface ConversationTabPanelProps {
  type: VirtualAssistantVariant;
  chat: VirtualAssistantChatState['chat'];
  selection: VirtualAssistantChatState['selection'];
  tabs: VirtualAssistantChatState['tabs'];
}

export const ConversationTabPanel = ({ type, chat, selection, tabs }: ConversationTabPanelProps) => {
  const { t } = useTranslation();
  const config = getVirtualAssistantConfig(type, t);
  const { animateTagToSelectedTab, containerRef, history, messageContainerRef } = chat;
  const { selected, setSelected } = selection;
  const { conversationTabButtonId, conversationTabPanelId, selectedVisible } = tabs;

  return (
    <div
      id={conversationTabPanelId}
      role="tabpanel"
      tabIndex={0}
      aria-labelledby={conversationTabButtonId}
      className={cx('mb-4 flex min-h-0 flex-1 flex-col rounded-b-md bg-white py-2', selectedVisible && 'hidden')}
    >
      <div
        ref={containerRef}
        className="flex flex-1 flex-col overflow-y-auto text-primary-gray"
        data-testid="va-transcript"
      >
        <div className="my-2 flex flex-1 flex-col gap-5 px-4 py-3" ref={messageContainerRef}>
          <VirtualAssistantMessageBubble message={config.labels.description} isUser={false} />
          <VirtualAssistantMessageBubble message={config.labels.start} isUser={false} />
          {Object.entries(history).map(([key, row]) => (
            <VirtualAssistantMessageContainer
              key={key}
              row={row}
              animateTagToSelectedTab={animateTagToSelectedTab}
              selected={selected}
              type={type}
              setSelected={setSelected}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
