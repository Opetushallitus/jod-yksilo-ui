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
        `cursor-pointer flex items-center gap-x-2 text-nowrap rounded-2xl pl-4 pr-5 py-1 font-semibold text-[12px] leading-[18px] hover:underline outline-accent ${className}`,
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
