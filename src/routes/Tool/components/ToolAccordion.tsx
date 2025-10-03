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

  return (
    <div className="bg-white rounded py-6 px-5">
      <Accordion
        ariaLabel={title}
        isOpen={isOpen}
        caretPosition="top"
        setIsOpen={setIsOpen}
        title={
          <>
            <span className="flex flex-col text-left cursor-pointer w-full text-heading-3" aria-controls={id}>
              {t(title)}
            </span>
            {!isOpen && (
              <span className="font-arial text-body-sm text-secondary-gray text-pretty hyphens-auto">
                {t(description)}
              </span>
            )}
          </>
        }
        initialState={false}
      >
        <section className="pl-4" id={id} aria-labelledby={id}>
          {children}
        </section>
      </Accordion>
    </div>
  );
};

export default ToolAccordion;
