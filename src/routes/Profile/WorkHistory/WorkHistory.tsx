import {
  ExperienceTable,
  MainLayout,
  RoutesNavigationList,
  SimpleNavigationList,
  Title,
  type ExperienceTableRowData,
  type RoutesNavigationListProps,
} from '@/components';
import { useActionBar } from '@/hooks/useActionBar';
import EditToimenkuvaModal from '@/routes/Profile/WorkHistory/modals/EditToimenkuvaModal';
import EditTyonantajaModal from '@/routes/Profile/WorkHistory/modals/EditTyonantajaModal';
import { Button } from '@jod/design-system';
import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useOutletContext, useRevalidator } from 'react-router-dom';
import { mapNavigationRoutes } from '../utils';
import { WorkHistoryWizard } from './WorkHistoryWizard';
import { Tyopaikka, getWorkHistoryTableRows } from './utils';

const WorkHistory = () => {
  const routes = useOutletContext<RoutesNavigationListProps['routes']>();
  const tyopaikat = useLoaderData() as Tyopaikka[];
  const { t } = useTranslation();
  const title = t('profile.work-history');
  const navigationRoutes = React.useMemo(() => mapNavigationRoutes(routes), [routes]);
  const actionBar = useActionBar();
  const [rows, setRows] = React.useState(getWorkHistoryTableRows(tyopaikat));
  const [tyopaikkaId, setTyopaikkaId] = React.useState<string | undefined>(undefined);
  const [toimenkuvaId, setToimenkuvaId] = React.useState<string | undefined>(undefined);
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [isTyonantajaOpen, setIsTyonantajaOpen] = React.useState(false);
  const [isToimenkuvaOpen, setIsToimenkuvaOpen] = React.useState(false);
  const revalidator = useRevalidator(); // For reloading data after modal close

  React.useEffect(() => {
    setRows(getWorkHistoryTableRows(tyopaikat));
  }, [tyopaikat]);

  const handleRowClick = (row: ExperienceTableRowData) => {
    if (Array.isArray(row.subrows)) {
      setTyopaikkaId(row.key);
      setIsTyonantajaOpen(true);
    } else {
      const tyopaikka = tyopaikat.find((tp) => tp.toimenkuvat.find((tk) => tk.id === row.key));

      if (tyopaikka?.id) {
        setTyopaikkaId(tyopaikka.id);
        setToimenkuvaId(row.key);
        setIsToimenkuvaOpen(true);
      }
    }
  };

  const onCloseTyonantajaModal = () => {
    setIsTyonantajaOpen(false);
    setTyopaikkaId(undefined);
    revalidator.revalidate();
  };

  const onCloseToimenkuvaModal = () => {
    setIsToimenkuvaOpen(false);
    setToimenkuvaId(undefined);
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
      <p className="mb-8 text-body-md font-arial">
        Lorem ipsum dolor sit amet, no vis verear commodo. Vix quot dicta phaedrum ad. Has eu invenire concludaturque,
        simul accusata no ius. Volumus corpora per te, pri lucilius salutatus iracundia ut. Mutat posse voluptua quo cu,
        in albucius nominavi principes eum, quem facilisi cotidieque mel no.
      </p>
      <ExperienceTable
        mainColumnHeader={t('work-history.workplace-or-job-description')}
        rows={rows}
        onRowClick={handleRowClick}
      />
      {isTyonantajaOpen && (
        <EditTyonantajaModal isOpen={isTyonantajaOpen} onClose={onCloseTyonantajaModal} tyopaikkaId={tyopaikkaId!} />
      )}
      {isToimenkuvaOpen && (
        <EditToimenkuvaModal
          isOpen={isToimenkuvaOpen}
          onClose={onCloseToimenkuvaModal}
          tyopaikkaId={tyopaikkaId!}
          toimenkuvaId={toimenkuvaId!}
        />
      )}
      {isWizardOpen && <WorkHistoryWizard isOpen={isWizardOpen} onClose={onCloseWizard} />}
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button variant="white" label={t('work-history.add-new-workplace')} onClick={() => setIsWizardOpen(true)} />
          </div>,
          actionBar,
        )}
    </MainLayout>
  );
};

export default WorkHistory;
