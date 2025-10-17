import { NavLink } from 'react-router';

interface BreadcrumbLinkProps {
  to: string;
  className?: string;
  children: React.ReactNode;
}

export const BreadcrumbLink = ({ to, className, children }: BreadcrumbLinkProps) => {
  return (
    <NavLink to={to} className={className} end>
      {children}
    </NavLink>
  );
};
