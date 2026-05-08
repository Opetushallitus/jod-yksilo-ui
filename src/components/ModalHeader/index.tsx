import React from 'react';

import { tidyClasses } from '@jod/design-system';

export interface ModalHeaderProps {
  /** Header text */
  text: React.ReactNode;
  /** CSS classnames */
  className?: string;
  /** Test id for querying in tests */
  testId?: string;
  /** Current step number for multi-step modals */
  step?: number;
}

export const ModalHeader = ({ text, className = '', testId, step }: ModalHeaderProps) => {
  const ref = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    ref.current?.setAttribute('tabIndex', '-1');
    setTimeout(() => ref.current?.focus(), 1);
  }, [step]);

  return (
    <h2
      className={tidyClasses(`text-heading-2-mobile text-primary-gray focus:outline-0 sm:text-hero ${className}`)}
      data-testid={testId}
      ref={ref}
    >
      {text}
    </h2>
  );
};
