import { useTranslation } from 'react-i18next';

import { Button, tidyClasses as tc } from '@jod/design-system';
import { JodArrowRight } from '@jod/design-system/icons';

import { getLinkTo } from '@/utils/routeUtils';

interface ToolCardProps {
  /** Class name for the banner wrapper element */
  className?: string;
  /** Variant for the button */
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];
  /** Data-testId attribute for the button */
  testId?: string;
  /** Optional query parameters to append to the tool URL */
  linkParams?: string;
  /** Optional title override */
  title?: string;
  /** Optional description override */
  description?: string;
}
/**
 * Card component that links to the main tool page.
 */
export const ToolCard = ({
  testId = 'go-to-tool',
  linkParams,
  className = '',
  title,
  description,
  buttonVariant = 'white',
}: ToolCardProps) => {
  const { t, i18n } = useTranslation();
  const to = linkParams
    ? `/${i18n.language}/${t('slugs.tool.index')}?${linkParams}`
    : `/${i18n.language}/${t('slugs.tool.index')}`;

  return (
    <div className={tc(`flex flex-col gap-5 rounded-lg bg-primary-1-dark-2 p-6 ${className}`)}>
      <h2 className="mr-2 text-heading-2-mobile text-white sm:text-heading-2">{title ?? t('tool.banner.title')}</h2>
      <p className="text-body-lg-mobile text-white sm:text-body-lg">{description ?? t('tool.banner.description')}</p>
      <div className="mt-4">
        <Button
          label={t('tool.banner.link-text')}
          variant={buttonVariant}
          size="lg"
          linkComponent={getLinkTo(to)}
          iconSide="right"
          testId={testId}
          icon={<JodArrowRight />}
          data-testid="tool-card-button"
        />
      </div>
    </div>
  );
};
