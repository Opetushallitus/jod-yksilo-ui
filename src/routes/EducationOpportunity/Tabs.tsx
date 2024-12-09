import { RoutesNavigationListProps } from '@/components';
import { useTranslation } from 'react-i18next';
import { NavLink, matchPath, useLocation, useParams } from 'react-router';

const Tabs = () => {
  const { i18n, t } = useTranslation();
  const { pathname } = useLocation();
  const { id } = useParams();
  const tabs: RoutesNavigationListProps['routes'] = [
    {
      name: t('education-opportunity.overview.route'),
      path: t('slugs.education-opportunity.overview'),
      replace: true,
    },
    {
      name: t('education-opportunity.competences.route'),
      path: t('slugs.education-opportunity.competences'),
      replace: true,
    },
  ].map((route) => ({
    ...route,
    active: !!matchPath(`/${i18n.language}/${t('slugs.education-opportunity.index')}/${id}/${route.path}`, pathname),
  }));

  return (
    <ul className="flex flex-row flex-wrap gap-x-11 gap-y-2 py-3 border-b-2 border-inactive-gray mb-7">
      {tabs.map((route) => (
        <li key={route.path} className="flex min-h-7 items-center">
          {route.active && <div className="mx-3 h-5 w-5 flex-none rounded-full bg-accent" aria-hidden />}
          <NavLink
            to={`../${route.path}`}
            replace={route.replace}
            className={`${route.active ? '' : 'ml-7'} hyphens-auto text-button-md text-black hover:underline`.trim()}
          >
            {route.name}
          </NavLink>
        </li>
      ))}
    </ul>
  );
};

export default Tabs;
