import { tidyClasses } from '@jod/design-system';

export const Divider = ({ className = '' }: { className?: string }) => {
  return <hr className={tidyClasses(['border-b-1 border-border-gray', className])} />;
};
