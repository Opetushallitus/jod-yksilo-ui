import { tidyClasses as tc } from '@jod/design-system';

type ActionButtonProps = {
  label: string;
  icon: React.ReactNode;
  className?: string;
  onClick: () => void;
  testId?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const ActionButton = ({ label, icon, className = '', onClick, testId, ...rest }: ActionButtonProps) => {
  return (
    <button
      aria-label={label}
      className={tc(
        `rounded-2xl font-semibold flex cursor-pointer items-center gap-x-2 py-1 pr-5 pl-4 text-[0.75rem] leading-[1.125rem] text-nowrap outline-accent hover:underline ${className}`,
      )}
      onClick={onClick}
      type="button"
      data-testid={testId}
      {...rest}
    >
      {icon}
      {label}
    </button>
  );
};
