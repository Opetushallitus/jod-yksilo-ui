import { Tooltip, TooltipContent, TooltipTrigger, useMediaQueries } from '@jod/design-system';
import React from 'react';

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
  let sizeClassName = '';
  if (halfWidth) {
    sizeClassName = sm ? ' w-1/2' : 'max-w-fit mr-11';
  }

  return (
    <Tooltip open={tooltipOpen} placement={tooltipPlacement}>
      <TooltipContent
        className={`bg-black text-white rounded-xl p-5 z-50 text-body-sm sm:text-body-md font-arial ${sizeClassName}`}
      >
        {tooltipContent}
      </TooltipContent>
      <TooltipTrigger asChild>
        <div>{children}</div>
      </TooltipTrigger>
    </Tooltip>
  );
};
