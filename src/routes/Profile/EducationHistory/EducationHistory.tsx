import { ExperienceTable, MainLayout, type ExperienceTableRowData } from '@/components';
import { TooltipWrapper } from '@/components/Tooltip/TooltipWrapper';
import { useEnvironment } from '@/hooks/useEnvironment/index';
import { useModal } from '@/hooks/useModal';
import { EducationHistoryWizard } from '@/routes/Profile/EducationHistory/EducationHistoryWizard';
import EditKoulutuskokonaisuusModal from '@/routes/Profile/EducationHistory/modals/EditKoulutuskokonaisuusModal';
import ImportKoulutusSummaryModal from '@/routes/Profile/EducationHistory/modals/ImportKoulutusSummaryModal';
import { LogoutFormContext } from '@/routes/Root';
import { Button, EmptyState, useMediaQueries, useNoteStack } from '@jod/design-system';
import { JodError, JodOpenInNew } from '@jod/design-system/icons';
import React from 'react';
import toast from 'react-hot-toast/headless';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useLoaderData, useRevalidator, useSearchParams } from 'react-router';
import { ProfileSectionTitle } from '../components';
import { ProfileNavigationList } from '../components/index';
import { ToolCard } from '../components/ToolCard';
import loader from './loader';
import AddOrEditKoulutusModal from './modals/AddOrEditKoulutusModal';
import { usePollOsaamisetTunnistus } from './usePollOsaamisetTunnistus';
import { getEducationHistoryTableRows } from './utils';

const EducationHistory = () => {
  const { koulutuskokonaisuudet, osaamisetMap } = useLoaderData<Awaited<ReturnType<typeof loader>>>();
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { lg } = useMediaQueries();
  const title = t('profile.education-history.title');
  const logoutForm = React.useContext(LogoutFormContext);
  const [rows, setRows] = React.useState<ExperienceTableRowData[]>(
    getEducationHistoryTableRows(koulutuskokonaisuudet, osaamisetMap),
  );
  const revalidator = useRevalidator(); // For reloading data after modal close
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOsaamisetTunnistusOngoing, setIsOsaamisetTunnistusOngoing] = React.useState(true);
  const { showModal, showDialog } = useModal();
  const [baselineKoulutusIds, setBaselineKoulutusIds] = React.useState<string[] | null>(null);
  const [koulutuksetThatNeedUserVerification, setKoulutuksetThatNeedUserVerification] = React.useState<string[]>([]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const logout = React.useCallback(() => {
    logoutForm?.current?.submit();
  }, [logoutForm]);

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

  const refreshData = React.useCallback(async () => {
    await revalidator.revalidate();
  }, [revalidator]);

  const onAddNestedRowClick = (row: ExperienceTableRowData) => {
    showModal(AddOrEditKoulutusModal, { koulutuskokonaisuusId: row.key });
  };

  const { isPrd } = useEnvironment();
  const opintopolkuUrl = React.useMemo(() => {
    const base = `https://${isPrd ? 'opintopolku.fi' : 'testiopintopolku.fi'}/konfo/${language}/sivu/`;
    let path = '';

    if (language === 'sv') {
      path = 'min-studieinfo#mina-studieprestationer';
    } else if (language === 'en') {
      path = 'my-studyinfo#my-completed-studies';
    } else {
      path = 'oma-opintopolku#omat-opintosuoritukseni';
    }

    return new URL(encodeURI(`${base}${path}`)).href;
  }, [language, isPrd]);

  const openImportStartModal = React.useCallback(() => {
    globalThis._paq?.push(['trackEvent', 'yksilo.Rajapinnat', 'Koski tuonti']);

    showDialog({
      variant: 'normal',
      title: t('education-history-import.start-modal.title'),
      confirmText: t('education-history-import.start-modal.import-button'),
      description: (
        <div className="text-body-md-mobile sm:text-body-md font-arial flex flex-col text-primary-gray">
          <Trans
            i18nKey="education-history-import.start-modal.description-1"
            components={{
              Icon: <JodOpenInNew ariaLabel={t('common:external-link')} />,
              CustomLink: <Link to={opintopolkuUrl} className="inline-flex text-accent items-center" target="_blank" />,
            }}
          />
          <p className="mt-7">
            <Trans i18nKey="education-history-import.start-modal.description-2" />
          </p>
        </div>
      ),
      onConfirm: () => {
        globalThis._paq?.push(['trackEvent', 'yksilo.Rajapinnat', 'Koski tuonti - siirry Opintopolkuun']);
        const currentUrl = encodeURIComponent(globalThis.location.href);

        try {
          globalThis.location.href = `/yksilo/oauth2/authorize/koski?callback=${currentUrl}&lang=${language}`;
        } catch (_error) {
          globalThis._paq?.push([
            'trackEvent',
            'yksilo.Rajapinnat',
            'Koski tuonti - siirtyminen Opintopolkuun epäonnistui',
          ]);
          toast.error(t('education-history-import.start-modal.import-redirect-fail'));
        }
      },
    });
  }, [language, opintopolkuUrl, showDialog, t]);

  const { addTemporaryNote } = useNoteStack();

  React.useEffect(() => {
    const result = searchParams.get('koski');
    if (result) {
      setSearchParams({});
      if (result === 'authorized') {
        showModal(ImportKoulutusSummaryModal, {
          onSuccessful: () => {
            void refreshData();
          },
          openImportStartModal,
          logout,
        });
      } else if (result === 'error') {
        addTemporaryNote(() => ({
          title: t('education-history-import.summary-modal.error-title'),
          description: t('education-history-import.result-modal.give-permission-failed'),
          variant: 'warning',
          isCollapsed: false,
        }));
      }
    }
  }, [addTemporaryNote, logout, openImportStartModal, refreshData, searchParams, setSearchParams, showModal, t]);

  usePollOsaamisetTunnistus(isOsaamisetTunnistusOngoing, rows, setRows, revalidator);

  return (
    <MainLayout
      navChildren={
        <div className="flex flex-col gap-5">
          <ProfileNavigationList />
          <ToolCard testId="education-history-go-to-tool" />
        </div>
      }
    >
      {!lg && (
        <div className="mb-6">
          <ProfileNavigationList collapsed />
        </div>
      )}
      <title>{title}</title>
      <ProfileSectionTitle type="KOULUTUS" title={title} />
      <p className="mb-5 text-body-lg">{t('profile.education-history.description')}</p>

      {koulutuksetThatNeedUserVerification.length > 0 && (
        <div className="bg-bg-gray-2 rounded-md px-5 py-3 flex items-center w-fit mb-5">
          <JodError className="text-secondary-3 mr-3" />
          <span className="font-arial text-primary-gray text-body-sm">
            {t('education-history.check-identified-osaamiset')}
          </span>
        </div>
      )}

      {rows.length === 0 && (
        <div className="mt-6 mb-11" data-testid="education-history-empty-state">
          <EmptyState text={t('profile.education-history.empty')} />
        </div>
      )}
      <ExperienceTable
        ariaLabel={title}
        mainColumnHeader={t('education-history.education-provider-or-education')}
        addNewNestedLabel={t('education-history.add-studies-to-this-education')}
        rows={rows}
        koulutuksetThatNeedUserVerification={koulutuksetThatNeedUserVerification}
        verifyKoulutusOsaamiset={verifyKoulutusOsaamiset}
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
            testId="education-history-add"
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
              testId="education-history-import"
            />
          </TooltipWrapper>
        </div>
      </div>
      {lg ? null : <ToolCard testId="education-history-go-to-tool" className="mt-6" />}
    </MainLayout>
  );
};

export default EducationHistory;
