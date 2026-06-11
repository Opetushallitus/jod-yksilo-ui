import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';

import { EmptyState, MainLayout, useMediaQueries } from '@jod/design-system';

import { Breadcrumb, ExperienceTable, type ExperienceTableRowData } from '@/components';
import { useModal } from '@/hooks/useModal';
import { useSessionGuardedAction } from '@/hooks/useSessionGuardedAction';
import { EditVapaaAjanTeemaModal } from '@/routes/Profile/FreeTimeActivities/modals/EditVapaaAjanToimintoModal';

import { CompetencesTour } from '../CompetencesTour';
import { ProfileNavigationList, ProfileSectionTitle } from '../components';
import { ToolCard } from '../components/ToolCard';
import { FreeTimeActivitiesWizard } from './FreeTimeActivitiesWizard';
import { AddOrEditPatevyysModal } from './modals/AddOrEditPatevyysModal';
import { getFreeTimeActivitiesTableRows, type VapaaAjanToiminto } from './utils';

const FreeTimeActivities = () => {
  const { vapaaAjanTeemat, osaamisetMap } = useLoaderData() as {
    vapaaAjanTeemat: VapaaAjanToiminto[];
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
  const { lg } = useMediaQueries();
  const title = t('profile.free-time-activities.title');
  const [rows, setRows] = React.useState(getFreeTimeActivitiesTableRows(vapaaAjanTeemat, osaamisetMap));
  const { showModal } = useModal();
  const guardedAction = useSessionGuardedAction();

  React.useEffect(() => {
    setRows(getFreeTimeActivitiesTableRows(vapaaAjanTeemat, osaamisetMap));
  }, [vapaaAjanTeemat, osaamisetMap]);

  const onRowClick = (row: ExperienceTableRowData) => {
    showModal(EditVapaaAjanTeemaModal, { teemaId: row.key });
  };

  const onNestedRowClick = (row: ExperienceTableRowData) => {
    const teema = vapaaAjanTeemat.find((vat) => vat.patevyydet.find((p) => p.id === row.key));
    if (teema?.id) {
      showModal(AddOrEditPatevyysModal, {
        teemaId: teema.id,
        patevyysId: row.key,
      });
    }
  };

  const onAddNestedRowClick = (row: ExperienceTableRowData) => {
    showModal(AddOrEditPatevyysModal, { teemaId: row.key });
  };

  return (
    <MainLayout
      breadcrumbComponent={<Breadcrumb />}
      navChildren={
        <div className="flex flex-col gap-5">
          <ProfileNavigationList />
          <ToolCard testId="free-time-go-to-tool" />
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
        <ProfileSectionTitle type="PATEVYYS" title={title} />
        <p className="mb-7 text-body-lg-mobile sm:text-body-lg">{t('profile.free-time-activities.description')}</p>
        {rows.length === 0 ? (
          <div className="mt-6 mb-7" data-testid="free-time-empty-state">
            <EmptyState text={t('profile.free-time-activities.empty')} />
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
          mainColumnHeader={t('free-time-activities.theme-or-activity')}
          addNewLabel={t('free-time-activities.add-new-free-time-activity')}
          addNewNestedLabel={t('free-time-activities.add-new-activity')}
          rows={rows}
          onAddClick={guardedAction(showModal, FreeTimeActivitiesWizard)}
          onRowClick={(row) => guardedAction(onRowClick, row)()}
          onNestedRowClick={(row) => guardedAction(onNestedRowClick, row)()}
          onAddNestedRowClick={(row) => guardedAction(onAddNestedRowClick, row)()}
        />
      </div>
      {lg ? null : (
        <div className="px-5">
          <ToolCard testId="free-time-go-to-tool" className="mt-6" />
        </div>
      )}
    </MainLayout>
  );
};

export default FreeTimeActivities;
