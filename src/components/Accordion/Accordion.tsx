import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

interface AccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
}

const INITIAL_STATE = true;

export const Accordion = ({ title, children }: AccordionProps) => {
  const { t } = useTranslation();
  const [state, setState] = useState(INITIAL_STATE);
  const location = useLocation();

  // Reset the state when the location changes
  useEffect(() => {
    setState(INITIAL_STATE);
  }, [location]);

  return (
    <>
      <button
        aria-label={state ? t('expand-less') : t('expand-more')}
        onClick={() => setState(!state)}
        className="flex w-full items-center justify-between gap-x-4"
      >
        {title}
        <span className="material-symbols-outlined size-32 m-[-5px] select-none font-bold" aria-hidden>
          {state ? 'expand_less' : 'expand_more'}
        </span>
      </button>
      {state && children}
    </>
  );
};
