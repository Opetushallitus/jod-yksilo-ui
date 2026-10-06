import { useTranslation } from 'react-i18next';

import { Toggle } from '@jod/design-system';

interface ToggleAllowProps {
  /** Is the toggle checked/activated */
  checked: boolean;
  /** Callback for when the toggle is changed */
  onChange: (val: boolean) => void;
  /** Is the toggle disabled */
  disabled?: boolean;
  /** Test id for testing purposes */
  testId?: string;
  label: string;
  ariaDescribedBy?: string;
}

export const ToggleAllow = ({
  checked,
  onChange,
  disabled = false,
  testId,
  label,
  ariaDescribedBy,
}: ToggleAllowProps) => {
  const { t } = useTranslation();
  const stateText = checked ? t('i-allow') : t('i-disallow');

  return (
    <>
      <span className="font-arial text-body-md-mobile text-secondary-gray sm:text-body-md" aria-hidden>
        {stateText}
      </span>
      <Toggle
        type="button"
        serviceVariant="yksilo"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        ariaLabel={label}
        ariaDescribedBy={ariaDescribedBy}
        testId={testId}
      />
    </>
  );
};
