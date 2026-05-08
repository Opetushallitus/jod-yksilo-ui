import { Accordion } from '@jod/design-system';

interface FilterListProps {
  title: string;
  collapsible?: boolean;
  children: React.ReactNode;
  className?: string;
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const FilterList = ({
  title,
  collapsible = false,
  children,
  className = 'bg-secondary-1-25',
  headingLevel,
}: FilterListProps) => {
  const TitleTag = headingLevel ?? 'h2';
  const id = title.toLocaleLowerCase().replace(/\s+/g, '-');
  return (
    <div className={`rounded-md ${className} px-[20px] py-6`.trim()}>
      {collapsible ? (
        <Accordion
          ariaLabel={title}
          title={
            <TitleTag className="text-body-sm-mobile" aria-controls={id}>
              {title}
            </TitleTag>
          }
        >
          <section className="pt-4" aria-labelledby={id} id={id}>
            {children}
          </section>
        </Accordion>
      ) : (
        <>
          <TitleTag className="text-body-sm-mobile hyphens-auto">{title}</TitleTag>
          {children}
        </>
      )}
    </div>
  );
};
