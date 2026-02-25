import { client } from '@/api/client';
import { MainLayout } from '@/components';
import { InfoBox } from '@/components/InfoBox/InfoBox';
import { FilterButton } from '@/components/MobileFilterButton/MobileFilterButton';
import { useInitializeFilters } from '@/hooks/useInitializeFilters';
import { Filters } from '@/routes/Profile/Competences/Filters';
import { GroupByAlphabet } from '@/routes/Profile/Competences/GroupByAlphabet';
import { GroupBySource } from '@/routes/Profile/Competences/GroupBySource';
import { sortByProperty } from '@/utils';
import { Button, Modal, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import { ProfileNavigationList, ProfileSectionTitle } from '../components';
import { FreeFormTextInputBlock } from '../components/FreeFormTextInputBlock';
import { ToolCard } from '../components/ToolCard';
import { type CompetenceSourceType, GROUP_BY_ALPHABET, GROUP_BY_SOURCE } from './constants';

const Competences = () => {
  const { osaamiset, toimenkuvat, koulutukset, patevyydet, muutOsaamiset, muutOsaamisetVapaateksti } = useLoaderData();
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const title = t('profile.competences.title');
  const [groupBy, setGroupBy] = React.useState<string>(GROUP_BY_SOURCE);
  const locale = language as 'fi' | 'sv';
  const [showFilters, setShowFilters] = React.useState(false);
  const { lg } = useMediaQueries();

  const { selectedFilters, setSelectedFilters, filterKeys } = useInitializeFilters(
    {
      TOIMENKUVA: [],
      KOULUTUS: [],
      PATEVYYS: [],
      MUU_OSAAMINEN: [],
    },
    { toimenkuvat, koulutukset, patevyydet, muutOsaamiset, muutOsaamisetVapaateksti },
  );

  // Determines if osaamiset from a specific source should be visible. Id is the id of the source (eg. koulutus or toimenkuva).
  // Muu osaaminen doesn't have any sources, so they'll show up if any are marked as checked.
  const isOsaaminenVisible = React.useCallback(
    (type: CompetenceSourceType, id?: string): boolean => {
      return type === 'MUU_OSAAMINEN'
        ? selectedFilters.MUU_OSAAMINEN.some((item) => item.checked)
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
          <ToolCard testId="competences-go-to-tool" />
        </div>
      }
    >
      {!lg && (
        <div className="mb-6">
          <ProfileNavigationList collapsed />
        </div>
      )}
      <title>{title}</title>
      <ProfileSectionTitle type="OSAAMISENI" title={title} />
      <p className="mb-5 text-body-lg">{t('profile.competences.description')}</p>
      <InfoBox text={t('profile.competences.info')} />
      <div>
        {!lg && (
          <Modal
            name={t('filters')}
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
                <Button
                  variant="white"
                  label={t('close')}
                  onClick={() => setShowFilters(false)}
                  className="whitespace-nowrap"
                  testId="competences-close-filters"
                />
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
              <FilterButton
                onClick={() => setShowFilters(true)}
                label={t('profile.competences.show-filters')}
                hideAfterBreakpoint="lg"
              />
            }
            data-testid="competences-group-by-source"
          />
        )}
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
            data-testid="competences-group-by-alphabet"
          />
        )}
        <div className="mb-7">
          <FreeFormTextInputBlock
            header={t('profile.competences.freeform.header')}
            description={t('profile.competences.freeform.description')}
            placeholder={t('profile.competences.freeform.placeholder')}
            testId="competences-freeform"
            text={muutOsaamisetVapaateksti}
            onChange={async (value) => {
              await client.PUT('/api/profiili/muu-osaaminen/vapaateksti', {
                body: value,
              });
            }}
            collapsible
          />
        </div>
      </div>
      {lg ? null : <ToolCard testId="competences-go-to-tool" className="mt-6" />}
    </MainLayout>
  );
};

export default Competences;
