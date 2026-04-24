import { AnchorLink } from '@/components/AnchorLink/AnchorLink';
import { JodOpenInNew } from '@jod/design-system/icons';
import { Trans, useTranslation } from 'react-i18next';
import { getVirtualAssistantConfig } from '../virtualAssistantConfig';
import type { VirtualAssistantVariant } from '../virtualAssistantTypes';

export const VirtualAssistantTooltipContent = ({ type }: { type: VirtualAssistantVariant }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const config = getVirtualAssistantConfig(type, t);

  return (
    <div className="flex flex-col text-body-xs max-w-[290px] gap-3 leading-5">
      <p className="font-semibold">{t('tool.my-own-data.virtual-assistant.open-tooltip.title')}</p>
      <p>{config.labels.tooltipDescription}</p>
      <p>{t('tool.my-own-data.virtual-assistant.open-tooltip.description-2')}</p>
      <p>
        <Trans
          i18nKey="ai-info-tooltip.description-summary"
          components={{
            Icon: <JodOpenInNew size={18} ariaLabel={t('common:external-link')} />,
            CustomLink: (
              <AnchorLink
                href={`/${language}/${t('common:slugs.ai-usage')}`}
                className="inline-flex underline"
                target="_blank"
              />
            ),
          }}
        />
      </p>
    </div>
  );
};
