import { AiInfoButton } from '@jod/design-system';
import { JodOpenInNew } from '@jod/design-system/icons';
import { Trans, useTranslation } from 'react-i18next';

const Link = ({ children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  return <a {...rest}>{children}</a>;
};
interface AiInfoProps {
  type?: 'tool' | 'opportunity';
}

// Wrapper component for DS AiInfoButton
export const AiInfo = ({ type = 'tool' }: AiInfoProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const tooltipContent = (
    <div className="flex flex-col text-body-xs max-w-[290px] gap-3 leading-5">
      <p className="font-semibold">{t('ai-info-tooltip.title')}</p>
      <div>
        <div>
          {t('ai-info-tooltip.description-intro')}
          {type === 'tool' ? (
            <ul className="list-disc ml-4">
              <li>{t('ai-info-tooltip.description-1-item-1')}</li>
              <li>{t('ai-info-tooltip.description-1-item-2')}</li>
              <li>{t('ai-info-tooltip.description-1-item-3')}</li>
            </ul>
          ) : (
            <ul className="list-disc ml-4">
              <li>{t('ai-info-tooltip.description-2-item-1')}</li>
              <li>{t('ai-info-tooltip.description-2-item-2')}</li>
              <li>{t('ai-info-tooltip.description-2-item-3')}</li>
              <li>{t('ai-info-tooltip.description-2-item-4')}</li>
            </ul>
          )}
        </div>
        <br />
        <Trans
          i18nKey="ai-info-tooltip.description-summary"
          components={{
            Icon: <JodOpenInNew size={18} ariaLabel={t('external-link')} />,
            CustomLink: <Link href={`/${language}/${t('slugs.ai-usage')}`} className="inline-flex underline" />,
          }}
        ></Trans>
      </div>
    </div>
  );

  return <AiInfoButton tooltipContent={tooltipContent} ariaLabel={t('ai-info-tooltip.aria-description')} />;
};
