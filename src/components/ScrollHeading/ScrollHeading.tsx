import { tidyClasses as tc, useNoteStack } from '@jod/design-system';
import { JSX } from 'react';

export interface ScrollHeadingProps {
  title: string;
  id?: string;
  heading: 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
  className: string;
  appendix?: string;
}
export const ScrollHeading = ({ title, id, heading, className, appendix }: ScrollHeadingProps) => {
  const HeadingTag = heading as keyof JSX.IntrinsicElements;
  const appendixText = appendix ? ` — ${appendix}` : '';
  const { permanentNotesHeight } = useNoteStack();
  // navbar + service bar (closed) + permanent notes + main padding
  const scrollMarginTop = `${64 + 4 + permanentNotesHeight + 64}px`;

  return (
    <div className={tc(`flex gap-3 ${className}`)}>
      <HeadingTag
        id={id ?? title}
        className="text-pretty hyphens-auto"
        style={{
          scrollMarginTop,
        }}
      >
        {`${title}${appendixText}`}
      </HeadingTag>
    </div>
  );
};
