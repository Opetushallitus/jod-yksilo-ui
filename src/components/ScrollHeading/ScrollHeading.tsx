import { tidyClasses as tc } from '@jod/design-system';
import { JSX } from 'react';

export interface ScrollHeadingProps {
  title: string;
  heading: 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
  className: string;
  appendix?: string;
}
export const ScrollHeading = ({ title, heading, className, appendix }: ScrollHeadingProps) => {
  const HeadingTag = heading as keyof JSX.IntrinsicElements;
  const appendixText = appendix ? ` — ${appendix}` : '';
  return (
    <div className={tc(`flex gap-3 ${className}`)}>
      <HeadingTag id={title} className="scroll-mt-[96px] text-pretty hyphens-auto">
        {`${title}${appendixText}`}
      </HeadingTag>
    </div>
  );
};
