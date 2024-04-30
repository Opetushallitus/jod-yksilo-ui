import { useTranslation } from 'react-i18next';
import { type RouteObject, NavLink } from 'react-router-dom';

interface SimpleNavigationListProps {
  routes: (RouteObject & {
    name: string;
    active: boolean;
  })[];
}

export const SimpleNavigationList = ({ routes }: SimpleNavigationListProps) => {
  const { t } = useTranslation();
  return (
    <ul>
      <li>
        <p className="truncate text-heading-4">{t('basic-information-about-the-service')}</p>
        <ul className="flex flex-col gap-y-2 py-4">
          {routes.map((route, index) => (
            <li key={index} className="flex min-h-7 items-center">
              {route.active && <div className="mx-3 h-5 w-5 flex-none rounded-full bg-accent" aria-hidden />}
              <NavLink
                to={route.path!}
                className={`${!route.active ? 'ml-7' : ''} truncate text-button-md text-primary-gray hover:underline`.trim()}
              >
                {route.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </li>
    </ul>
  );
};
