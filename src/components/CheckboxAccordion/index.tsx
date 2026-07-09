import React from 'react';

import { Accordion, Checkbox } from '@jod/design-system';

type CheckboxAccordionProps = {
  children?: React.ReactNode;
  label: string;
  initiallyOpen?: boolean;
  testId?: string;
} & Omit<React.ComponentProps<typeof Checkbox>, 'value' | 'name' | 'ariaLabel'>;

/**
 * This component combines a checkbox and an accordion. The checkbox is displayed next to the accordion title.
 */
export const CheckboxAccordion = ({
  label,
  checked,
  onChange,
  children,
  initiallyOpen,
  disabled,
  indeterminate,
  testId,
}: CheckboxAccordionProps) => {
  const triggerId = `${label}-accordion`;
  const contentId = `${label}-content`;
  const [isOpen, setIsOpen] = React.useState(initiallyOpen ?? false);
  const getTestId = (postfix: string) => (testId ? `${testId}-${postfix}` : undefined);

  // Disable accordion toggle when checkbox is disabled
  const getSetIsOpen = () => {
    if (disabled) {
      return () => {};
    } else {
      return setIsOpen;
    }
  };

  // Specific pixel values are used to align the checkbox with the accordion title so it resembles plain checkbox styles
  return (
    <div className="flex flex-row items-start gap-[11px]">
      <Checkbox
        name={`${label}-checkbox`}
        checked={checked}
        onChange={onChange}
        value={label}
        ariaLabel={label}
        className="mt-[5px] shrink-1 text-menu text-primary-gray"
        indeterminate={indeterminate}
        disabled={disabled}
        testId={getTestId('checkbox')}
      />
      <div className="w-full">
        <Accordion
          triggerId={triggerId}
          initialState={initiallyOpen}
          title={
            <span className={`font-arial text-form-label text-primary-gray ${disabled ? 'text-inactive-gray!' : ''}`}>
              {label}
            </span>
          }
          ariaLabel={label}
          ariaControls={contentId}
          setIsOpen={getSetIsOpen()}
          isOpen={isOpen}
          testId={getTestId('accordion')}
        >
          <section aria-labelledby={contentId} id={contentId} data-testid={getTestId('content')} />
          {children}
        </Accordion>
      </div>
    </div>
  );
};
