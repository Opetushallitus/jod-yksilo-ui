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
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="bg-white rounded py-6 px-5">
      <Accordion
        titleText={title}
        isOpen={isOpen}
        caretPosition="top"
        setIsOpen={setIsOpen}
        title={
          (
            <button onClick={() => setIsOpen(!isOpen)} className="flex flex-col text-left cursor-pointer w-full">
              <span className="text-heading-3 hover:underline hover:text-accent">{t(title)}</span>
              {!isOpen && (
                <span className="font-arial text-body-sm text-secondary-gray text-pretty hyphens-auto">
                  {t(description)}
                </span>
              )}
            </button>
          ) as React.ReactNode
        }
        lang={language}
        initialState={false}
      >
        {children}
      </Accordion>
    </div>
  );
};

export default ToolAccordion;
