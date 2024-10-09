import { client } from '@/api/client';
import {
  MainLayout,
  OpportunityCard,
  RoutesNavigationList,
  SimpleNavigationList,
  Title,
  type RoutesNavigationListProps,
} from '@/components';
import { useActionBar } from '@/hooks/useActionBar';
import { SuosikitLoaderData } from '@/routes/Profile/Favorites/loader';
import { getLocalizedText } from '@/utils';
import { Button, Checkbox, ConfirmDialog } from '@jod/design-system';
import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { NavLink, useLoaderData, useOutletContext, useRevalidator } from 'react-router-dom';
import { mapNavigationRoutes } from '../utils';

const Favorites = () => {
  const routes = useOutletContext<RoutesNavigationListProps['routes']>();
  const revalidator = useRevalidator();
  const { suosikit, tyomahdollisuudet, isLoggedIn } = useLoaderData() as SuosikitLoaderData;
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const [filters, setFilters] = React.useState<string[]>([]);
  const title = t('profile.favorites.title');
  const jobFilterText = t('job-opportunities');
  const educationFilterText = t('education-opportunities');
  const navigationRoutes = React.useMemo(() => mapNavigationRoutes(routes), [routes]);
  const actionBar = useActionBar();
  const [selectedFavorites, setSelectedFavorites] = React.useState<string[]>([]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (filters.includes(value)) {
      setFilters(filters.filter((filter) => filter !== value));
    } else {
      setFilters([...filters, value]);
    }
  };

  const removeFavorite = async (mahdollisuusId: string, type: 'work' | 'education') => {
    let suosikkiId = null;
    if (type === 'work') {
      suosikkiId = suosikit.find((s) => s.tyyppi === 'TYOMAHDOLLISUUS' && s.suosionKohdeId === mahdollisuusId)?.id;
    }

    if (!suosikkiId) {
      return;
    }

    await client.DELETE('/api/profiili/suosikki', {
      params: {
        query: { id: suosikkiId },
      },
    });
    revalidator.revalidate();
  };

  const isFilterChecked = (value: string) => filters.includes(value);

  const toggleFavorite = (id: string) => {
    if (selectedFavorites.includes(id)) {
      setSelectedFavorites(selectedFavorites.filter((favorite) => favorite !== id));
    } else {
      setSelectedFavorites([...selectedFavorites, id]);
    }
  };

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
                value="work"
                name={jobFilterText}
                label={jobFilterText}
                onChange={handleFilterChange}
                ariaLabel={jobFilterText}
                checked={isFilterChecked('work')}
              />
              <Checkbox
                value="education"
                name={educationFilterText}
                label={educationFilterText}
                onChange={handleFilterChange}
                ariaLabel={educationFilterText}
                checked={isFilterChecked('education')}
              />
            </div>
          </SimpleNavigationList>
        </div>
      }
    >
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-lg">{t('profile.favorites.description')}</p>
      <p className="mb-8">
        {t('profile.favorites.you-have-saved-n-job-opportunities', { count: tyomahdollisuudet.length })}
      </p>

      <div className="flex flex-col gap-5 mb-8">
        {tyomahdollisuudet.map((tyomahdollisuus) => {
          const { id } = tyomahdollisuus;
          return (
            <NavLink
              key={id}
              to={`/${language}/${t('slugs.job-opportunity.index')}/${id}/${t('slugs.job-opportunity.overview')}`}
            >
              <ConfirmDialog
                title={t('remove-favorite-confirmation-title')}
                onConfirm={() => void removeFavorite(id, 'work')}
                confirmText={t('delete')}
                cancelText={t('cancel')}
                variant="destructive"
                description={t('remove-favorite-job-opportunity-confirmation')}
              >
                {(showDialog: () => void) => (
                  <OpportunityCard
                    isFavorite={true}
                    isLoggedIn={isLoggedIn}
                    toggleSelection={() => toggleFavorite(id ?? '')}
                    toggleFavorite={showDialog}
                    selected={selectedFavorites.includes(id ?? '')}
                    name={getLocalizedText(tyomahdollisuus.otsikko)}
                    description={getLocalizedText(tyomahdollisuus.tiivistelma)}
                    type="work"
                    trend="NOUSEVA"
                    employmentOutlook={2}
                    hasRestrictions
                    industryName="TODO: Lorem ipsum dolor"
                    mostCommonEducationBackground="TODO: Lorem ipsum dolor"
                  />
                )}
              </ConfirmDialog>
            </NavLink>
          );
        })}
      </div>
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
