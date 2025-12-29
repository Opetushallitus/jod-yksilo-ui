export const ExternalLink = ({
  children,
  href,
  className,
  target,
  rel,
}: {
  children?: React.ReactNode;
  href: string;
  className?: string;
  target?: string;
  rel?: string;
}) => (
  <a href={href} className={className} target={target} rel={rel}>
    {children}
  </a>
);
