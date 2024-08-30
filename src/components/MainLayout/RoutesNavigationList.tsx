import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

export interface RoutesNavigationListProps {
  routes: {
    path: string;
    name: string;
    active?: boolean;
  }[];
  onClick?: () => void;
}

export const RoutesNavigationList = ({ routes, onClick }: RoutesNavigationListProps) => {
  const { i18n } = useTranslation();
  return (
    <ul className="flex flex-col gap-y-2 py-4">
      {routes.map((route) => {
        return (
          <li key={route.path} className="flex min-h-7 items-center w-full">
            <NavLink
              to={route.path}
              lang={i18n.language}
              className={({ isActive }) =>
                `${isActive ? 'bg-secondary-1-50 rounded-md' : ''} hyphens-auto text-button-md text-black hover:underline w-full pl-5 block py-3`
              }
              onClick={onClick}
            >
              {route.name}
            </NavLink>
          </li>
        );
      })}
    </ul>
  );
};
