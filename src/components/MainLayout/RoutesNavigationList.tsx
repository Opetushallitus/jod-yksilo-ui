import { NavLink } from 'react-router-dom';

export interface RoutesNavigationListProps {
  routes: {
    path: string;
    name: string;
    active: boolean;
  }[];
  onClick?: () => void;
}

export const RoutesNavigationList = ({ routes, onClick }: RoutesNavigationListProps) => {
  return (
    <ul className="flex flex-col gap-y-2 py-4 font-poppins">
      {routes.map((route) => (
        <li key={route.path} className="flex min-h-7 items-center w-full">
          <NavLink
            to={route.path}
            className="hyphens-auto text-button-md text-black hover:underline w-full"
            onClick={onClick}
          >
            <span className={`${route.active ? 'bg-secondary-1-50 rounded-md' : ''} pl-5 block w-full py-3`.trim()}>
              {route.name}
            </span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
};
