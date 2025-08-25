import { AiInfo } from '@/components/AiInfo/AiInfo';
import { tidyClasses as tc } from '@jod/design-system';
import { JSX } from 'react';

export interface ScrollHeadingProps {
  title: string;
  heading: 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
  className: string;
  hasAiContent?: boolean;
  appendix?: string;
}
export const ScrollHeading = ({ title, heading, className, hasAiContent, appendix }: ScrollHeadingProps) => {
  const HeadingTag = heading as keyof JSX.IntrinsicElements;
  const appendixText = appendix ? ` — ${appendix}` : '';
  return (
    <div className={tc(`flex gap-3 ${className}`)}>
      <HeadingTag id={title} className="scroll-mt-[96px] text-pretty hyphens-auto">
        {`${title}${appendixText}`}
      </HeadingTag>
      {hasAiContent && (
        <span className="print:hidden pt-2">
          <AiInfo />
        </span>
      )}
    </div>
  );
};
