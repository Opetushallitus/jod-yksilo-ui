import { tidyClasses } from '@jod/design-system';

export const Divider = ({ className = '' }: { className?: string }) => {
  return <hr className={tidyClasses(['border-b border-border-gray', className])} />;
};
