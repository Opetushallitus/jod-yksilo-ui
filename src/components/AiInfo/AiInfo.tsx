import { AiInfoButton } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { MdArrowForward } from 'react-icons/md';
import { Link } from 'react-router';

// Wrapper component for DS AiInfoButton
export const AiInfo = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const tooltipContent = (
    <div className="flex flex-col text-body-md">
      <p className="text-heading-4">{t('ai-info-tooltip.title')}:</p>
      <p className="whitespace-break-spaces">{t('ai-info-tooltip.description')}</p>
      <Link
        to={`/${language}/${t('slugs.basic-information')}/${t('slugs.about-ai')}`}
        className="flex flex-row items-center mt-4 gap-4 text-heading-4"
      >
        <span>{t('ai-info-tooltip.ai-and-compentency-path')}</span>
        <MdArrowForward size={24} />
      </Link>
    </div>
  );

  return <AiInfoButton tooltipContent={tooltipContent} ariaLabel={t('ai-info-tooltip.aria-description')} />;
};
