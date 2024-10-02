import { components } from '@/api/schema';
import {
  MainLayout,
  RoutesNavigationList,
  SimpleNavigationList,
  Title,
  type RoutesNavigationListProps,
} from '@/components';
import { OsaaminenLahdeTyyppi } from '@/components/OsaamisSuosittelija/OsaamisSuosittelija';
import { useActionBar } from '@/hooks/useActionBar';
import { Filters } from '@/routes/Profile/Competences/Filters';
import { GroupByAlphabet } from '@/routes/Profile/Competences/GroupByAlphabet';
import { GroupBySource } from '@/routes/Profile/Competences/GroupBySource';
import { CompetencesLoaderData } from '@/routes/Profile/Competences/loader';
import { sortByProperty } from '@/utils';
import { Button, Modal, RoundButton, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { MdTune } from 'react-icons/md';
import { useLoaderData, useOutletContext } from 'react-router-dom';
import { mapNavigationRoutes } from '../utils';
import { FILTERS_ORDER, GROUP_BY_ALPHABET, GROUP_BY_SOURCE, GROUP_BY_THEME, type FiltersType } from './constants';

interface Kokemus {
  id?: string;
  uri?: string;
  nimi: Record<string, string | undefined>;
  kuvaus?: Record<string, string | undefined>;
  alkuPvm?: string;
  loppuPvm?: string;
  osaamiset?: string[];
}

const Competences = () => {
  const routes = useOutletContext<RoutesNavigationListProps['routes']>();
  const { toimenkuvat, koulutukset, patevyydet, muutOsaamiset, osaamiset } = useLoaderData() as CompetencesLoaderData;
  const [initialized, setInitialized] = React.useState(false);
  const { t, i18n } = useTranslation();
  const title = t('profile.competences.title');
  const [groupBy, setGroupBy] = React.useState<string>(GROUP_BY_SOURCE);
  const navigationRoutes = React.useMemo(() => mapNavigationRoutes(routes), [routes]);
  const actionBar = useActionBar();
  const locale = i18n.language as 'fi' | 'sv';
  const [selectedFilters, setSelectedFilters] = React.useState<FiltersType>({
    TOIMENKUVA: [],
    KOULUTUS: [],
    PATEVYYS: [],
    MUU_OSAAMINEN: [],
    KIINNOSTUS: [],
  });
  const [filterKeys, setFilterKeys] = React.useState<(keyof FiltersType)[]>([]);
  const [showFilters, setShowFilters] = React.useState(false);
  const { sm } = useMediaQueries();

  const mapExperienceToFilter = React.useCallback(
    (currentFilters: FiltersType, type: OsaaminenLahdeTyyppi) => (experience: Kokemus) => ({
      label: experience.nimi[locale] ?? '',
      value: experience.id ?? experience.uri ?? '',
      checked: currentFilters?.[type]?.find((item) => item.value === experience.id)?.checked ?? true,
    }),
    [locale],
  );

  const initFilters = React.useCallback(
    (osaamiset: components['schemas']['YksilonOsaaminenDto'][]) => {
      const initialFilters = {} as FiltersType;

      osaamiset.forEach((osaaminen) => {
        const type = osaaminen.lahde.tyyppi;
        initialFilters[type] = initialFilters[type] ?? [];

        if (type === 'TOIMENKUVA') {
          initialFilters[type] = toimenkuvat.map(mapExperienceToFilter(selectedFilters, type));
        }
        if (type === 'KOULUTUS') {
          initialFilters[type] = koulutukset.map(mapExperienceToFilter(selectedFilters, type));
        }
        if (type === 'PATEVYYS') {
          initialFilters[type] = patevyydet.map(mapExperienceToFilter(selectedFilters, type));
        }
        if (type === 'MUU_OSAAMINEN') {
          initialFilters[type] = muutOsaamiset.map(mapExperienceToFilter(selectedFilters, type));
        }
      });

      return initialFilters;
    },
    [koulutukset, mapExperienceToFilter, muutOsaamiset, patevyydet, selectedFilters, toimenkuvat],
  );

  React.useEffect(() => {
    if (!initialized) {
      const initialFilters = initFilters(osaamiset);
      setSelectedFilters(initialFilters);
      setFilterKeys(
        [...(Object.keys(initialFilters) as (keyof FiltersType)[])].sort(
          (a, b) => FILTERS_ORDER.indexOf(a) - FILTERS_ORDER.indexOf(b),
        ),
      );
      setInitialized(true);
    }
  }, [initFilters, initialized, osaamiset]);

  // Determines if osaamiset from a specific source should be visible. Id is the id of the source (eg. koulutus or toimenkuva).
  // Muu osaaminen doesn't have any sources, so they'll show up if any are marked as checked.
  const isOsaaminenVisible = React.useCallback(
    (type: OsaaminenLahdeTyyppi, id?: string): boolean => {
      return type === 'MUU_OSAAMINEN'
        ? selectedFilters.MUU_OSAAMINEN.length > 0 && selectedFilters.MUU_OSAAMINEN.some((item) => item.checked)
        : selectedFilters[type]?.find((item) => item.value === id)?.checked ?? false;
    },
    [selectedFilters],
  );

  const sortedOsaamiset = React.useMemo(
    () => [...osaamiset].sort(sortByProperty(`osaaminen.nimi.${locale}`)),
    [osaamiset, locale],
  );

  const MobileFilterButton = () => {
    return !sm ? (
      <RoundButton
        size="sm"
        bgColor="white"
        label={t('profile.competences.show-filters')}
        hideLabel
        onClick={() => setShowFilters(true)}
        icon={<MdTune size={24} />}
      />
    ) : (
      <></>
    );
  };

  return (
    <MainLayout
      navChildren={
        <div className="flex flex-col gap-5">
          <SimpleNavigationList title={t('profile.index')}>
            <RoutesNavigationList routes={navigationRoutes} />
          </SimpleNavigationList>
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
      <Title value={title} />
      <h1 className="mb-5 text-heading-1">{title}</h1>
      <p className="mb-8 text-body-lg text-todo">{t('profile.competences.description')}</p>
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
              <div className="flex flex-row justify-end gap-4">
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
            mobileFilterOpenerComponent={<MobileFilterButton />}
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
            mobileFilterOpenerComponent={<MobileFilterButton />}
          />
        )}
      </div>
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button
              disabled
              variant="white"
              label={t('profile.competences.add')}
              onClick={() => {
                alert(t('profile.competences.add'));
              }}
            />
            <Button
              disabled
              variant="white"
              label={t('share')}
              onClick={() => {
                alert(t('share'));
              }}
            />
            <Button
              disabled
              variant="white"
              label={t('edit')}
              onClick={() => {
                alert(t('edit'));
              }}
            />
          </div>,
          actionBar,
        )}
    </MainLayout>
  );
};

export default Competences;
