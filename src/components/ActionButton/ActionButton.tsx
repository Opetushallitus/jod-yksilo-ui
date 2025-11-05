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
      className={tc(`cursor-pointer flex items-center gap-x-3 text-button-sm text-nowrap ${className}`)}
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
