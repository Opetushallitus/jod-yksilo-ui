import { LIMITS } from '@/constants';
import { cx, InputField } from '@jod/design-system';
import { JodSend } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { useVirtualAssistantChat } from '../hooks/useVirtualAssistantChat';

type VirtualAssistantChatState = ReturnType<typeof useVirtualAssistantChat>;

export interface VirtualAssistantInputProps {
  input: VirtualAssistantChatState['input'];
  selectedVisible: boolean;
}

export const VirtualAssistantInput = ({ input, selectedVisible }: VirtualAssistantInputProps) => {
  const { t } = useTranslation();
  const { handleInputKeyDown, isSendDisabled, setValue, updateHistory, value } = input;

  return (
    <div className={cx('flex gap-4 items-center mb-1', selectedVisible && 'hidden')}>
      <InputField
        value={value}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
        onKeyDown={handleInputKeyDown}
        maxLength={LIMITS.TEXT_INPUT}
        hideLabel
        placeholder={t('tool.my-own-data.virtual-assistant.respond-to-chat')}
        className="p-4! text-[1rem]! leading-[1.125rem]!"
        testId="va-input"
        widthVariant="full"
      />
      <button
        type="button"
        disabled={isSendDisabled}
        onClick={updateHistory}
        aria-label={t('tool.my-own-data.virtual-assistant.send')}
        data-testid="va-send"
        className="text-secondary-gray size-7 cursor-pointer disabled:cursor-not-allowed"
      >
        <JodSend aria-hidden="true" />
      </button>
    </div>
  );
};
