import type { useVirtualAssistantChat } from '../hooks/useVirtualAssistantChat';
import type { VirtualAssistantVariant } from '../virtualAssistantTypes';
import { ConversationTabPanel } from './ConversationTabPanel';
import { SelectedTabPanel } from './SelectedTabPanel';
import { VirtualAssistantInput } from './VirtualAssistantInput';
import { VirtualAssistantTabs } from './VirtualAssistantTabs';

type VirtualAssistantChatState = ReturnType<typeof useVirtualAssistantChat>;

export interface VirtualAssistantModalContentProps {
  type: VirtualAssistantVariant;
  chat: VirtualAssistantChatState['chat'];
  input: VirtualAssistantChatState['input'];
  selection: VirtualAssistantChatState['selection'];
  tabs: VirtualAssistantChatState['tabs'];
}

export const VirtualAssistantModalContent = ({
  type,
  chat,
  input,
  selection,
  tabs,
}: VirtualAssistantModalContentProps) => {
  return (
    <div className="flex flex-col h-full min-h-[45dvh] mb-4 px-5 md:px-9">
      <VirtualAssistantTabs type={type} selection={selection} tabs={tabs} />
      <ConversationTabPanel type={type} chat={chat} selection={selection} tabs={tabs} />
      <SelectedTabPanel type={type} selection={selection} tabs={tabs} />
      <VirtualAssistantInput input={input} selectedVisible={tabs.selectedVisible} />
    </div>
  );
};
