import { tidyClasses as tc, Tooltip, TooltipContent, TooltipTrigger } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const TooltipWrapper = ({
  children,
  tooltipOpen,
  tooltipContent,
  tooltipPlacement = 'bottom',
  className = '',
}: {
  children: React.ReactNode;
  tooltipContent: React.ReactNode;
  tooltipOpen?: boolean;
  tooltipPlacement?: React.ComponentProps<typeof Tooltip>['placement'];
  className?: string;
}) => {
  const contentId = React.useId();
  const { t } = useTranslation();

  return (
    <Tooltip open={tooltipOpen} placement={tooltipPlacement} data-testid="tooltip">
      <TooltipContent
        id={contentId}
        className={tc([
          'font-arial',
          'text-body-sm',
          'sm:text-body-md',
          'sm:max-w-[296px]',
          'max-w-[256px]',
          'p-4',
          'bg-primary-gray',
          'text-white',
          'rounded-md',
          'z-50',
          className,
        ])}
        data-testid="tooltip-content"
      >
        {tooltipContent}
      </TooltipContent>
      <TooltipTrigger
        asChild
        data-testid="tooltip-trigger"
        className="select-none"
        tabIndex={0}
        aria-roledescription={t('tooltip.info')}
        aria-describedby={contentId}
        aria-label={typeof tooltipContent === 'string' ? tooltipContent : t('tooltip.info')}
      >
        {children}
      </TooltipTrigger>
    </Tooltip>
  );
};
