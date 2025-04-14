import { client } from '@/api/client.ts';
import { components } from '@/api/schema';
import { ExperienceTable, MainLayout, type ExperienceTableRowData } from '@/components';
import { TooltipWrapper } from '@/components/Tooltip/TooltipWrapper';
import { EducationHistoryWizard } from '@/routes/Profile/EducationHistory/EducationHistoryWizard';
import EditKoulutuskokonaisuusModal from '@/routes/Profile/EducationHistory/modals/EditKoulutuskokonaisuusModal';
import ImportKoulutusSummaryModal from '@/routes/Profile/EducationHistory/modals/ImportKoulutusSummaryModal';
import { Button } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useRevalidator, useSearchParams } from 'react-router';
import { ProfileNavigationList } from '../components/index.tsx';
import AddOrEditKoulutusModal from './modals/AddOrEditKoulutusModal';
import ImportKoulutusResultModal from './modals/ImportKoulutusResultModal';
import ImportKoulutusStartModal from './modals/ImportKoulutusStartModal';
import { getEducationHistoryTableRows, Koulutuskokonaisuus } from './utils';

const EducationHistory = () => {
  const { koulutuskokonaisuudet, osaamisetMap } = useLoaderData() as {
    koulutuskokonaisuudet: Koulutuskokonaisuus[];
    osaamisetMap: Record<
      string,
      {
        id: string;
        nimi: Record<string, string>;
        kuvaus: Record<string, string>;
      }
    >;
  };
  const { t } = useTranslation();
  const title = t('profile.education-history.title');
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [isKoulutuskokonaisuusOpen, setIsKoulutuskokonaisuusOpen] = React.useState(false);
  const [isKoulutusOpen, setIsKoulutusOpen] = React.useState(false);
  const [koulutusId, setKoulutusId] = React.useState<string | undefined>(undefined);
  const [koulutuskokonaisuusId, setKoulutuskokonaisuusId] = React.useState<string | undefined>(undefined);
  const [rows, setRows] = React.useState<ExperienceTableRowData[]>(
    getEducationHistoryTableRows(koulutuskokonaisuudet, osaamisetMap),
  );
  const revalidator = useRevalidator(); // For reloading data after modal close
  const [isImportStartModalOpen, setIsImportStartModalOpen] = React.useState(false);
  const [isImportSummaryModalOpen, setIsImportSummaryModalOpen] = React.useState(false);
  const [isImportResultModalOpen, setIsImportResultModalOpen] = React.useState(false);
  const [importResultErrorText, setImportResultErrorText] = React.useState<string | undefined>(undefined);
  const [isImportSuccess, setIsImportSuccess] = React.useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [isOsaamisetTunnistusOngoing, setIsOsaamisetTunnistusOngoing] = React.useState(true);

  React.useEffect(() => {
    setRows(getEducationHistoryTableRows(koulutuskokonaisuudet, osaamisetMap));
  }, [koulutuskokonaisuudet, osaamisetMap]);

  React.useEffect(() => {
    const isIdentifyingCompetence = rows.some(
      (row) => row.osaamisetOdottaaTunnistusta || row.subrows?.some((subRow) => subRow.osaamisetOdottaaTunnistusta),
    );
    setIsOsaamisetTunnistusOngoing(isIdentifyingCompetence);
  }, [rows]);

  const onRowClick = (row: ExperienceTableRowData) => {
    setKoulutuskokonaisuusId(row.key);
    setIsKoulutuskokonaisuusOpen(true);
  };

  const onNestedRowClick = (row: ExperienceTableRowData) => {
    const koulutus = koulutuskokonaisuudet.find((kk) => kk.koulutukset.find((k) => k.id === row.key));
    if (koulutus?.id) {
      setKoulutuskokonaisuusId(koulutus.id);
      setKoulutusId(row.key);
      setIsKoulutusOpen(true);
    }
  };

  const onAddNestedRowClick = (row: ExperienceTableRowData) => {
    setKoulutuskokonaisuusId(row.key);
    setIsKoulutusOpen(true);
  };

  const onCloseKategoriaModal = () => {
    setIsKoulutuskokonaisuusOpen(false);
    setKoulutuskokonaisuusId(undefined);
    revalidator.revalidate();
  };

  const onCloseKoulutusModal = () => {
    setIsKoulutusOpen(false);
    setKoulutusId(undefined);
    revalidator.revalidate();
  };

  const onCloseWizard = () => {
    setIsWizardOpen(false);
    revalidator.revalidate();
  };

  const openImportStartModal = () => {
    setImportResultErrorText(undefined);
    setIsImportStartModalOpen(true);
  };

  const closeImportStartModal = () => {
    setIsImportStartModalOpen(false);
  };

  const openImportSummaryModal = () => {
    setIsImportSummaryModalOpen(true);
  };

  const closeImportSummaryModal = () => {
    setIsImportSummaryModalOpen(false);
  };

  const openImportResultModal = (result: boolean) => {
    setIsImportSuccess(result);
    setIsImportResultModalOpen(true);
  };

  const closeImportResultModal = () => {
    setIsImportResultModalOpen(false);
    revalidator.revalidate();
  };

  React.useEffect(() => {
    const result = searchParams.get('koski');
    if (result) {
      setSearchParams({});
      if (result === 'authorized') {
        openImportSummaryModal();
      } else if (result === 'error') {
        setImportResultErrorText(t('education-history-import.result-modal.give-permission-failed'));
        openImportResultModal(false);
      }
    }
  }, [searchParams, setSearchParams, t]);

  const updateRowSubrows = <ContextType,>(
    row: ExperienceTableRowData,
    transformSubrow: (subrow: ExperienceTableRowData, context: ContextType) => ExperienceTableRowData,
    context: ContextType,
  ): ExperienceTableRowData => {
    if (!row.subrows?.length) {
      return row;
    }

    return {
      ...row,
      subrows: row.subrows.map((subrow) => transformSubrow(subrow, context)),
    };
  };

  const updateSubrow = (
    subrow: ExperienceTableRowData,
    responseMap: Map<string, components['schemas']['KoulutusDto']>,
  ): ExperienceTableRowData => {
    const responseItem = responseMap.get(subrow.key);

    return responseItem
      ? {
          ...subrow,
          osaamiset: (responseItem.osaamiset ?? []) as never,
          osaamisetOdottaaTunnistusta: responseItem.osaamisetOdottaaTunnistusta,
          osaamisetTunnistusEpaonnistui: responseItem.osaamisetTunnistusEpaonnistui,
        }
      : subrow;
  };

  const updateSubrowWithTunnistusStatus = (
    subrow: ExperienceTableRowData,
    rowIdsForOsaamisetTunnistus: string[],
  ): ExperienceTableRowData => {
    return rowIdsForOsaamisetTunnistus.includes(subrow.key)
      ? {
          ...subrow,
          osaamisetTunnistusEpaonnistui: true,
        }
      : subrow;
  };

  const usePollOsaamisetTunnistus = (
    isOsaamisetTunnistusOngoing: boolean,
    rows: ExperienceTableRowData[],
    setRows: React.Dispatch<React.SetStateAction<ExperienceTableRowData[]>>,
    revalidator: ReturnType<typeof useRevalidator>,
  ) => {
    const [isPolling, setIsPolling] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const rowIdsForOsaamisetTunnistus = rows.flatMap((row) =>
      row.osaamisetOdottaaTunnistusta && row.subrows?.length
        ? row.subrows.filter((subRow) => subRow.osaamisetOdottaaTunnistusta).map((subRow) => subRow.key)
        : [],
    );

    const fetchOsaamisetTunnistus = React.useCallback(async () => {
      if (isPolling || !isOsaamisetTunnistusOngoing || rowIdsForOsaamisetTunnistus.length === 0) {
        return;
      }

      setIsPolling(true);

      let hasError = false;
      try {
        const { data, error } = await client.GET('/api/integraatiot/koski/osaamiset/tunnistus', {
          params: {
            query: {
              ids: rowIdsForOsaamisetTunnistus,
            },
          },
        });

        if (error) {
          hasError = true;
          setError(error);
          return;
        }

        if (!data) {
          hasError = true;
          setError(new Error('API returned empty response'));
          return;
        }

        const koulutukset: components['schemas']['KoulutusDto'][] = data;
        const responseMap = new Map(koulutukset.map((koulutus) => [koulutus.id, koulutus]));

        // @ts-expect-error - Map keys are handled correctly at runtime
        const updatedRows = rows.map((row) => updateRowSubrows(row, updateSubrow, responseMap));
        setRows(updatedRows);

        const remainingIds = rowIdsForOsaamisetTunnistus.filter((id) => !responseMap.has(id));
        if (remainingIds.length === 0) {
          revalidator.revalidate();
        }
      } catch (err) {
        hasError = true;
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (hasError) {
          const updatedRowsToFailed = rows.map((row) =>
            updateRowSubrows(row, updateSubrowWithTunnistusStatus, rowIdsForOsaamisetTunnistus),
          );
          setRows(updatedRowsToFailed);
        }

        setIsPolling(false);
      }
    }, [rows, setRows, revalidator, isPolling, isOsaamisetTunnistusOngoing, rowIdsForOsaamisetTunnistus]);

    // Set up polling with an appropriate retry strategy
    React.useEffect(() => {
      const interval = error ? 15_000 : 5_000;
      const intervalId = setInterval(fetchOsaamisetTunnistus, interval);
      return () => clearInterval(intervalId);
    }, [fetchOsaamisetTunnistus, error]);
  };
  usePollOsaamisetTunnistus(isOsaamisetTunnistusOngoing, rows, setRows, revalidator);

  return (
    <MainLayout navChildren={<ProfileNavigationList />}>
      <title>{title}</title>
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-9 text-body-lg">{t('profile.education-history.description')}</p>
      <ExperienceTable
        mainColumnHeader={t('education-history.education-provider-or-education')}
        addNewNestedLabel={t('education-history.add-studies-to-this-education')}
        rows={rows}
        onRowClick={onRowClick}
        onNestedRowClick={onNestedRowClick}
        onAddNestedRowClick={onAddNestedRowClick}
      />
      <div className="flex space-x-4">
        <div className="mb-[84px]">
          <Button
            variant="white"
            label={t('education-history.add-new-education')}
            onClick={() => setIsWizardOpen(true)}
          />
        </div>
        <div>
          <TooltipWrapper
            tooltipPlacement="top"
            tooltipContent={t('competences-identifying')}
            tooltipOpen={isOsaamisetTunnistusOngoing ? undefined : false}
          >
            <Button
              variant="white"
              label={t('education-history.import-education-history')}
              onClick={openImportStartModal}
              disabled={isOsaamisetTunnistusOngoing}
            />
          </TooltipWrapper>
        </div>
      </div>
      {isKoulutuskokonaisuusOpen && koulutuskokonaisuusId && (
        <EditKoulutuskokonaisuusModal
          isOpen={isKoulutuskokonaisuusOpen}
          onClose={onCloseKategoriaModal}
          koulutuskokonaisuusId={koulutuskokonaisuusId}
        />
      )}
      {isKoulutusOpen && koulutuskokonaisuusId && (
        <AddOrEditKoulutusModal
          isOpen={isKoulutusOpen}
          onClose={onCloseKoulutusModal}
          koulutuskokonaisuusId={koulutuskokonaisuusId}
          koulutusId={koulutusId}
        />
      )}
      {isWizardOpen && <EducationHistoryWizard isOpen={isWizardOpen} onClose={onCloseWizard} />}

      <ImportKoulutusStartModal isOpen={isImportStartModalOpen} onClose={closeImportStartModal} />
      <ImportKoulutusSummaryModal
        isOpen={isImportSummaryModalOpen}
        onClose={closeImportSummaryModal}
        onSuccessful={() => {
          closeImportSummaryModal();
          revalidator.revalidate();
          openImportResultModal(true);
        }}
        onFailure={() => {
          closeImportSummaryModal();
          openImportResultModal(false);
        }}
      />
      <ImportKoulutusResultModal
        isOpen={isImportResultModalOpen}
        onClose={closeImportResultModal}
        isSuccess={isImportSuccess}
        errorText={importResultErrorText}
      />
    </MainLayout>
  );
};

export default EducationHistory;
