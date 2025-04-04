import { AiInfo } from '@/components/AiInfo/AiInfo';
import { tidyClasses as tc } from '@jod/design-system';
import { JSX } from 'react';

export interface ScrollHeadingProps {
  title: string;
  heading: 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
  className: string;
  hasAiContent?: boolean;
}
export const ScrollHeading = ({ title, heading, className, hasAiContent }: ScrollHeadingProps) => {
  const HeadingTag = heading as keyof JSX.IntrinsicElements;
  return (
    <div className={`flex flex-row justify-between items-center mb-5 ${className}`}>
      <HeadingTag id={title} className={tc(`scroll-mt-[96px]`)}>
        {title}
      </HeadingTag>
      {hasAiContent && (
        <div className="print:hidden mr-2">
          <AiInfo />
        </div>
      )}
    </div>
  );
};
