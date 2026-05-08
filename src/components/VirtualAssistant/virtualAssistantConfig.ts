import { OSAAMINEN_COLOR_MAP } from '@/constants';

import type { VirtualAssistantVariant } from './virtualAssistantTypes';

type Translate = (key: string, options?: { count: number }) => string;

export const getVirtualAssistantConfig = (type: VirtualAssistantVariant, t: Translate) => {
  if (type === 'competences') {
    return {
      mode: 'OSAAMINEN',
      tagSourceType: OSAAMINEN_COLOR_MAP['MUU_OSAAMINEN'],
      labels: {
        title: t('tool.my-own-data.competences.virtual-assistant.title'),
        open: t('tool.my-own-data.competences.virtual-assistant.open'),
        description: t('tool.my-own-data.competences.virtual-assistant.description'),
        start: t('tool.my-own-data.competences.virtual-assistant.start'),
        selected: t('tool.my-own-data.competences.virtual-assistant.selected'),
        selectedTab: t('tool.my-own-data.competences.virtual-assistant.selected-tab'),
        emptySelection: t('osaamissuosittelija.competence.none-selected'),
        proposed: t('proposed-competences'),
        savedToast: (count: number) =>
          t('tool.my-own-data.competences.virtual-assistant.x-added', {
            count,
          }),
        tooltipDescription: t('tool.my-own-data.competences.virtual-assistant.open-tooltip.description-1'),
      },
    } as const;
  }

  return {
    mode: 'KIINNOSTUKSET',
    tagSourceType: OSAAMINEN_COLOR_MAP['KIINNOSTUS'],
    labels: {
      title: t('tool.my-own-data.interests.virtual-assistant.title'),
      open: t('tool.my-own-data.interests.virtual-assistant.open'),
      description: t('tool.my-own-data.interests.virtual-assistant.description'),
      start: t('tool.my-own-data.interests.virtual-assistant.start'),
      selected: t('tool.my-own-data.interests.virtual-assistant.selected'),
      selectedTab: t('tool.my-own-data.interests.virtual-assistant.selected-tab'),
      emptySelection: t('osaamissuosittelija.interest.none-selected'),
      proposed: t('proposed-interests'),
      savedToast: (count: number) =>
        t('tool.my-own-data.interests.virtual-assistant.x-added', {
          count,
        }),
      tooltipDescription: t('tool.my-own-data.interests.virtual-assistant.open-tooltip.description-1'),
    },
  } as const;
};
