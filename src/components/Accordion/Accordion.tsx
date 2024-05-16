import { useState, useEffect, isValidElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

interface AccordionProps {
  title: React.ReactNode | string;
  children?: React.ReactNode;
}

const INITIAL_STATE = true;

export const Accordion = ({ title, children }: AccordionProps) => {
  const { t } = useTranslation();
  const [state, setState] = useState(INITIAL_STATE);
  const location = useLocation();
  const isTitleValidElement = isValidElement(title);
  const { i18n } = useTranslation();

  // Reset the state when the location changes
  useEffect(() => {
    setState(INITIAL_STATE);
  }, [location]);

  return (
    <>
      {isTitleValidElement ? (
        <div className="flex w-full items-center justify-between gap-x-4">
          {title}
          <button
            aria-label={state ? t('expand-less') : t('expand-more')}
            onClick={() => setState(!state)}
            className="flex"
          >
            <span className="material-symbols-outlined size-32 m-[-5px] select-none font-bold" aria-hidden>
              {state ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>
      ) : (
        <button
          aria-label={state ? t('expand-less') : t('expand-more')}
          onClick={() => setState(!state)}
          className="flex w-full items-center justify-between gap-x-4"
        >
          <div className="hyphens-auto text-heading-4" lang={i18n.language}>
            {title}
          </div>
          <span className="material-symbols-outlined size-32 m-[-5px] select-none font-bold" aria-hidden>
            {state ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      )}
      {state && children}
    </>
  );
};
