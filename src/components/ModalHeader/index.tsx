import { tidyClasses } from '@jod/design-system';
import React from 'react';

export interface ModalHeaderProps {
  /** Header text */
  text: React.ReactNode;
  /** CSS classnames */
  className?: string;
  /** Test id for querying in tests */
  testId?: string;
  /** Whether to focus the header when mounted. Default true */
  focusOnMount?: boolean;
}

export const ModalHeader = ({ text, className = '', testId, focusOnMount = true }: ModalHeaderProps) => {
  const ref = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    if (focusOnMount) {
      ref.current?.setAttribute('tabIndex', '-1');
      setTimeout(() => ref.current?.focus(), 1);
    }
  }, [focusOnMount]);

  return (
    <h2
      className={tidyClasses(`text-black text-heading-2-mobile sm:text-hero focus:outline-0 ${className}`)}
      data-testid={testId}
      ref={ref}
    >
      {text}
    </h2>
  );
};
