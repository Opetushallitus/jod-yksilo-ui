import {
  MainLayout,
  RoutesNavigationList,
  SimpleNavigationList,
  Title,
  type RoutesNavigationListProps,
} from '@/components';
import { useActionBar } from '@/hooks/useActionBar';
import { Button, Checkbox } from '@jod/design-system';
import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { mapNavigationRoutes } from './utils';

const Favorites = () => {
  const routes = useOutletContext<RoutesNavigationListProps['routes']>();
  const { t } = useTranslation();
  const [filters, setFilters] = React.useState<string[]>([]);
  const title = t('profile.favorites.title');
  const jobFilterText = t('job-opportunities');
  const educationFilterText = t('education-opportunities');
  const navigationRoutes = React.useMemo(() => mapNavigationRoutes(routes), [routes]);
  const actionBar = useActionBar();

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (filters.includes(value)) {
      setFilters(filters.filter((filter) => filter !== value));
    } else {
      setFilters([...filters, value]);
    }
  };

  const isFilterChecked = (value: string) => filters.includes(value);

  return (
    <MainLayout
      navChildren={
        <div className="flex flex-col gap-5">
          <SimpleNavigationList title={t('profile.index')}>
            <RoutesNavigationList routes={navigationRoutes} />
          </SimpleNavigationList>
          <SimpleNavigationList title={t('content')} backgroundClassName="bg-bg-gray-2" collapsible>
            <div className="flex flex-col gap-4 hyphens-auto">
              <div className="text-todo">TODO</div>
              <Checkbox
                value="a"
                name={jobFilterText}
                label={jobFilterText}
                onChange={handleFilterChange}
                ariaLabel={jobFilterText}
                checked={isFilterChecked('a')}
              />
              <Checkbox
                value="b"
                name={educationFilterText}
                label={educationFilterText}
                onChange={handleFilterChange}
                ariaLabel={educationFilterText}
                checked={isFilterChecked('b')}
              />
            </div>
          </SimpleNavigationList>
        </div>
      }
    >
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-lg">{t('profile.favorites.description')}</p>
      <div className="text-todo">TODO</div>
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button variant="white" label="TODO: Vertaile" />
            <Button variant="white" label="TODO: Luo polku" />
            <Button variant="white-delete" label="TODO: Poista valitut ammatit" />
          </div>,
          actionBar,
        )}
    </MainLayout>
  );
};

export default Favorites;
