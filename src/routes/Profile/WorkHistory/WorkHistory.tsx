import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';

import { EmptyState, MainLayout, useMediaQueries } from '@jod/design-system';

import { Breadcrumb, ExperienceTable, type ExperienceTableRowData } from '@/components';
import { useModal } from '@/hooks/useModal';
import { useSessionGuardedAction } from '@/hooks/useSessionGuardedAction';
import EditTyonantajaModal from '@/routes/Profile/WorkHistory/modals/EditTyonantajaModal';
import { WorkHistoryWizard } from '@/routes/Profile/WorkHistory/WorkHistoryWizard';

import { CompetencesTour } from '../CompetencesTour';
import { ProfileNavigationList, ProfileSectionTitle } from '../components';
import { ToolCard } from '../components/ToolCard';
import AddOrEditToimenkuvaModal from './modals/AddOrEditToimenkuvaModal';
import { Tyopaikka, getWorkHistoryTableRows } from './utils';

const WorkHistory = () => {
  const { tyopaikat, osaamisetMap } = useLoaderData() as {
    tyopaikat: Tyopaikka[];
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
  const title = t('profile.work-history.title');
  const [rows, setRows] = React.useState(getWorkHistoryTableRows(tyopaikat, osaamisetMap));
  const { showModal } = useModal();
  const { lg } = useMediaQueries();
  const guardedAction = useSessionGuardedAction();

  React.useEffect(() => {
    setRows(getWorkHistoryTableRows(tyopaikat, osaamisetMap));
  }, [tyopaikat, osaamisetMap]);

  const onRowClick = (row: ExperienceTableRowData) => {
    showModal(EditTyonantajaModal, { tyopaikkaId: row.key });
  };

  const onNestedRowClick = (row: ExperienceTableRowData) => {
    const tyopaikkaId = tyopaikat.find((tp) => tp.toimenkuvat.find((tk) => tk.id === row.key))?.id;

    if (tyopaikkaId) {
      showModal(AddOrEditToimenkuvaModal, {
        tyopaikkaId,
        toimenkuvaId: row.key,
      });
    }
  };

  const onAddNestedRowClick = (row: ExperienceTableRowData) => {
    showModal(AddOrEditToimenkuvaModal, { tyopaikkaId: row.key });
  };

  return (
    <MainLayout
      breadcrumbComponent={<Breadcrumb />}
      navChildren={
        <div className="flex flex-col gap-5">
          <ProfileNavigationList />
          <ToolCard testId="work-history-go-to-tool" />
        </div>
      }
      testId="work-history-page"
    >
      {!lg && (
        <div className="mb-6 px-5 sm:px-6">
          <ProfileNavigationList collapsed />
        </div>
      )}
      <title>{title}</title>
      <div className="px-5 sm:px-6">
        <ProfileSectionTitle type="TOIMENKUVA" title={title} />
        <p className="mb-7 text-body-lg-mobile sm:text-body-lg">{t('profile.work-history.description')}</p>

        {rows.length === 0 ? (
          <div className="mt-6 mb-7" data-testid="work-history-empty-state">
            <EmptyState text={t('profile.work-history.empty')} />
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
          mainColumnHeader={t('work-history.workplace-or-job-description')}
          addNewLabel={t('work-history.add-new-workplace')}
          addNewNestedLabel={t('work-history.add-new-job-description')}
          rows={rows}
          onAddClick={guardedAction(showModal, WorkHistoryWizard)}
          onRowClick={(row) => guardedAction(onRowClick, row)()}
          onNestedRowClick={(row) => guardedAction(onNestedRowClick, row)()}
          onAddNestedRowClick={(row) => guardedAction(onAddNestedRowClick, row)()}
        />
      </div>
      {lg ? null : (
        <div className="px-5">
          <ToolCard testId="work-history-go-to-tool" className="mt-6" />
        </div>
      )}
    </MainLayout>
  );
};

export default WorkHistory;
