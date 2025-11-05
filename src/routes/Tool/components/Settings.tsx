import { Accordion } from '@jod/design-system';
import React from 'react';

export const Setting = ({
  title,
  children,
  hidden,
  ref,
  count,
  className,
  testId,
}: {
  title: string;
  /** Amount of selected settings/filters */
  count?: number;
  hidden?: boolean;
  children: React.ReactNode;
  /** Ref is used to reference accordion open button for focusing */
  ref?: React.RefObject<HTMLSpanElement | null>;
  className?: string;
  testId?: string;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const titleText = title + (count ? ` (${count})` : '');
  const id = title.toLocaleLowerCase().replace(/\s+/g, '-');
  const triggerId = `accordion-${id}`;
  const contentId = `accordion-${id}-content`;

  if (hidden) {
    return <></>;
  }
  return (
    <li className={`border-t-2 border-primary-light-2 pt-3 pl-3 ${className}`} data-testid={testId}>
      <Accordion
        triggerId={triggerId}
        ariaControls={contentId}
        title={
          <span ref={ref} className="block w-full text-left cursor-pointer p-1 text-body-sm" aria-controls={id}>
            {titleText}
          </span>
        }
        ariaLabel={titleText}
        initialState={false}
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
