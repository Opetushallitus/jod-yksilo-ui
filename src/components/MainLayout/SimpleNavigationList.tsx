import { Accordion } from '@jod/design-system';

interface SimpleNavigationListProps {
  title: string;
  collapsible?: boolean;
  children: React.ReactNode;
  backgroundClassName?: string;
}

export const SimpleNavigationList = ({
  title,
  collapsible = false, // For filters
  children,
  backgroundClassName = 'bg-secondary-1-25', // For filters
}: SimpleNavigationListProps) => {
  return (
    <div className={`rounded-md ${backgroundClassName} py-6 px-[20px]`.trim()}>
      {collapsible ? (
        <Accordion title={title}>{children}</Accordion>
      ) : (
        <>
          <div className="hyphens-auto text-heading-3">{title}</div>
          {children}
        </>
      )}
    </div>
  );
};
