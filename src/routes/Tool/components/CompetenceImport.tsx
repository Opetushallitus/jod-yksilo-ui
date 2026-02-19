import { client } from '@/api/client';
import { osaamiset as osaamisetService } from '@/api/osaamiset';
import { type FilterData, useInitializeFilters } from '@/hooks/useInitializeFilters';
import { useModal } from '@/hooks/useModal';
import { CompetenceFilters } from '@/routes/Profile/Competences/CompetenceFilters';
import { FILTERS_ORDER, type FiltersType } from '@/routes/Profile/Competences/constants';
import type { OsaaminenLahdeTyyppi } from '@/routes/types';
import { useToolStore } from '@/stores/useToolStore';
import { hasLocalizedText, removeDuplicatesByKey } from '@/utils';
import { Button } from '@jod/design-system';
import React from 'react';
import toast from 'react-hot-toast/headless';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import { useShallow } from 'zustand/shallow';
import type { ToolLoaderData } from '../loader';
import { mergeUniqueValuesExcludingType } from '../utils';

export const CompetenceImport = ({ onImportSuccess }: { onImportSuccess?: () => void }) => {
  const { t } = useTranslation();
  const { showDialog } = useModal();

  // Store current filter selection for access in confirm handler
  const selectedFiltersRef = React.useRef<FiltersType | null>(null);
  const handleFiltersChange = React.useCallback((filters: FiltersType) => {
    selectedFiltersRef.current = filters;
  }, []);

  const {
    storeOsaamiset,
    storeKiinnostukset,
    setOsaamiset,
    setOsaamisetVapaateksti,
    setKiinnostukset,
    setKiinnostuksetVapaateksti,
  } = useToolStore(
    useShallow((state) => ({
      kiinnostuksetVapaateksti: state.kiinnostuksetVapaateksti,
      muutOsaamisetVapaateksti: state.osaamisetVapaateksti,
      storeOsaamiset: state.osaamiset,
      storeKiinnostukset: state.kiinnostukset,
      setOsaamiset: state.setOsaamiset,
      setOsaamisetVapaateksti: state.setOsaamisetVapaateksti,
      setKiinnostukset: state.setKiinnostukset,
      setKiinnostuksetVapaateksti: state.setKiinnostuksetVapaateksti,
    })),
  );
  const {
    toimenkuvat,
    koulutukset,
    patevyydet,
    muutOsaamiset,
    muutOsaamisetVapaateksti,
    osaamiset,
    isLoggedIn,
    kiinnostukset,
    kiinnostuksetVapaateksti,
  } = useLoaderData<ToolLoaderData>();

  const filterData: FilterData = React.useMemo(
    () => ({
      toimenkuvat,
      koulutukset,
      patevyydet,
      muutOsaamiset,
      kiinnostukset,
      muutOsaamisetVapaateksti,
      kiinnostuksetVapaateksti,
    }),
    [
      toimenkuvat,
      koulutukset,
      patevyydet,
      muutOsaamiset,
      kiinnostukset,
      muutOsaamisetVapaateksti,
      kiinnostuksetVapaateksti,
    ],
  );

  const importKiinnostuksetFromProfile = React.useCallback(async () => {
    globalThis._paq?.push(['trackEvent', 'yksilo.Kartoitustyökalut', 'Klikkaus', 'Profiilista tuonti']);
    const { data } = await client.GET('/api/profiili/kiinnostukset/osaamiset');
    const newKiinnostukset = (await osaamisetService.find(data?.kiinnostukset)).map((k) => ({
      id: k.uri,
      nimi: k.nimi,
      kuvaus: k.kuvaus,
      tyyppi: 'KIINNOSTUS' as OsaaminenLahdeTyyppi,
    }));

    setKiinnostukset(mergeUniqueValuesExcludingType(storeKiinnostukset, newKiinnostukset, 'KIINNOSTUS'));
    setKiinnostuksetVapaateksti(data?.vapaateksti);
  }, [setKiinnostukset, setKiinnostuksetVapaateksti, storeKiinnostukset]);

  const onCompetenceImportConfirm = React.useCallback(async () => {
    try {
      const selectedFilters: FiltersType = selectedFiltersRef.current ?? {
        TOIMENKUVA: [],
        KOULUTUS: [],
        PATEVYYS: [],
        MUU_OSAAMINEN: [],
        KIINNOSTUS: [],
      };
      const mappedSelectedCompetences = FILTERS_ORDER.flatMap((tyyppi) =>
        (selectedFilters[tyyppi] ?? [])
          .filter((sf) => sf.checked)
          .map((f) => ({
            id: f.value,
            tyyppi: tyyppi,
          })),
      );

      const importedInterests = kiinnostukset
        .filter((kiinnostus) =>
          mappedSelectedCompetences.some((msc) => msc.tyyppi === 'KIINNOSTUS' && msc.id.includes(kiinnostus.uri)),
        )
        .map((k) => ({
          id: k.uri,
          nimi: k.nimi,
          kuvaus: k.kuvaus,
          tyyppi: 'KIINNOSTUS' as OsaaminenLahdeTyyppi,
        }));

      const currentAndImportedSkills = [
        ...osaamiset
          .filter((osaaminen) => {
            return mappedSelectedCompetences.some((msc) => {
              if (msc.tyyppi === 'MUU_OSAAMINEN') {
                return msc.id.includes(osaaminen.osaaminen.uri) && osaaminen.lahde.tyyppi === 'MUU_OSAAMINEN';
              } else if (osaaminen.lahde.id) {
                return msc.id.includes(osaaminen.lahde.id) && msc.tyyppi === osaaminen.lahde.tyyppi;
              }
              return false;
            });
          })
          .map((skill) => ({
            id: skill.osaaminen.uri,
            nimi: skill.osaaminen.nimi,
            kuvaus: skill.osaaminen.kuvaus,
            tyyppi: skill.lahde.tyyppi,
          })),
        ...storeOsaamiset.filter((o) => o.tyyppi === 'KARTOITETTU'),
      ];

      // Count occurrences for each id
      const occurrences = currentAndImportedSkills.reduce(
        (acc, item) => {
          acc[item.id] = (acc[item.id] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      // Remove duplicates and sort by occurrence count
      const filtered = removeDuplicatesByKey(currentAndImportedSkills, (item) => item.id + item.tyyppi).sort(
        (a, b) => occurrences[b.id] - occurrences[a.id],
      );

      setOsaamiset(filtered);

      const hasMuutOsaamisetVapaateksti =
        mappedSelectedCompetences.some((o) => o.tyyppi === 'MUU_OSAAMINEN' && o.id.length === 0) &&
        hasLocalizedText(muutOsaamisetVapaateksti);
      if (currentAndImportedSkills.some((o) => o.tyyppi === 'MUU_OSAAMINEN') || hasMuutOsaamisetVapaateksti) {
        const { data } = await client.GET('/api/profiili/muu-osaaminen');
        setOsaamisetVapaateksti(data?.vapaateksti);
      }

      const hasKiinnostuksetVapaateksti =
        mappedSelectedCompetences.some((o) => o.tyyppi === 'KIINNOSTUS' && o.id.length === 0) &&
        hasLocalizedText(kiinnostuksetVapaateksti);
      if (importedInterests.length > 0 || hasKiinnostuksetVapaateksti) {
        await importKiinnostuksetFromProfile();
      }

      toast.success(t('tool.my-own-data.competences.import.success-toast'));
      onImportSuccess?.();
    } catch (_error) {
      toast.error(t('tool.my-own-data.competences.import.failure-toast'));
    }
  }, [
    importKiinnostuksetFromProfile,
    kiinnostukset,
    kiinnostuksetVapaateksti,
    muutOsaamisetVapaateksti,
    onImportSuccess,
    osaamiset,
    setOsaamiset,
    setOsaamisetVapaateksti,
    storeOsaamiset,
    t,
  ]);

  // Memoized render function for dialog content to avoid "component during render" lint warning
  const renderFilterContent = React.useCallback(
    () => <StatefulCompetenceImportFilters onFiltersChange={handleFiltersChange} data={filterData} />,
    [filterData, handleFiltersChange],
  );

  const hasCompentencesToImport = React.useMemo(() => {
    return (
      Object.values(filterData).some((competenceGroup) => competenceGroup?.length > 0) ||
      hasLocalizedText(filterData.muutOsaamisetVapaateksti ?? {}) ||
      hasLocalizedText(filterData.kiinnostuksetVapaateksti ?? {})
    );
  }, [filterData]);

  const showImportDialog = React.useCallback(() => {
    if (hasCompentencesToImport) {
      showDialog({
        title: t('tool.my-own-data.competences.import.confirm-title'),
        description: t('tool.my-own-data.competences.import.confirm-description'),
        onConfirm: onCompetenceImportConfirm,
        confirmText: t('tool.my-own-data.competences.import.confirm-button'),
        cancelText: t('common:cancel'),
        content: renderFilterContent,
        variant: 'normal',
      });
    } else {
      showDialog({
        title: t('tool.my-own-data.competences.import.no-data-title'),
        description: t('tool.my-own-data.competences.import.no-data-description'),
        confirmText: t('close'),
        hideSecondaryButton: true,
        variant: 'normal',
      });
    }
  }, [hasCompentencesToImport, onCompetenceImportConfirm, renderFilterContent, showDialog, t]);

  return (
    <Button
      data-testid="competence-import-button"
      className="w-fit"
      label={t('tool.my-own-data.competences.import.import-button')}
      disabled={!isLoggedIn}
      variant="gray"
      size="sm"
      onClick={showImportDialog}
    />
  );
};

/**
 * Wrapper component that manages its own filter state internally.
 * Reports filter changes via callback so parent can access current selection on confirm.
 */
const StatefulCompetenceImportFilters = ({
  onFiltersChange,
  data,
}: {
  onFiltersChange: (selectedFilters: FiltersType) => void;
  data: FilterData;
}) => {
  const { selectedFilters, setSelectedFilters, filterKeys } = useInitializeFilters(
    {
      TOIMENKUVA: [],
      KOULUTUS: [],
      PATEVYYS: [],
      MUU_OSAAMINEN: [],
      KIINNOSTUS: [],
    },
    data,
  );

  // Wrap setSelectedFilters to also report changes to parent
  const handleSetSelectedFilters = React.useCallback(
    (newFilters: FiltersType) => {
      setSelectedFilters(newFilters);
      onFiltersChange(newFilters);
    },
    [setSelectedFilters, onFiltersChange],
  );

  // Report initial filters on mount
  React.useEffect(() => {
    onFiltersChange(selectedFilters);
    // We only want to report the initial filters on mount, not on every change, so we disable exhaustive-deps here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CompetenceFilters
      filterKeys={filterKeys}
      selectedFilters={selectedFilters}
      setSelectedFilters={handleSetSelectedFilters}
    />
  );
};
