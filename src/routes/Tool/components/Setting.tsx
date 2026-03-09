import { hyphenize } from '@/utils';
import { Accordion, cx, useMediaQueries } from '@jod/design-system';
import React from 'react';

interface SettingProps {
  title: string;
  /** Amount of selected settings/filters */
  count?: number;
  hidden?: boolean;
  initiallyOpen?: boolean;
  children: React.ReactNode;
  /** Ref is used to reference accordion open button for focusing */
  ref?: React.RefObject<HTMLDivElement | null>;
  className?: string;
  testId?: string;
  id?: string;
  hideTopBorder?: boolean;
}
export const Setting = ({
  title,
  children,
  hidden,
  hideTopBorder,
  initiallyOpen,
  ref,
  count,
  className = '',
  testId,
  id,
}: SettingProps) => {
  const { sm } = useMediaQueries();
  const [isOpen, setIsOpen] = React.useState(initiallyOpen ?? false);
  const titleText = title + (count ? ` (${count})` : '');
  const triggerId = `accordion-${id ?? hyphenize(title)}`;
  const contentId = `${triggerId}-content`;

  if (hidden) {
    return <></>;
  }
  return (
    <li
      className={cx(`py-3 ${className}`, {
        'border-t-2 border-primary-light-2': !hideTopBorder,
        'pl-3': sm,
      })}
      data-testid={testId ?? triggerId}
    >
      <Accordion
        triggerId={triggerId}
        ariaControls={contentId}
        title={
          <div ref={ref} className="text-left cursor-pointer p-1 text-body-sm" aria-controls={id}>
            {titleText}
          </div>
        }
        ariaLabel={titleText}
        initialState={initiallyOpen ?? false}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      >
        {
          <section className="pl-1 pt-1 mt-3" id={contentId} aria-labelledby={triggerId}>
            {children}
          </section>
        }
      </Accordion>
    </li>
  );
};
