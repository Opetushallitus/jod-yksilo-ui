import { Accordion } from '@jod/design-system';

interface SimpleNavigationListProps {
  title: string;
  collapsible?: boolean;
  children: React.ReactNode;
  backgroundClassName?: string;
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const SimpleNavigationList = ({
  title,
  collapsible = false, // For filters
  children,
  backgroundClassName = 'bg-secondary-1-25', // For filters
  headingLevel,
}: SimpleNavigationListProps) => {
  const TitleTag = headingLevel ?? 'h2';
  const id = title.toLocaleLowerCase().replace(/\s+/g, '-');
  return (
    <div className={`rounded-md ${backgroundClassName} py-6 px-[20px]`.trim()}>
      {collapsible ? (
        <Accordion
          ariaLabel={title}
          title={
            <TitleTag className="text-heading-3" aria-controls={id}>
              {title}
            </TitleTag>
          }
        >
          <section aria-labelledby={id} id={id}>
            {children}
          </section>
        </Accordion>
      ) : (
        <>
          <TitleTag className="hyphens-auto text-heading-3">{title}</TitleTag>
          {children}
        </>
      )}
    </div>
  );
};
