import { tidyClasses as tc } from '@jod/design-system';

interface ActionButtonProps {
  label: string;
  icon: React.ReactNode;
  className?: string;
  onClick: () => void;
}

export const ActionButton = ({ label, icon, className = '', onClick, ...rest }: ActionButtonProps) => {
  return (
    <button
      aria-label={label}
      className={tc(`cursor-pointer flex items-center gap-x-3 text-button-sm text-nowrap ${className}`)}
      onClick={onClick}
      {...rest}
    >
      {icon}
      {label}
    </button>
  );
};
