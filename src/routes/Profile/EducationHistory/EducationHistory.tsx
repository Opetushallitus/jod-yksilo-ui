import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';

import { EmptyState, MainLayout, useMediaQueries } from '@jod/design-system';

import { Breadcrumb, ExperienceTable, type ExperienceTableRowData } from '@/components';
import { useModal } from '@/hooks/useModal';
import { useSessionGuardedAction } from '@/hooks/useSessionGuardedAction';
import { EducationHistoryWizard } from '@/routes/Profile/EducationHistory/EducationHistoryWizard';
import EditKoulutuskokonaisuusModal from '@/routes/Profile/EducationHistory/modals/EditKoulutuskokonaisuusModal';
import { useHasToiminto } from '@/stores/useSessionManagerStore';

import { CompetencesTour } from '../CompetencesTour';
import { ImportDataLinkButton, ProfileSectionTitle } from '../components';
import { ProfileNavigationList } from '../components/index';
import { ToolCard } from '../components/ToolCard';
import loader from './loader';
import AddOrEditKoulutusModal from './modals/AddOrEditKoulutusModal';
import { useKoskiImport } from './useKoskiImport';
import { getEducationHistoryTableRows } from './utils';

const EducationHistory = () => {
  const { koulutuskokonaisuudet, osaamisetMap } = useLoaderData<Awaited<ReturnType<typeof loader>>>();
  const { t } = useTranslation();
  const { lg } = useMediaQueries();
  const title = t('profile.education-history.title');
  const hasKoskiToiminto = useHasToiminto('KOSKI');
  const rows = React.useMemo(
    () => getEducationHistoryTableRows(koulutuskokonaisuudet, osaamisetMap),
    [koulutuskokonaisuudet, osaamisetMap],
  );
  const { showModal } = useModal();
  const guardedAction = useSessionGuardedAction();
  const { refreshData } = useKoskiImport();

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
          addNewLabel={t('education-history.add-new-education')}
          addNewNestedLabel={t('education-history.add-studies-to-this-education')}
          rows={rows}
          onAddClick={guardedAction(showModal, EducationHistoryWizard)}
          secondaryAction={<ImportDataLinkButton source="KOSKI" testId="education-history-import" />}
          onRowClick={(row) => guardedAction(onRowClick, row)()}
          onNestedRowClick={(row) => guardedAction(onNestedRowClick, row)()}
          onAddNestedRowClick={(row) => guardedAction(onAddNestedRowClick, row)()}
        />
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
