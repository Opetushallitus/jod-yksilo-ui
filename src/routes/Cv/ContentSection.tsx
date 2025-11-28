import { ScrollHeading } from '@/components/ScrollHeading/ScrollHeading';
import { hyphenize } from '@/utils';
import { Accordion, tidyClasses as tc, useMediaQueries } from '@jod/design-system';

interface ContentSectionProps {
  children: React.ReactNode;
  title: string;
  className?: string;
}
export const ContentSection = ({ children, title, className = '' }: ContentSectionProps) => {
  const { lg } = useMediaQueries();
  const titleElement: React.ReactNode = <ScrollHeading title={title} heading="h2" className="text-heading-2" />;
  const triggerId = `cv-section-${hyphenize(title)}`;
  const contentId = `cv-content-${hyphenize(title)}`;

  return lg ? (
    <div className={tc([className, 'flex flex-col gap-5'])}>
      {titleElement}
      {children}
    </div>
  ) : (
    <Accordion
      ariaLabel={title}
      title={titleElement}
      className={tc([className, 'mb-8'])}
      triggerId={triggerId}
      ariaControls={contentId}
    >
      <section id={contentId}>{children}</section>
    </Accordion>
  );
};
