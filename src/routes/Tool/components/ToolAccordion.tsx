import { Accordion } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

const ToolAccordion = ({
  title,
  description,
  children,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const id = title.toLocaleLowerCase().replace(/\s+/g, '-');
  const triggerId = `accordion-${id}`;
  const contentId = `accordion-${id}-content`;

  return (
    <div className="bg-white rounded py-6 px-5">
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
