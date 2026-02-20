export const AnchorLink = ({ children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a {...rest}>{children}</a>
);
