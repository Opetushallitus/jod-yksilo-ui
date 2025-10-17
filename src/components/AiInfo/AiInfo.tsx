import { AiInfoButton } from '@jod/design-system';
import { JodOpenInNew } from '@jod/design-system/icons';
import { Trans, useTranslation } from 'react-i18next';

const Link = ({ children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  return <a {...rest}>{children}</a>;
};

// Wrapper component for DS AiInfoButton
export const AiInfo = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const tooltipContent = (
    <div className="flex flex-col text-body-xs max-w-[290px] gap-3 leading-5">
      <p className="font-semibold">{t('ai-info-tooltip.title')}</p>
      <p>
        <Trans
          i18nKey="ai-info-tooltip.description"
          components={{
            Icon: <JodOpenInNew size={18} />,
            CustomLink: <Link href={`/${language}/${t('slugs.ai-usage')}`} className="inline-flex underline" />,
          }}
        />
      </p>
    </div>
  );

  return <AiInfoButton tooltipContent={tooltipContent} ariaLabel={t('ai-info-tooltip.aria-description')} />;
};
