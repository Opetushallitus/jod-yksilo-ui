import { components } from '@/api/schema';
import { type CompetenceSourceType, FILTERS_ORDER, type FiltersType } from '@/routes/Profile/Competences/constants';
import { CompetenceDataGroup } from '@/routes/Profile/Competences/loader';
import type { Kokemus } from '@/routes/types';
import { getLocalizedText } from '@/utils';
import React from 'react';

export interface FilterData {
  toimenkuvat: CompetenceDataGroup[];
  koulutukset: CompetenceDataGroup[];
  patevyydet: CompetenceDataGroup[];
  muutOsaamiset: Kokemus[];
  kiinnostukset?: components['schemas']['OsaaminenDto'][];
  muutOsaamisetVapaateksti?: components['schemas']['LokalisoituTeksti'];
  kiinnostuksetVapaateksti?: components['schemas']['LokalisoituTeksti'];
}

const mapExperienceToFilter = (locale: string) => (currentFilters: FiltersType) => (experience: Kokemus) => ({
  label: experience.nimi[locale] ?? '',
  value: [experience.id ?? experience.uri ?? ''],
  checked:
    currentFilters?.['MUU_OSAAMINEN']?.find((item) => (experience.id ? item.value.includes(experience.id) : false))
      ?.checked ?? true,
  competences: experience.osaamiset || [],
});

const mapCompetenceDataGroupToFilter =
  (locale: string) => (currentFilters: FiltersType, type: CompetenceSourceType) => (cdg: CompetenceDataGroup) => ({
    label: cdg.nimi[locale] ?? '',
    value: cdg.data?.map((d) => d.id ?? '') ?? [],
    checked:
      currentFilters?.[type]?.find((filter) => (cdg.id ? filter.value.includes(cdg.id) : false))?.checked ?? true,
    competences: cdg.data?.flatMap((d) => d.osaamiset ?? []) ?? [],
  });

const initFilters = (locale: string, selectedFilters: FiltersType, data: FilterData): FiltersType => {
  const mapCompetenceDataGroup = mapCompetenceDataGroupToFilter(locale);
  const mapExperience = mapExperienceToFilter(locale);
  const {
    toimenkuvat,
    muutOsaamiset,
    kiinnostukset,
    muutOsaamisetVapaateksti,
    kiinnostuksetVapaateksti,
    koulutukset,
    patevyydet,
  } = data;

  const localizedMuutOsaamisetVapaateksti = getLocalizedText(muutOsaamisetVapaateksti);
  const localizedKiinnostuksetVapaateksti = getLocalizedText(kiinnostuksetVapaateksti);

  const initialFilters: FiltersType = {
    TOIMENKUVA: toimenkuvat.map(mapCompetenceDataGroup(selectedFilters, 'TOIMENKUVA')),
    KOULUTUS: koulutukset.map(mapCompetenceDataGroup(selectedFilters, 'KOULUTUS')),
    PATEVYYS: patevyydet.map(mapCompetenceDataGroup(selectedFilters, 'PATEVYYS')),
    MUU_OSAAMINEN: [
      ...muutOsaamiset.map(mapExperience(selectedFilters)),
      {
        label: '',
        value: [],
        checked: localizedMuutOsaamisetVapaateksti.length > 0,
        competences: [],
      },
    ],
  };

  // Handle optional filters
  if (kiinnostukset) {
    initialFilters.KIINNOSTUS = [
      ...kiinnostukset.map(mapExperience(selectedFilters)),
      {
        label: '',
        value: [],
        checked: localizedKiinnostuksetVapaateksti.length > 0,
        competences: [],
      },
    ];
  }

  return initialFilters;
};

export const useInitializeFilters = (locale: string, initialSelectedFilters: FiltersType, data: FilterData) => {
  const [initialized, setInitialized] = React.useState(false);
  const [filterKeys, setFilterKeys] = React.useState<(keyof FiltersType)[]>([]);
  const [selectedFilters, setSelectedFilters] = React.useState<FiltersType>(initialSelectedFilters);

  const initializeFilters = React.useCallback(
    () => initFilters(locale, selectedFilters, data),
    [data, locale, selectedFilters],
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
