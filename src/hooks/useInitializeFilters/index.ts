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

const mapExperienceToFilter = (currentFilters: FiltersType) => (experience: Kokemus) => ({
  label: experience.nimi,
  value: [experience.id ?? experience.uri ?? ''],
  checked:
    currentFilters?.['MUU_OSAAMINEN']?.find((item) => (experience.id ? item.value.includes(experience.id) : false))
      ?.checked ?? true,
  competences: experience.osaamiset || [],
});

const mapCompetenceDataGroupToFilter =
  (currentFilters: FiltersType, type: CompetenceSourceType) => (cdg: CompetenceDataGroup) => ({
    label: cdg.nimi,
    value: cdg.data?.map((d) => d.id ?? '') ?? [],
    checked:
      currentFilters?.[type]?.find((filter) => (cdg.id ? filter.value.includes(cdg.id) : false))?.checked ?? true,
    competences: cdg.data?.flatMap((d) => d.osaamiset ?? []) ?? [],
  });

const initFilters = (selectedFilters: FiltersType, data: FilterData): FiltersType => {
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
    TOIMENKUVA: toimenkuvat.map(mapCompetenceDataGroupToFilter(selectedFilters, 'TOIMENKUVA')),
    KOULUTUS: koulutukset.map(mapCompetenceDataGroupToFilter(selectedFilters, 'KOULUTUS')),
    PATEVYYS: patevyydet.map(mapCompetenceDataGroupToFilter(selectedFilters, 'PATEVYYS')),
    MUU_OSAAMINEN: [
      ...muutOsaamiset.map(mapExperienceToFilter(selectedFilters)),
      ...(localizedMuutOsaamisetVapaateksti.length > 0
        ? [
            {
              label: {},
              value: [],
              checked: true,
              competences: [],
            },
          ]
        : []),
    ],
  };

  // Handle optional filters
  if (kiinnostukset) {
    initialFilters.KIINNOSTUS = [
      ...kiinnostukset.map(mapExperienceToFilter(selectedFilters)),
      ...(localizedKiinnostuksetVapaateksti.length > 0
        ? [
            {
              label: {},
              value: [],
              checked: true,
              competences: [],
            },
          ]
        : []),
    ];
  }

  return initialFilters;
};

export const useInitializeFilters = (initialSelectedFilters: FiltersType, data: FilterData) => {
  const [selectedFilters, setSelectedFilters] = React.useState<FiltersType>(() =>
    initFilters(initialSelectedFilters, data),
  );

  const filterKeys = React.useMemo(
    () =>
      [...(Object.keys(selectedFilters) as (keyof FiltersType)[])].sort(
        (a, b) => FILTERS_ORDER.indexOf(a) - FILTERS_ORDER.indexOf(b),
      ),
    [selectedFilters],
  );

  return { selectedFilters, setSelectedFilters, filterKeys };
};
