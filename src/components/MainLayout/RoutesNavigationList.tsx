import { NavLink } from 'react-router-dom';

export interface RoutesNavigationListProps {
  routes: {
    path: string;
    name: string;
    active: boolean;
  }[];
}

export const RoutesNavigationList = ({ routes }: RoutesNavigationListProps) => {
  return (
    <ul className="flex flex-col gap-y-2 py-4 font-poppins">
      {routes.map((route) => (
        <li key={route.path} className="flex min-h-7 items-center w-full">
          <NavLink to={route.path} className="hyphens-auto text-button-md text-black hover:underline w-full">
            <span className={`${route.active ? 'bg-secondary-1-50 rounded-md' : ''} pl-5 block w-full py-3`}>
              {route.name}
            </span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
};
