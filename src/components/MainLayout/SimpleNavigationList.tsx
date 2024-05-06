import { Accordion } from '@/components';

interface SimpleNavigationListProps {
  title: string;
  collapsible?: boolean;
  children: React.ReactNode;
}

export const SimpleNavigationList = ({ title, collapsible = false, children }: SimpleNavigationListProps) => (
  <div className="rounded-[20px] border-[3px] border-solid border-secondary-gray bg-white px-[20px] py-6">
    {collapsible ? (
      <Accordion title={<div className="truncate text-heading-4">{title}</div>}>{children}</Accordion>
    ) : (
      <>
        <div className="truncate text-heading-4">{title}</div>
        {children}
      </>
    )}
  </div>
);
