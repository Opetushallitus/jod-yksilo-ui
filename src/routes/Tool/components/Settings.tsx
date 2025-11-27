import { Accordion } from '@jod/design-system';
import React from 'react';

export const Setting = ({
  title,
  children,
  hidden,
  initiallyOpen,
  ref,
  count,
  className,
  testId,
  id,
}: {
  title: string;
  /** Amount of selected settings/filters */
  count?: number;
  hidden?: boolean;
  initiallyOpen?: boolean;
  children: React.ReactNode;
  /** Ref is used to reference accordion open button for focusing */
  ref?: React.RefObject<HTMLSpanElement | null>;
  className?: string;
  testId?: string;
  id?: string;
}) => {
  const [isOpen, setIsOpen] = React.useState(initiallyOpen ?? false);
  const titleText = title + (count ? ` (${count})` : '');
  const triggerId = `accordion-${id ?? title.toLocaleLowerCase().replaceAll(/\s+/g, '-')}`;
  const contentId = `${triggerId}-content`;

  if (hidden) {
    return <></>;
  }
  return (
    <li className={`border-t-2 border-primary-light-2 pt-3 pl-3 ${className}`} data-testid={testId ?? triggerId}>
      <Accordion
        triggerId={triggerId}
        ariaControls={contentId}
        title={
          <span ref={ref} className="block w-full text-left cursor-pointer p-1 text-body-sm" aria-controls={id}>
            {titleText}
          </span>
        }
        ariaLabel={titleText}
        initialState={initiallyOpen ?? false}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      >
        <section className="pl-1 pt-1" id={contentId} aria-labelledby={triggerId}>
          {children}
        </section>
      </Accordion>
    </li>
  );
};
