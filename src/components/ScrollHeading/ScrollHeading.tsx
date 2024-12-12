import { tidyClasses as tc } from '@jod/design-system';

export interface ScrollHeadingProps {
  title: string;
  heading: 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
  className: string;
}
export const ScrollHeading = ({ title, heading, className }: ScrollHeadingProps) => {
  const HeadingTag = heading as keyof JSX.IntrinsicElements;
  return (
    <HeadingTag id={title} className={tc(`scroll-mt-[96px] mb-5 ${className}`)}>
      {title}
    </HeadingTag>
  );
};
