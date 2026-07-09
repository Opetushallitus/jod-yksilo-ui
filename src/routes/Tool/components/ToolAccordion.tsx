import React from 'react';

import { Accordion } from '@jod/design-system';

import { hyphenize } from '@/utils';

const ToolAccordion = ({
  title,
  description,
  children,
  ref,
  isOpen: controlledIsOpen,
  setIsOpen: controlledSetIsOpen,
  testId,
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
  ref?: React.Ref<HTMLDivElement>;
  setIsOpen?: (isOpen: boolean) => void;
  isOpen?: boolean;
  testId?: string;
}) => {
  const [internalIsOpen, setInternalIsOpen] = React.useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const setIsOpen = isControlled && controlledSetIsOpen ? controlledSetIsOpen : setInternalIsOpen;
  const id = hyphenize(title);
  const triggerId = `accordion-${id}`;
  const contentId = `accordion-${id}-content`;
  const getTestId = (postfix: string) => (testId ? `${testId}-${postfix}` : undefined);

  return (
    <div className="rounded bg-white px-5 py-6" ref={ref} data-testid={testId}>
      <Accordion
        isOpen={isOpen}
        caretPosition="top"
        triggerId={triggerId}
        ariaControls={contentId}
        setIsOpen={setIsOpen}
        title={title}
        initialState={false}
        collapsedContent={
          description && (
            <span className="font-arial text-body-sm text-pretty hyphens-auto text-secondary-gray">{description}</span>
          )
        }
        testId={getTestId('accordion')}
      >
        <section id={contentId} aria-labelledby={triggerId} data-testid={getTestId('content-section')}>
          {children}
        </section>
      </Accordion>
    </div>
  );
};

export default ToolAccordion;
