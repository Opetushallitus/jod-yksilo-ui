import { tidyClasses, useMediaQueries } from '@jod/design-system';
import { JodSettings } from '@jod/design-system/icons';

interface FilterButtonProps {
  onClick: () => void;
  label: string;
  hideAfterBreakpoint?: keyof ReturnType<typeof useMediaQueries> | 'none';
  inline?: boolean;
  ref?: React.RefObject<HTMLButtonElement | null>;
}
export const FilterButton = ({
  onClick,
  label,
  hideAfterBreakpoint = 'sm',
  inline = false,
  ref,
}: FilterButtonProps) => {
  const mediaQueries = useMediaQueries();
  const shouldRender = hideAfterBreakpoint === 'none' || !mediaQueries[hideAfterBreakpoint];

  if (!shouldRender) {
    return null;
  }

  return inline ? (
    <button
      className="cursor-pointer text-form-label flex flex-row items-center gap-x-5"
      ref={ref}
      onClick={onClick}
      data-testid="mobile-filter-button"
    >
      <span className="font-arial">{label}</span>
      <span className="flex bg-white rounded-full relative size-7 justify-center items-center">
        <JodSettings />
      </span>
    </button>
  ) : (
    <RoundButton
      bgColor="white"
      label={label}
      hideLabel
      onClick={onClick}
      icon={<JodSettings />}
      data-testid="mobile-filter-fab"
    />
  );
};

interface RoundButtonProps {
  /** Text shown on the button */
  label: string;
  /** Hide label */
  hideLabel?: boolean;
  /** Callback fired on tap/click of the button */
  onClick: () => void;
  /** Button disabled for any actions */
  disabled?: boolean;
  /** Selected */
  selected?: boolean;
  /** Icon shown on the link */
  icon: React.ReactNode;
  /** Background color */
  bgColor?: 'gray' | 'white';
  testId?: string;
}

const RoundButton = ({
  testId,
  label,
  hideLabel = false,
  onClick,
  disabled = false,
  selected = false,
  icon,
  bgColor = 'gray',
}: RoundButtonProps) => {
  const bgColorClass = tidyClasses([
    !selected && bgColor === 'gray' ? 'bg-bg-gray-2' : '',
    !selected && bgColor === 'white' ? 'bg-white' : '',
  ]);

  return (
    <button
      aria-label={label}
      disabled={disabled}
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={tidyClasses([
        'cursor-pointer',
        disabled ? 'cursor-not-allowed opacity-50' : '',
        'group',
        'flex',
        'flex-col',
        'justify-center',
        'items-center',
        'gap-2',
      ])}
    >
      <div
        aria-hidden
        className={tidyClasses([
          'size-7',
          selected ? 'bg-accent' : bgColorClass,
          selected ? 'text-white' : 'text-primary-gray group-hover:text-accent',
          'rounded-full',
          'flex',
          'items-center',
          'justify-center',
          'select-none',
        ])}
      >
        {icon}
      </div>
      <LabelPart label={label} hideLabel={hideLabel} selected={selected} />
    </button>
  );
};

const LabelPart = ({ label, hideLabel, selected }: Pick<RoundButtonProps, 'label' | 'hideLabel' | 'selected'>) => (
  <span
    className={tidyClasses([
      hideLabel ? 'hidden' : '',
      selected ? 'text-accent' : 'text-primary-gray',
      'text-button-md',
      'group-hover:text-accent',
      'group-hover:underline',
    ])}
  >
    {label}
  </span>
);
