import { Tooltip, TooltipContent, TooltipTrigger, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const TooltipWrapper = ({
  children,
  tooltipOpen,
  tooltipContent,
  tooltipPlacement = 'bottom',
  halfWidth = false,
}: {
  children: React.ReactNode;
  tooltipContent: React.ReactNode;
  tooltipOpen?: boolean;
  tooltipPlacement?: React.ComponentProps<typeof Tooltip>['placement'];
  halfWidth?: boolean;
}) => {
  const { sm } = useMediaQueries();
  const contentId = React.useId();
  const { t } = useTranslation();

  let sizeClassName = '';
  if (halfWidth) {
    sizeClassName = sm ? ' w-1/2' : 'max-w-fit mr-11';
  }

  return (
    <Tooltip open={tooltipOpen} placement={tooltipPlacement} data-testid="tooltip">
      <TooltipContent
        id={contentId}
        className={`bg-black text-white rounded-xl p-5 z-50 text-body-sm sm:text-body-md font-arial ${sizeClassName}`}
        data-testid="tooltip-content"
      >
        {tooltipContent}
      </TooltipContent>
      <TooltipTrigger asChild>
        <div
          data-testid="tooltip-trigger"
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          role="img"
          aria-roledescription={t('tooltip.info')}
          aria-describedby={contentId}
        >
          {children}
        </div>
      </TooltipTrigger>
    </Tooltip>
  );
};
