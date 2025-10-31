import { getLinkTo } from '@/utils/routeUtils';
import { Button, tidyClasses } from '@jod/design-system';
import { JodArrowRight } from '@jod/design-system/icons';
import { useTranslation } from 'react-i18next';

interface ToolCardProps {
  /** Class name for the banner wrapper element */
  className?: string;
  /** Variant for the button */
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];
  /** Data-testId attribute for the button */
  testId?: string;
  /** Optional query parameters to append to the tool URL */
  linkParams?: string;
}
/**
 * Card component that links to the main tool page.
 */
export const ToolCard = ({ testId = 'go-to-tool', linkParams, className, buttonVariant = 'white' }: ToolCardProps) => {
  const { t, i18n } = useTranslation();
  const to = linkParams
    ? `/${i18n.language}/${t('slugs.tool.index')}?${linkParams}`
    : `/${i18n.language}/${t('slugs.tool.index')}`;

  return (
    <div className={tidyClasses(`flex flex-col rounded-lg p-6 gap-5 bg-secondary-1-dark-2 ${className}`)}>
      <div className="text-heading-2 text-white mr-2">{t('tool.banner.title')}</div>
      <p className="text-body-lg text-white">{t('tool.banner.description')}</p>
      <div className="mt-4">
        <Button
          label={t('tool.banner.link-text')}
          variant={buttonVariant}
          size="lg"
          linkComponent={getLinkTo(to)}
          iconSide="right"
          dataTestId={testId}
          icon={<JodArrowRight />}
        />
      </div>
    </div>
  );
};
