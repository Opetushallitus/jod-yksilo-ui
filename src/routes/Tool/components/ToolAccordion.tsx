import { Accordion } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

const ToolAccordion = ({
  title,
  description,
  children,
  ref,
  isOpen: controlledIsOpen,
  setIsOpen: controlledSetIsOpen,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
  ref?: React.Ref<HTMLDivElement>;
  setIsOpen?: (isOpen: boolean) => void;
  isOpen?: boolean;
}) => {
  const { t } = useTranslation();
  const [internalIsOpen, setInternalIsOpen] = React.useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const setIsOpen = isControlled && controlledSetIsOpen ? controlledSetIsOpen : setInternalIsOpen;
  const id = title.toLocaleLowerCase().replace(/\s+/g, '-');
  const triggerId = `accordion-${id}`;
  const contentId = `accordion-${id}-content`;

  return (
    <div className="bg-white rounded py-6 px-5" ref={ref}>
      <Accordion
        ariaLabel={title}
        isOpen={isOpen}
        caretPosition="top"
        triggerId={triggerId}
        ariaControls={contentId}
        setIsOpen={setIsOpen}
        title={
          <>
            <span className="flex flex-col text-left cursor-pointer w-full text-heading-3">{t(title)}</span>
            {!isOpen && (
              <span className="font-arial text-body-sm text-secondary-gray text-pretty hyphens-auto">
                {t(description)}
              </span>
            )}
          </>
        }
        initialState={false}
      >
        <section className="pl-4" id={contentId} aria-labelledby={triggerId}>
          {children}
        </section>
      </Accordion>
    </div>
  );
};

export default ToolAccordion;
