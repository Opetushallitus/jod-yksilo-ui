import { client } from '@/api/client';
import type { components } from '@/api/schema';
import { ExperienceTable, MainLayout, type ExperienceTableRowData } from '@/components';
import { TooltipWrapper } from '@/components/Tooltip/TooltipWrapper';
import { useModal } from '@/hooks/useModal';
import { EducationHistoryWizard } from '@/routes/Profile/EducationHistory/EducationHistoryWizard';
import EditKoulutuskokonaisuusModal from '@/routes/Profile/EducationHistory/modals/EditKoulutuskokonaisuusModal';
import ImportKoulutusSummaryModal from '@/routes/Profile/EducationHistory/modals/ImportKoulutusSummaryModal';
import { Button, EmptyState } from '@jod/design-system';
import { JodArrowRight } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLoaderData, useRevalidator, useSearchParams } from 'react-router';
import { ProfileSectionTitle } from '../components';
import { ProfileNavigationList } from '../components/index.tsx';
import AddOrEditKoulutusModal from './modals/AddOrEditKoulutusModal';
import ImportKoulutusResultModal from './modals/ImportKoulutusResultModal';
import ImportKoulutusStartModal from './modals/ImportKoulutusStartModal';
import { getEducationHistoryTableRows, type Koulutuskokonaisuus } from './utils';

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
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const title = t('profile.education-history.title');

  const [rows, setRows] = React.useState<ExperienceTableRowData[]>(
    getEducationHistoryTableRows(koulutuskokonaisuudet, osaamisetMap),
  );
  const revalidator = useRevalidator(); // For reloading data after modal close
  const [importResultErrorText, setImportResultErrorText] = React.useState<string | undefined>(undefined);
  const [searchParams, setSearchParams] = useSearchParams();

  const [isOsaamisetTunnistusOngoing, setIsOsaamisetTunnistusOngoing] = React.useState(true);
  const { showModal } = useModal();

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
    showModal(EditKoulutuskokonaisuusModal, {
      koulutuskokonaisuusId: row.key,
      onClose: () => {
        void refreshData();
      },
    });
  };

  const onNestedRowClick = (row: ExperienceTableRowData) => {
    const koulutus = koulutuskokonaisuudet.find((kk) => kk.koulutukset.find((k) => k.id === row.key));
    if (koulutus?.id) {
      showModal(AddOrEditKoulutusModal, {
        koulutuskokonaisuusId: koulutus.id,
        koulutusId: row.key,
      });
    }
  };

  const refreshData = React.useCallback(async () => {
    await revalidator.revalidate();
  }, [revalidator]);

  const onAddNestedRowClick = (row: ExperienceTableRowData) => {
    showModal(AddOrEditKoulutusModal, { koulutuskokonaisuusId: row.key });
  };

  const openImportStartModal = () => {
    setImportResultErrorText(undefined);
    showModal(ImportKoulutusStartModal);
  };

  const openImportResultModal = React.useCallback(
    (result: boolean) => {
      showModal(ImportKoulutusResultModal, {
        isSuccess: result,
        onClose: () => {
          void refreshData();
        },
        errorText: importResultErrorText,
      });
    },
    [importResultErrorText, refreshData, showModal],
  );

  const openImportSummaryModal = React.useCallback(() => {
    showModal(ImportKoulutusSummaryModal, {
      onSuccessful: () => {
        refreshData();
        openImportResultModal(true);
      },
      onFailure: () => {
        openImportResultModal(false);
      },
    });
  }, [showModal, refreshData, openImportResultModal]);

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
  }, [openImportResultModal, openImportSummaryModal, searchParams, setSearchParams, t]);

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

  const navChildren = React.useMemo(() => <ProfileNavigationList />, []);

  return (
    <MainLayout navChildren={navChildren}>
      <title>{title}</title>
      <ProfileSectionTitle type="KOULUTUS" title={title} />
      <p className="mb-5 text-body-lg">{t('profile.education-history.description')}</p>
      <div className="mb-8">
        <Link
          to={`/${language}/${t('slugs.tool.index')}`}
          className="text-button-md hover:underline text-accent mt-4"
          data-testid="education-history-go-to-tool"
        >
          <div className="flex items-center gap-2">
            {t('profile.favorites.link-go-to-job-and-education-opportunities')}
            <JodArrowRight size={24} />
          </div>
        </Link>
      </div>

      {rows.length === 0 && (
        <div className="mt-6 mb-7" data-testid="education-history-empty-state">
          <EmptyState text={t('profile.education-history.empty')} />
        </div>
      )}
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
            variant="accent"
            label={t('education-history.add-new-education')}
            onClick={() => {
              showModal(EducationHistoryWizard);
            }}
            data-testid="education-history-add"
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
              data-testid="education-history-import"
            />
          </TooltipWrapper>
        </div>
      </div>
    </MainLayout>
  );
};

export default EducationHistory;
