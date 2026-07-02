import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useRevalidator } from 'react-router';

import { Button, EmptyState, MainLayout, useMediaQueries } from '@jod/design-system';
import { JodError } from '@jod/design-system/icons';

import { Breadcrumb, ExperienceTable, type ExperienceTableRowData } from '@/components';
import { TooltipWrapper } from '@/components/Tooltip/TooltipWrapper';
import { useModal } from '@/hooks/useModal';
import { useSessionGuardedAction } from '@/hooks/useSessionGuardedAction';
import { EducationHistoryWizard } from '@/routes/Profile/EducationHistory/EducationHistoryWizard';
import EditKoulutuskokonaisuusModal from '@/routes/Profile/EducationHistory/modals/EditKoulutuskokonaisuusModal';
import { useHasToiminto } from '@/stores/useSessionManagerStore';

import { CompetencesTour } from '../CompetencesTour';
import { ProfileSectionTitle } from '../components';
import { ProfileNavigationList } from '../components/index';
import { ToolCard } from '../components/ToolCard';
import loader from './loader';
import AddOrEditKoulutusModal from './modals/AddOrEditKoulutusModal';
import { useKoskiImport } from './useKoskiImport';
import { usePollOsaamisetTunnistus } from './usePollOsaamisetTunnistus';
import { getEducationHistoryTableRows } from './utils';

const EducationHistory = () => {
  const { koulutuskokonaisuudet, osaamisetMap } = useLoaderData<Awaited<ReturnType<typeof loader>>>();
  const { t } = useTranslation();
  const { lg } = useMediaQueries();
  const title = t('profile.education-history.title');
  const hasKoskiToiminto = useHasToiminto('KOSKI');
  const [rows, setRows] = React.useState<ExperienceTableRowData[]>(
    getEducationHistoryTableRows(koulutuskokonaisuudet, osaamisetMap),
  );
  const revalidator = useRevalidator(); // For reloading data after modal close
  const [isOsaamisetTunnistusOngoing, setIsOsaamisetTunnistusOngoing] = React.useState(true);
  const { showModal } = useModal();
  const [baselineKoulutusIds, setBaselineKoulutusIds] = React.useState<string[] | null>(null);
  const [koulutuksetThatNeedUserVerification, setKoulutuksetThatNeedUserVerification] = React.useState<string[]>([]);
  const guardedAction = useSessionGuardedAction();
  const { openImportStartModal, refreshData } = useKoskiImport();

  React.useEffect(() => {
    const importedData = Array.from(
      rows
        .flatMap((row) =>
          row.subrows?.filter((sr) => sr.osaamisetOdottaaTunnistusta === false).flatMap((k) => [row.key, k.key]),
        )
        .filter(Boolean) as string[],
    );

    if (baselineKoulutusIds === null) {
      setBaselineKoulutusIds(importedData);
    } else {
      const newKoulutuksetThatNeedUserVerification = importedData.filter((id) => !baselineKoulutusIds.includes(id));

      setKoulutuksetThatNeedUserVerification(newKoulutuksetThatNeedUserVerification);
    }
  }, [rows, baselineKoulutusIds]);

  // Init
  React.useEffect(() => {
    const importedData = Array.from(
      koulutuskokonaisuudet
        .flatMap((kk) =>
          kk.koulutukset.filter((k) => k.osaamisetOdottaaTunnistusta === false).flatMap((k) => [kk.id, k.id]),
        )
        .filter(Boolean) as string[],
    );

    setBaselineKoulutusIds(importedData);
    // oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    setRows(getEducationHistoryTableRows(koulutuskokonaisuudet, osaamisetMap));
  }, [koulutuskokonaisuudet, osaamisetMap]);

  React.useEffect(() => {
    const isIdentifyingCompetence = rows.some(
      (row) => row.osaamisetOdottaaTunnistusta || row.subrows?.some((subRow) => subRow.osaamisetOdottaaTunnistusta),
    );
    setIsOsaamisetTunnistusOngoing(isIdentifyingCompetence);
  }, [rows]);

  const verifyKoulutusOsaamiset = React.useCallback(
    (id: string) => {
      const toVerifyKoulutusIds: string[] = [id];
      const koulutuskokonaisuus = koulutuskokonaisuudet.find((kk) => kk.id === id);

      // When verifying a koulutuskokonaisuus, all nested koulutus osaamiset are also considered as verified
      if (koulutuskokonaisuus) {
        const nestedKoulutusIds = koulutuskokonaisuus.koulutukset.map((k) => k.id) as string[];
        toVerifyKoulutusIds.push(...nestedKoulutusIds);
      } else {
        // Set parent as verified if all koulutukset have been verified
        const parentKoulutusKokonaisuus = koulutuskokonaisuudet.find((kk) => kk.koulutukset.some((k) => k.id === id));
        const unverifiedNestedKoulutukset =
          parentKoulutusKokonaisuus?.koulutukset
            .filter((k) => koulutuksetThatNeedUserVerification.includes(k.id!))
            .filter((k) => k.id !== id).length === 0;

        if (parentKoulutusKokonaisuus && unverifiedNestedKoulutukset) {
          toVerifyKoulutusIds.push(parentKoulutusKokonaisuus.id!);
        }
      }

      setKoulutuksetThatNeedUserVerification((prev) =>
        prev.filter((koulutusId) => !toVerifyKoulutusIds.includes(koulutusId)),
      );
      setBaselineKoulutusIds((prev) => [...(prev ?? []), ...toVerifyKoulutusIds]);
    },
    [koulutuksetThatNeedUserVerification, koulutuskokonaisuudet],
  );

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
        onClose: () => {
          void refreshData();
        },
      });
    }
  };

  const onAddNestedRowClick = (row: ExperienceTableRowData) => {
    showModal(AddOrEditKoulutusModal, {
      koulutuskokonaisuusId: row.key,
      onClose: () => {
        void refreshData();
      },
    });
  };

  usePollOsaamisetTunnistus(isOsaamisetTunnistusOngoing, rows, setRows, revalidator);

  return (
    <MainLayout
      breadcrumbComponent={<Breadcrumb />}
      navChildren={
        <div className="flex flex-col gap-5">
          <ProfileNavigationList />
          <ToolCard testId="education-history-go-to-tool" />
        </div>
      }
    >
      {!lg && (
        <div className="mb-6 px-5 sm:px-6">
          <ProfileNavigationList collapsed />
        </div>
      )}
      <title>{title}</title>
      <div className="px-5 sm:px-6">
        <ProfileSectionTitle type="KOULUTUS" title={title} />
        <p className="mb-7 text-body-lg-mobile sm:text-body-lg">
          {hasKoskiToiminto
            ? t('profile.education-history.description')
            : t('profile.education-history.description-generic')}
        </p>

        {koulutuksetThatNeedUserVerification.length > 0 && (
          <div className="mb-5 flex w-fit items-center rounded-md bg-bg-gray-2 px-5 py-3">
            <JodError className="mr-3 text-primary-3" />
            <span className="font-arial text-body-sm text-primary-gray">
              {t('education-history.check-identified-osaamiset')}
            </span>
          </div>
        )}

        {rows.length === 0 ? (
          <div className="mt-6 mb-11" data-testid="education-history-empty-state">
            <EmptyState text={t('profile.education-history.empty')} />
          </div>
        ) : (
          <div className="mb-7">
            <CompetencesTour />
          </div>
        )}
      </div>
      <div id="competences-tour-step-1">
        <ExperienceTable
          ariaLabel={title}
          mainColumnHeader={t('education-history.education-provider-or-education')}
          addNewNestedLabel={t('education-history.add-studies-to-this-education')}
          rows={rows}
          koulutuksetThatNeedUserVerification={koulutuksetThatNeedUserVerification}
          verifyKoulutusOsaamiset={verifyKoulutusOsaamiset}
          onRowClick={(row) => guardedAction(onRowClick, row)()}
          onNestedRowClick={(row) => guardedAction(onNestedRowClick, row)()}
          onAddNestedRowClick={(row) => guardedAction(onAddNestedRowClick, row)()}
        />
      </div>
      <div className="flex space-x-4 px-5 sm:px-6">
        <div className="mb-[84px]">
          <Button
            variant="accent"
            ariaHaspopup="dialog"
            label={t('education-history.add-new-education')}
            onClick={guardedAction(showModal, EducationHistoryWizard)}
            testId="education-history-add"
          />
        </div>
        {hasKoskiToiminto && (
          <div>
            <TooltipWrapper
              tooltipPlacement="top"
              tooltipContent={t('competences-identifying')}
              tooltipOpen={isOsaamisetTunnistusOngoing ? undefined : false}
            >
              <Button
                ariaHaspopup="dialog"
                variant="white"
                label={t('education-history.import-education-history')}
                onClick={guardedAction(openImportStartModal)}
                disabled={isOsaamisetTunnistusOngoing}
                testId="education-history-import"
              />
            </TooltipWrapper>
          </div>
        )}
      </div>
      {lg ? null : (
        <div className="px-5">
          <ToolCard testId="education-history-go-to-tool" className="mt-6" />
        </div>
      )}
    </MainLayout>
  );
};

export default EducationHistory;
