import { animateElementToTarget } from '@/utils/animations';
import { useMediaQueries } from '@jod/design-system';
import React from 'react';
import type { VirtualAssistantVariant } from '../virtualAssistantTypes';
import { useVirtualAssistantConversation } from './useVirtualAssistantConversation';
import { useVirtualAssistantSelection } from './useVirtualAssistantSelection';

export const useVirtualAssistantChat = (type: VirtualAssistantVariant) => {
  const { sm, reduceMotion } = useMediaQueries();
  const { chat: conversationChat, clearConversation, input } = useVirtualAssistantConversation(type, reduceMotion);
  const { clearSelection, ...selection } = useVirtualAssistantSelection(reduceMotion);

  const [selectedVisible, setSelectedVisible] = React.useState(false);

  const titleId = React.useId();
  const conversationTabButtonId = React.useId();
  const conversationTabPanelId = React.useId();
  const selectedTabButtonId = React.useId();
  const selectedTabPanelId = React.useId();
  const selectedTabButtonRef = React.useRef<HTMLButtonElement>(null);

  const clearState = React.useCallback(() => {
    clearConversation();
    clearSelection();
    setSelectedVisible(false);
  }, [clearConversation, clearSelection]);

  const animateTagToSelectedTab = React.useCallback(
    (element: HTMLElement) => {
      const selectedTabButton = selectedTabButtonRef.current;
      if (!reduceMotion && selectedTabButton) {
        animateElementToTarget(element, selectedTabButton);
      }
    },
    [reduceMotion],
  );

  return {
    chat: {
      animateTagToSelectedTab,
      ...conversationChat,
    },
    clearState,
    input,
    layout: {
      sm,
    },
    selection,
    tabs: {
      conversationTabButtonId,
      conversationTabPanelId,
      selectedTabButtonId,
      selectedTabButtonRef,
      selectedTabPanelId,
      selectedVisible,
      setSelectedVisible,
      titleId,
    },
  };
};
