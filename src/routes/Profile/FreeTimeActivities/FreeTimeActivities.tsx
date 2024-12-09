import {
  ExperienceTable,
  MainLayout,
  RoutesNavigationList,
  SimpleNavigationList,
  Title,
  type ExperienceTableRowData,
  type RoutesNavigationListProps,
} from '@/components';
import { EditVapaaAjanToimintoModal } from '@/routes/Profile/FreeTimeActivities/modals/EditVapaaAjanToimintoModal';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useOutletContext, useRevalidator } from 'react-router';
import { mapNavigationRoutes } from '../utils';
import { FreeTimeActivitiesWizard } from './FreeTimeActivitiesWizard';
import { AddOrEditPatevyysModal } from './modals/AddOrEditPatevyysModal';
import { getFreeTimeActivitiesTableRows, type VapaaAjanToiminto } from './utils';

const FreeTimeActivities = () => {
  const routes = useOutletContext<RoutesNavigationListProps['routes']>();
  const { vapaaAjanToiminnot, osaamisetMap } = useLoaderData() as {
    vapaaAjanToiminnot: VapaaAjanToiminto[];
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
  const title = t('profile.free-time-activities.title');
  const navigationRoutes = React.useMemo(() => mapNavigationRoutes(routes), [routes]);
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [rows, setRows] = React.useState(getFreeTimeActivitiesTableRows(vapaaAjanToiminnot, osaamisetMap));
  const [toimintoId, setToimintoId] = React.useState<string | undefined>(undefined);
  const [patevyysId, setPatevyysId] = React.useState<string | undefined>(undefined);
  const [isToimintoModalOpen, setIsToimintoModalOpen] = React.useState(false);
  const [isPatevyysModalOpen, setIsPatevyysModalOpen] = React.useState(false);
  const revalidator = useRevalidator(); // For reloading data after modal close

  React.useEffect(() => {
    setRows(getFreeTimeActivitiesTableRows(vapaaAjanToiminnot, osaamisetMap));
  }, [vapaaAjanToiminnot, osaamisetMap]);

  const onRowClick = (row: ExperienceTableRowData) => {
    setToimintoId(row.key);
    setIsToimintoModalOpen(true);
  };

  const onNestedRowClick = (row: ExperienceTableRowData) => {
    const toiminto = vapaaAjanToiminnot.find((vat) => vat.patevyydet.find((p) => p.id === row.key));
    if (toiminto?.id) {
      setToimintoId(toiminto.id);
      setPatevyysId(row.key);
      setIsPatevyysModalOpen(true);
    }
  };

  const onAddNestedRowClick = (row: ExperienceTableRowData) => {
    setToimintoId(row.key);
    setIsPatevyysModalOpen(true);
  };

  const onCloseToimintoModal = () => {
    setIsToimintoModalOpen(false);
    setToimintoId(undefined);
    revalidator.revalidate();
  };
  const onClosePatevyysModal = () => {
    setIsPatevyysModalOpen(false);
    setToimintoId(undefined);
    setPatevyysId(undefined);
    revalidator.revalidate();
  };

  const onCloseWizard = () => {
    setIsWizardOpen(false);
    revalidator.revalidate();
  };

  return (
    <MainLayout
      navChildren={
        <SimpleNavigationList title={t('profile.index')}>
          <RoutesNavigationList routes={navigationRoutes} />
        </SimpleNavigationList>
      }
    >
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-9 text-body-lg">{t('profile.free-time-activities.description')}</p>
      <ExperienceTable
        mainColumnHeader={t('free-time-activities.activity-or-proficiency-description')}
        addNewLabel={t('free-time-activities.add-new-free-time-activity')}
        addNewNestedLabel={t('free-time-activities.add-new-proficiency')}
        rows={rows}
        onAddClick={() => setIsWizardOpen(true)}
        onRowClick={onRowClick}
        onNestedRowClick={onNestedRowClick}
        onAddNestedRowClick={onAddNestedRowClick}
      />
      {isToimintoModalOpen && toimintoId && (
        <EditVapaaAjanToimintoModal
          isOpen={isToimintoModalOpen}
          onClose={onCloseToimintoModal}
          toimintoId={toimintoId}
        />
      )}
      {isPatevyysModalOpen && toimintoId && (
        <AddOrEditPatevyysModal
          isOpen={isPatevyysModalOpen}
          onClose={onClosePatevyysModal}
          toimintoId={toimintoId}
          patevyysId={patevyysId}
        />
      )}
      {isWizardOpen && <FreeTimeActivitiesWizard isOpen={isWizardOpen} setIsOpen={onCloseWizard} />}
    </MainLayout>
  );
};

export default FreeTimeActivities;
