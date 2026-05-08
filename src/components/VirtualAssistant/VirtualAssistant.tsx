import React from 'react';
import toast from 'react-hot-toast/headless';
import { useTranslation } from 'react-i18next';

import { AiInfoButton, Button, Modal } from '@jod/design-system';

import { ModalHeader } from '@/components/ModalHeader';
import { useToolStore } from '@/stores/useToolStore';
import { removeDuplicatesByKey } from '@/utils';

import { VirtualAssistantModalContent } from './components/VirtualAssistantModalContent';
import { VirtualAssistantTooltipContent } from './components/VirtualAssistantTooltipContent';
import { useVirtualAssistantChat } from './hooks/useVirtualAssistantChat';
import { getVirtualAssistantConfig } from './virtualAssistantConfig';
import type { VirtualAssistantVariant } from './virtualAssistantTypes';

export const VirtualAssistant = ({ type, className }: { type: VirtualAssistantVariant; className?: string }) => {
  const { t } = useTranslation();
  const toolStore = useToolStore();
  const [isOpen, setIsOpen] = React.useState(false);

  const { chat, clearState, input, layout, selection, tabs } = useVirtualAssistantChat(type);
  const { isSelectedEmpty, selected } = selection;
  const config = getVirtualAssistantConfig(type, t);

  const headerText = config.labels.title;
  const topSlot = React.useMemo(() => <ModalHeader text={headerText} />, [headerText]);

  const handleSave = React.useCallback(() => {
    const newOsaamisetOrKiinnostukset = selected.map((k) => ({
      id: k.uri,
      nimi: k.nimi,
      kuvaus: k.kuvaus,
      tyyppi: 'KARTOITETTU' as const,
    }));

    if (type === 'competences') {
      const allOsaamiset = [...toolStore.osaamiset, ...newOsaamisetOrKiinnostukset];
      toolStore.setOsaamiset([...removeDuplicatesByKey(allOsaamiset, (o) => o.id)]);
      toast.success(config.labels.savedToast(selected.length));
    } else {
      const allKiinnostukset = [...toolStore.kiinnostukset, ...newOsaamisetOrKiinnostukset];
      toolStore.setKiinnostukset([...removeDuplicatesByKey(allKiinnostukset, (k) => k.id)]);
      toast.success(config.labels.savedToast(selected.length));
    }

    clearState();
    setIsOpen(false);
  }, [clearState, config.labels, selected, toolStore, type]);

  return (
    <div className={className}>
      <div className="flex gap-3">
        <Button
          label={config.labels.open}
          variant="gray"
          size="sm"
          iconSide="right"
          onClick={() => setIsOpen(true)}
          ariaHaspopup="dialog"
          testId="open-va"
        />
        <AiInfoButton
          tooltipContent={<VirtualAssistantTooltipContent type={type} />}
          ariaLabel={t('ai-info-tooltip.aria-description')}
          placement="top"
        />
      </div>
      <Modal
        name={headerText}
        open={isOpen}
        fullWidthContent
        className="sm:h-full!"
        topSlot={topSlot}
        content={
          <VirtualAssistantModalContent type={type} chat={chat} input={input} selection={selection} tabs={tabs} />
        }
        footer={
          <div className="flex flex-1 flex-row justify-end gap-3">
            <Button
              onClick={() => {
                clearState();
                setIsOpen(false);
              }}
              label={t('common:cancel')}
              size={layout.sm ? 'lg' : 'sm'}
            />
            <Button
              onClick={handleSave}
              label={t('save')}
              variant="accent"
              disabled={isSelectedEmpty}
              size={layout.sm ? 'lg' : 'sm'}
            />
          </div>
        }
      />
    </div>
  );
};
