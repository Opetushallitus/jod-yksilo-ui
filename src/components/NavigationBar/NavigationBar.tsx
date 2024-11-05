import { LanguageButton, UserButton } from '@/components';
import { useMediaQueries } from '@jod/design-system';

export interface NavigationBarLinkProps {
  className?: string;
  role?: string;
  title?: string;
  children: React.ReactNode;
}

export type NavigationBarLink = React.ComponentType<NavigationBarLinkProps>;

export interface NavigationBarProps {
  /** Navigation logo */
  logo: React.ReactNode;
  /** Place for menu opener button */
  menuComponent?: React.ReactNode;
  /** For language selection button **/
  onLanguageClick: () => void;
  /** Navigation avatar */
  user?: {
    name: string;
    component: NavigationBarLink;
  };
}

/**
 * This component is a navigation bar that displays a logo, and an avatar.
 */
export const NavigationBar = ({ logo, menuComponent, onLanguageClick, user }: NavigationBarProps) => {
  const { sm } = useMediaQueries();

  return (
    <div className="min-w-min shadow-border bg-white">
      <nav
        role="navigation"
        className="mx-auto flex h-11 items-center gap-4 px-5 sm:px-7 py-3 font-semibold xl:container"
      >
        {logo}
        <ul className="inline-flex items-center gap-3 sm:gap-5 ml-auto">
          {menuComponent && <li className="ml-3 sm:ml-0">{menuComponent}</li>}
          {sm && (
            <>
              <li className="ml-5">
                <LanguageButton onClick={onLanguageClick} />
              </li>
              <li>
                <UserButton user={user} />
              </li>
            </>
          )}
        </ul>
      </nav>
    </div>
  );
};
