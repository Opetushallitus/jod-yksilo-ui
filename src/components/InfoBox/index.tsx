import { tidyClasses as tc } from '@jod/design-system';
import { JodInfo } from '@jod/design-system/icons';

export interface InfoboxItem {
  label: string;
  content: React.ReactNode;
}

export interface InfoBoxProps {
  items: InfoboxItem[];
  className?: string;
}

export const InfoBox = ({ items, className = '' }: InfoBoxProps) => {
  return (
    <div
      className={tc([
        'rounded flex flex-row bg-bg-gray-2 p-4 gap-4 text-heading-4-mobile sm:text-heading-4 text-primary-gray mt-8 font-poppins',
        className,
      ])}
    >
      <JodInfo className="text-secondary-1-dark-2" />
      <div className="flex-1 flex flex-col">
        {items.map((item) => (
          <div key={item.label} className="flex gap-2">
            <span>{item.label}</span>
            <span className="text-secondary-1-dark-2">{item.content}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
