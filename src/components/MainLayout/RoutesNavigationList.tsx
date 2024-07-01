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
    <ul className="flex flex-col gap-y-2 py-4">
      {routes.map((route) => (
        <li key={route.path} className="flex min-h-7 items-center">
          {route.active && <div className="mx-3 h-5 w-5 flex-none rounded-full bg-accent" aria-hidden />}
          <NavLink
            to={route.path}
            className={`${!route.active ? 'ml-7' : ''} hyphens-auto text-button-md text-black hover:underline`.trim()}
          >
            {route.name}
          </NavLink>
        </li>
      ))}
    </ul>
  );
};
