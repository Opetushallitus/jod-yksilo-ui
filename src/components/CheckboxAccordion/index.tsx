import { Accordion, Checkbox } from '@jod/design-system';
import React from 'react';

type CheckboxAccordionProps = {
  children?: React.ReactNode;
  label: string;
  initiallyOpen?: boolean;
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
}: CheckboxAccordionProps) => {
  const triggerId = `${label}-accordion`;
  const contentId = `${label}-content`;
  const [isOpen, setIsOpen] = React.useState(initiallyOpen ?? false);

  // Disable accordion toggle when checkbox is disabled
  const getSetIsOpen = () => {
    if (disabled) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
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
        className="shrink-1 mt-[5px] text-menu text-black"
        indeterminate={indeterminate}
        disabled={disabled}
      />
      <div className="w-full">
        <Accordion
          triggerId={triggerId}
          initialState={initiallyOpen}
          title={
            <span className={`text-form-label text-primary-gray font-arial ${disabled ? 'text-inactive-gray!' : ''}`}>
              {label}
            </span>
          }
          ariaLabel={label}
          ariaControls={contentId}
          setIsOpen={getSetIsOpen()}
          isOpen={isOpen}
        >
          <section aria-labelledby={contentId} id={contentId} />
          {children}
        </Accordion>
      </div>
    </div>
  );
};
