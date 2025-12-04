import { hyphenize } from '@/utils';
import { Accordion } from '@jod/design-system';
import React from 'react';

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
  description: string;
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

  return (
    <div className="bg-white rounded py-6 px-5" ref={ref} data-testid={testId}>
      <Accordion
        isOpen={isOpen}
        caretPosition="top"
        triggerId={triggerId}
        ariaControls={contentId}
        setIsOpen={setIsOpen}
        title={title}
        initialState={false}
        collapsedContent={
          <span className="font-arial text-body-sm text-secondary-gray text-pretty hyphens-auto">{description}</span>
        }
        testId="tool-accordion-button"
      >
        <section id={contentId} aria-labelledby={triggerId}>
          {children}
        </section>
      </Accordion>
    </div>
  );
};

export default ToolAccordion;
