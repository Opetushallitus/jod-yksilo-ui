import { AiInfoButton } from '@jod/design-system';
import { JodOpenInNew } from '@jod/design-system/icons';
import { Trans, useTranslation } from 'react-i18next';

const Link = ({ children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  return <a {...rest}>{children}</a>;
};
interface AiInfoProps {
  type?: 'tool' | 'education-opportunity' | 'job-opportunity';
  size?: number;
}

// Wrapper component for DS AiInfoButton
export const AiInfo = ({ type = 'tool', size }: AiInfoProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const tooltipContent = (
    <div className="flex flex-col text-body-xs max-w-[290px] gap-3 leading-5">
      <p className="font-semibold">{t('ai-info-tooltip.title')}</p>
      <div>
        <div>
          {type === 'tool' ? (
            <div>
              {t('ai-info-tooltip.description-tool-intro')}
              <ul className="list-disc ml-4">
                <li>{t('ai-info-tooltip.description-tool-item-1')}</li>
                <li>{t('ai-info-tooltip.description-tool-item-2')}</li>
                <li>{t('ai-info-tooltip.description-tool-item-3')}</li>
              </ul>
            </div>
          ) : (
            <div>
              {t('ai-info-tooltip.description-opportunity-intro')}
              <ul className="list-disc ml-4">
                <li>{t('ai-info-tooltip.description-opportunity-item-1')}</li>
                <li>{t('ai-info-tooltip.description-opportunity-item-2')}</li>
                {type === 'job-opportunity' && <li>{t('ai-info-tooltip.description-opportunity-item-3')}</li>}
              </ul>
              {type === 'education-opportunity' && (
                <p className="mt-2">{t('ai-info-tooltip.description-opportunity-education-note')}</p>
              )}
            </div>
          )}
          <p className="mt-2">{t('ai-info-tooltip.description-disclaimer')}</p>
        </div>
        <br />
        <Trans
          i18nKey="ai-info-tooltip.description-summary"
          components={{
            Icon: <JodOpenInNew size={18} ariaLabel={t('common:external-link')} />,
            CustomLink: (
              <Link
                href={`/${language}/${t('common:slugs.ai-usage')}`}
                className="inline-flex underline"
                target="_blank"
              />
            ),
          }}
        ></Trans>
      </div>
    </div>
  );

  return <AiInfoButton size={size} tooltipContent={tooltipContent} ariaLabel={t('ai-info-tooltip.aria-description')} />;
};
