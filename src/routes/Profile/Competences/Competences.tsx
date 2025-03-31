import { MainLayout } from '@/components';
import { FilterButton } from '@/components/MobileFilterButton/MobileFilterButton';
import { useInitializeFilters } from '@/hooks/useInitializeFilters';
import { Filters } from '@/routes/Profile/Competences/Filters';
import { GroupByAlphabet } from '@/routes/Profile/Competences/GroupByAlphabet';
import { GroupBySource } from '@/routes/Profile/Competences/GroupBySource';
import { CompetencesLoaderData } from '@/routes/Profile/Competences/loader';
import { sortByProperty } from '@/utils';
import { Button, Modal, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import { ProfileNavigationList } from '../components';
import { CompetenceFilter, GROUP_BY_ALPHABET, GROUP_BY_SOURCE, GROUP_BY_THEME } from './constants';

const Competences = () => {
  const { toimenkuvat, koulutukset, patevyydet, muutOsaamiset, osaamiset } = useLoaderData() as CompetencesLoaderData;
  const { t, i18n } = useTranslation();
  const title = t('profile.competences.title');
  const [groupBy, setGroupBy] = React.useState<string>(GROUP_BY_SOURCE);
  const locale = i18n.language as 'fi' | 'sv';
  const [showFilters, setShowFilters] = React.useState(false);
  const { sm } = useMediaQueries();

  const { selectedFilters, setSelectedFilters, filterKeys } = useInitializeFilters(
    locale,
    {
      TOIMENKUVA: [],
      KOULUTUS: [],
      PATEVYYS: [],
      MUU_OSAAMINEN: [],
    },
    toimenkuvat,
    koulutukset,
    patevyydet,
    muutOsaamiset,
  );

  // Determines if osaamiset from a specific source should be visible. Id is the id of the source (eg. koulutus or toimenkuva).
  // Muu osaaminen doesn't have any sources, so they'll show up if any are marked as checked.
  const isOsaaminenVisible = React.useCallback(
    (type: CompetenceFilter, id?: string): boolean => {
      return type === 'MUU_OSAAMINEN'
        ? selectedFilters.MUU_OSAAMINEN.length > 0 && selectedFilters.MUU_OSAAMINEN.some((item) => item.checked)
        : (selectedFilters[type]?.find((item) => (id ? item.value.includes(id) : false))?.checked ?? false);
    },
    [selectedFilters],
  );

  const sortedOsaamiset = React.useMemo(
    () => [...osaamiset].sort(sortByProperty(`osaaminen.nimi.${locale}`)),
    [osaamiset, locale],
  );

  return (
    <MainLayout
      navChildren={
        <div className="flex flex-col gap-5">
          <ProfileNavigationList />
          <Filters
            filterKeys={filterKeys}
            groupBy={groupBy}
            selectedFilters={selectedFilters}
            setGroupBy={setGroupBy}
            setSelectedFilters={setSelectedFilters}
          />
        </div>
      }
    >
      <title>{title}</title>
      <h1 className="mb-5 text-heading-1">{title}</h1>
      <p className="mb-8 text-body-lg">{t('profile.competences.description')}</p>
      <div>
        {!sm && (
          <Modal
            open={showFilters}
            onClose={() => setShowFilters(false)}
            content={
              <Filters
                filterKeys={filterKeys}
                groupBy={groupBy}
                selectedFilters={selectedFilters}
                setGroupBy={setGroupBy}
                setSelectedFilters={setSelectedFilters}
              />
            }
            footer={
              <div className="flex flex-row justify-end gap-4 flex-1">
                <Button variant="white" label={t('close')} onClick={() => setShowFilters(false)} />
              </div>
            }
          />
        )}
        {groupBy === GROUP_BY_SOURCE && (
          <GroupBySource
            filters={selectedFilters}
            filterKeys={filterKeys}
            locale={locale}
            osaamiset={sortedOsaamiset}
            isOsaaminenVisible={isOsaaminenVisible}
            mobileFilterOpenerComponent={
              <FilterButton onClick={() => setShowFilters(true)} label={t('profile.competences.show-filters')} />
            }
          />
        )}
        {groupBy === GROUP_BY_THEME && <></>}
        {groupBy === GROUP_BY_ALPHABET && (
          <GroupByAlphabet
            filters={selectedFilters}
            filterKeys={filterKeys}
            locale={locale}
            osaamiset={osaamiset}
            isOsaaminenVisible={isOsaaminenVisible}
            mobileFilterOpenerComponent={
              <FilterButton onClick={() => setShowFilters(true)} label={t('profile.competences.show-filters')} />
            }
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Competences;
