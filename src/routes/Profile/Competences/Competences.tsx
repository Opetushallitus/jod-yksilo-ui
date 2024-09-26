import { client } from '@/api/client';
import {
  MainLayout,
  RoutesNavigationList,
  SimpleNavigationList,
  Title,
  type RoutesNavigationListProps,
} from '@/components';
import { OSAAMINEN_COLOR_MAP } from '@/constants';
import { useActionBar } from '@/hooks/useActionBar';
import { GroupByAlphabet } from '@/routes/Profile/Competences/GroupByAlphabet';
import { GroupBySource } from '@/routes/Profile/Competences/GroupBySource';
import { CompetencesLoaderData } from '@/routes/Profile/Competences/loader';
import {
  Accordion,
  Button,
  Checkbox,
  Modal,
  RadioButton,
  RadioButtonGroup,
  RoundButton,
  useMediaQueries,
} from '@jod/design-system';
import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { MdTune } from 'react-icons/md';
import { useLoaderData, useOutletContext } from 'react-router-dom';
import { mapNavigationRoutes } from '../utils';
import { GROUP_BY_ALPHABET, GROUP_BY_SOURCE, GROUP_BY_THEME, type FiltersType } from './constants';

const Competences = () => {
  const routes = useOutletContext<RoutesNavigationListProps['routes']>();
  const { toimenkuvat, koulutukset, patevyydet, osaamiset: osaamisetData } = useLoaderData() as CompetencesLoaderData;
  const [initialized, setInitialized] = React.useState(false);
  const [osaamiset, setOsaamiset] = React.useState(osaamisetData);
  const { t, i18n } = useTranslation();
  const title = t('profile.competences');
  const [groupBy, setGroupBy] = React.useState<string>(GROUP_BY_SOURCE);
  const navigationRoutes = React.useMemo(() => mapNavigationRoutes(routes), [routes]);
  const actionBar = useActionBar();
  const locale = i18n.language as 'fi' | 'sv';
  const [selectedFilters, setSelectedFilters] = React.useState<FiltersType>({});
  const [filterKeys, setFilterKeys] = React.useState<(keyof FiltersType)[]>([]);
  const [showFilters, setShowFilters] = React.useState(false);
  const { sm } = useMediaQueries();

  const mapExperienceToFilter = React.useCallback(
    (currentFilters: FiltersType, type: OsaaminenLahdeTyyppi) => (experience: Kokemus) => ({
      label: experience.nimi[locale] ?? '',
      value: experience.id ?? '',
      checked: currentFilters?.[type]?.find((item) => item.value === experience.id)?.checked ?? true,
    }),
    [locale],
  );

  const initFilters = React.useCallback(
    (osaamiset: OsaaminenApiResponse[]) => {
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
      });

      return initialFilters;
    },
    [koulutukset, mapExperienceToFilter, patevyydet, selectedFilters, toimenkuvat],
  );

  React.useEffect(() => {
    if (!initialized) {
      const initialFilters = initFilters(osaamiset);
      setSelectedFilters(initialFilters);
      setFilterKeys(Object.keys(initialFilters) as (keyof FiltersType)[]);
      setInitialized(true);
    }
  }, [initFilters, initialized, osaamiset]);

  const deleteOsaaminen = async (id: string) => {
    try {
      await client.DELETE('/api/profiili/osaamiset', {
        params: { query: { ids: [id] } },
      });

      setOsaamiset(osaamiset.filter((osaaminen) => osaaminen.id !== id));
      initFilters(osaamiset);
    } catch (error) {
      // Ignore abort errors
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        throw error;
      }
    }
  };

  const toggleSingleFilter = (type: OsaaminenLahdeTyyppi, index: number) => () => {
    const newFilter = { ...selectedFilters };
    newFilter[type] = newFilter[type] ?? [];

    newFilter[type]![index] = newFilter[type]![index] || {};

    if (newFilter[type]?.[index]) {
      newFilter[type]![index].checked = !newFilter[type]![index].checked;
      setSelectedFilters(newFilter);
    }
  };

  const isOsaaminenVisible = (type: OsaaminenLahdeTyyppi, id: string): boolean =>
    selectedFilters[type]?.find((item) => item.value === id)?.checked ?? false;

  const isFilterTypeChecked = (type: OsaaminenLahdeTyyppi) =>
    (Array.isArray(selectedFilters[type]) &&
      selectedFilters[type]!.length > 0 &&
      selectedFilters[type]?.some((item) => item.checked)) ??
    false;

  const toggleFiltersByType = (type: OsaaminenLahdeTyyppi) => () => {
    const newFilter = { ...selectedFilters };
    newFilter[type] = newFilter[type] ?? [];

    // If there are any checked items, uncheck all, otherwise check all
    const targetState = !isFilterTypeChecked(type);

    newFilter[type]?.forEach((item) => {
      item.checked = targetState;
    });

    setSelectedFilters(newFilter);
  };

  const MobileFilterButton = () => {
    return !sm ? (
      <RoundButton
        size="sm"
        bgColor="white"
        label="Näytä suodattimet"
        hideLabel
        onClick={() => setShowFilters(true)}
        icon={<MdTune size={24} />}
      />
    ) : (
      <></>
    );
  };

  const Filters = () => (
    <>
      <SimpleNavigationList title="Järjestele" backgroundClassName={sm ? 'bg-bg-gray-2' : 'bg-bg-gray'} collapsible>
        <RadioButtonGroup value={groupBy} onChange={setGroupBy} className="py-4" label="Järjestele (kaikki)" hideLabel>
          <RadioButton label="Lähteiden mukaan" value={GROUP_BY_SOURCE} />
          <RadioButton label="Teemoittain" value={GROUP_BY_THEME} />
          <RadioButton label="Aakkosellisesti" value={GROUP_BY_ALPHABET} />
        </RadioButtonGroup>
      </SimpleNavigationList>
      <SimpleNavigationList title="Suodata" backgroundClassName={sm ? 'bg-bg-gray-2' : 'bg-bg-gray'} collapsible>
        <div className="flex flex-col gap-y-3 py-4">
          {filterKeys.map((key) => (
            <Accordion
              key={key}
              title={
                <Checkbox
                  label={
                    <span className="flex items-center hyphens-auto" lang={locale}>
                      <div
                        className={`mx-3 h-5 w-5 flex-none rounded-full ds-bg-tag-${OSAAMINEN_COLOR_MAP[key]}`}
                        aria-hidden
                      />
                      {t(`types.competence.${key}`)}
                    </span>
                  }
                  checked={isFilterTypeChecked(key)}
                  onChange={toggleFiltersByType(key)}
                  ariaLabel="Työpaikka osaamiset"
                  name="suodata"
                  value="tyopaikka-osaamiset"
                  className="min-h-7"
                />
              }
              expandMoreText={t('expand-more')}
              expandLessText={t('expand-less')}
              lang={locale}
            >
              {selectedFilters[key]?.map((item, idx) => (
                <div className="pl-6" key={item.value}>
                  <Checkbox
                    name={item.label}
                    ariaLabel={`${key} ${item.label}`}
                    label={item.label}
                    checked={item.checked}
                    onChange={toggleSingleFilter(key, idx)}
                    value={item.value}
                  />
                </div>
              ))}
            </Accordion>
          ))}
        </div>
      </SimpleNavigationList>
    </>
  );

  return (
    <MainLayout
      navChildren={
        <div className="flex flex-col gap-5">
          <SimpleNavigationList title={t('profile.index')}>
            <RoutesNavigationList routes={navigationRoutes} />
          </SimpleNavigationList>
          <Filters />
        </div>
      }
    >
      <Title value={title} />
      <h1 className="mb-5 text-heading-1 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-lg font-semibold">
        simul accusata no ius. Volumus corpora per te, pri lucilius salutatus iracundia ut. Mutat posse voluptua quo cu,
        in albucius nominavi principes eum, quem facilisi cotidieque mel no.
      </p>
      <div>
        {!sm && (
          <Modal
            open={showFilters}
            onClose={() => setShowFilters(false)}
            content={<Filters />}
            footer={
              <div className="flex flex-row justify-end gap-4">
                <Button variant="white" label="Sulje" onClick={() => setShowFilters(false)} />
              </div>
            }
          />
        )}
        {groupBy === GROUP_BY_SOURCE && (
          <GroupBySource
            filters={selectedFilters}
            filterKeys={filterKeys}
            locale={locale}
            osaamiset={osaamiset}
            deleteOsaaminen={deleteOsaaminen}
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
            deleteOsaaminen={deleteOsaaminen}
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
              label="Lisää osaaminen"
              onClick={() => {
                alert('Lisää');
              }}
            />
            <Button
              disabled
              variant="white"
              label="Jaa"
              onClick={() => {
                alert('Jaa');
              }}
            />
            <Button
              disabled
              variant="white"
              label="Muokkaa"
              onClick={() => {
                alert('Muokkaa');
              }}
            />
          </div>,
          actionBar,
        )}
    </MainLayout>
  );
};

export default Competences;
