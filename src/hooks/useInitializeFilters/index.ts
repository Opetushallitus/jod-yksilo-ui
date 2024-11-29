import { CompetenceFilter, FILTERS_ORDER, FiltersType } from '@/routes/Profile/Competences/constants';
import { Kokemus } from '@/routes/types';
import React from 'react';

const mapExperienceToFilter =
  (locale: string) => (currentFilters: FiltersType, type: CompetenceFilter) => (experience: Kokemus) => ({
    label: experience.nimi[locale] ?? '',
    value: experience.id ?? experience.uri ?? '',
    checked: currentFilters?.[type]?.find((item) => item.value === experience.id)?.checked ?? true,
    competences: experience.osaamiset || [],
  });

const initFilters = (
  locale: string,
  selectedFilters: FiltersType,
  toimenkuvat: Kokemus[],
  koulutukset: Kokemus[],
  patevyydet: Kokemus[],
  muutOsaamiset: Kokemus[],
): FiltersType => {
  const mapExperience = mapExperienceToFilter(locale);

  const initialFilters = {
    TOIMENKUVA: toimenkuvat.map(mapExperience(selectedFilters, 'TOIMENKUVA')),
    KOULUTUS: koulutukset.map(mapExperience(selectedFilters, 'KOULUTUS')),
    PATEVYYS: patevyydet.map(mapExperience(selectedFilters, 'PATEVYYS')),
    MUU_OSAAMINEN: muutOsaamiset.map(mapExperience(selectedFilters, 'MUU_OSAAMINEN')),
  };

  return initialFilters;
};

export const useInitializeFilters = (
  locale: string,
  initialSelectedFilters: FiltersType,
  toimenkuvat: Kokemus[],
  koulutukset: Kokemus[],
  patevyydet: Kokemus[],
  muutOsaamiset: Kokemus[],
) => {
  const [initialized, setInitialized] = React.useState(false);
  const [filterKeys, setFilterKeys] = React.useState<(keyof FiltersType)[]>([]);
  const [selectedFilters, setSelectedFilters] = React.useState<FiltersType>(initialSelectedFilters);

  const initializeFilters = React.useCallback(
    () => initFilters(locale, selectedFilters, toimenkuvat, koulutukset, patevyydet, muutOsaamiset),
    [locale, selectedFilters, toimenkuvat, koulutukset, patevyydet, muutOsaamiset],
  );

  React.useEffect(() => {
    if (!initialized) {
      const initialFilters = initializeFilters();
      setSelectedFilters(initialFilters);
      setFilterKeys(
        [...(Object.keys(initialFilters) as (keyof FiltersType)[])].sort(
          (a, b) => FILTERS_ORDER.indexOf(a) - FILTERS_ORDER.indexOf(b),
        ),
      );
      setInitialized(true);
    }
  }, [initialized, initializeFilters]);

  return { selectedFilters, setSelectedFilters, filterKeys };
};
