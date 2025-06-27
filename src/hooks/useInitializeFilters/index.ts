import { components } from '@/api/schema';
import { CompetenceFilter, FILTERS_ORDER, FiltersType } from '@/routes/Profile/Competences/constants';
import { CompetenceDataGroup } from '@/routes/Profile/Competences/loader';
import { Kokemus } from '@/routes/types';
import { getLocalizedText } from '@/utils';
import React from 'react';

const mapExperienceToFilter = (locale: string) => (currentFilters: FiltersType) => (experience: Kokemus) => ({
  label: experience.nimi[locale] ?? '',
  value: [experience.id ?? experience.uri ?? ''],
  checked:
    currentFilters?.['MUU_OSAAMINEN']?.find((item) => (experience.id ? item.value.includes(experience.id) : false))
      ?.checked ?? true,
  competences: experience.osaamiset || [],
});

const mapCompetenceDataGroupToFilter =
  (locale: string) => (currentFilters: FiltersType, type: CompetenceFilter) => (cdg: CompetenceDataGroup) => ({
    label: cdg.nimi[locale] ?? '',
    value: cdg.data?.map((d) => d.id ?? '') ?? [],
    checked:
      currentFilters?.[type]?.find((filter) => (cdg.id ? filter.value.includes(cdg.id) : false))?.checked ?? true,
    competences: cdg.data?.flatMap((d) => d.osaamiset ?? []) ?? [],
  });

const initFilters = (
  locale: string,
  selectedFilters: FiltersType,
  toimenkuvat: CompetenceDataGroup[],
  koulutukset: CompetenceDataGroup[],
  patevyydet: CompetenceDataGroup[],
  muutOsaamiset: Kokemus[],
  muutOsaamisetVapaateksti?: components['schemas']['LokalisoituTeksti'],
): FiltersType => {
  const mapCompetenceDataGroup = mapCompetenceDataGroupToFilter(locale);
  const mapExperience = mapExperienceToFilter(locale);

  const localizedMuutOsaamisetVapaateksti = getLocalizedText(muutOsaamisetVapaateksti);
  const initialFilters = {
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

  return initialFilters;
};

export const useInitializeFilters = (
  locale: string,
  initialSelectedFilters: FiltersType,
  toimenkuvat: CompetenceDataGroup[],
  koulutukset: CompetenceDataGroup[],
  patevyydet: CompetenceDataGroup[],
  muutOsaamiset: Kokemus[],
  muutOsaamisetVapaateksti?: components['schemas']['LokalisoituTeksti'],
) => {
  const [initialized, setInitialized] = React.useState(false);
  const [filterKeys, setFilterKeys] = React.useState<(keyof FiltersType)[]>([]);
  const [selectedFilters, setSelectedFilters] = React.useState<FiltersType>(initialSelectedFilters);

  const initializeFilters = React.useCallback(
    () =>
      initFilters(
        locale,
        selectedFilters,
        toimenkuvat,
        koulutukset,
        patevyydet,
        muutOsaamiset,
        muutOsaamisetVapaateksti,
      ),
    [locale, selectedFilters, toimenkuvat, koulutukset, patevyydet, muutOsaamiset, muutOsaamisetVapaateksti],
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
