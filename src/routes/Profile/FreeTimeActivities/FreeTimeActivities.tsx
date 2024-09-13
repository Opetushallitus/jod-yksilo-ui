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
import { EditPatevyysModal } from '@/routes/Profile/FreeTimeActivities/modals/EditPatevyysModal';
import { EditVapaaAjanToimintoModal } from '@/routes/Profile/FreeTimeActivities/modals/EditVapaaAjanToimintoModal';
import { Button } from '@jod/design-system';
import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useOutletContext, useRevalidator } from 'react-router-dom';
import { mapNavigationRoutes } from '../utils';
import { FreeTimeActivitiesWizard } from './FreeTimeActivitiesWizard';
import { getFreeTimeActivitiesTableRows, type VapaaAjanToiminto } from './utils';

const FreeTimeActivities = () => {
  const routes: RoutesNavigationListProps['routes'] = useOutletContext();
  const vapaaAjanToiminnot = useLoaderData() as VapaaAjanToiminto[];
  const { t } = useTranslation();
  const title = t('profile.free-time-activities');
  const navigationRoutes = React.useMemo(() => mapNavigationRoutes(routes), [routes]);
  const actionBar = useActionBar();
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [rows, setRows] = React.useState(getFreeTimeActivitiesTableRows(vapaaAjanToiminnot));
  const [toimintoId, setToimintoId] = React.useState<string | undefined>(undefined);
  const [patevyysId, setPatevyysId] = React.useState<string | undefined>(undefined);
  const [isToimintoModalOpen, setIsToimintoModalOpen] = React.useState(false);
  const [isPatevyysModalOpen, setIsPatevyysModalOpen] = React.useState(false);
  const revalidator = useRevalidator(); // For reloading data after modal close

  React.useEffect(() => {
    setRows(getFreeTimeActivitiesTableRows(vapaaAjanToiminnot));
  }, [vapaaAjanToiminnot]);

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

  const handleRowClick = (row: ExperienceTableRowData) => {
    if (Array.isArray(row.subrows)) {
      setToimintoId(row.key);
      setIsToimintoModalOpen(true);
    } else {
      const toiminto = vapaaAjanToiminnot.find((vat) => vat.patevyydet.find((p) => p.id === row.key));

      if (toiminto?.id) {
        setToimintoId(toiminto.id);
        setPatevyysId(row.key);
        setIsPatevyysModalOpen(true);
      }
    }
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
        mainColumnHeader={t('free-time-activities.activity-or-proficiency-description')}
        rows={rows}
        onRowClick={handleRowClick}
      />
      {isWizardOpen && <FreeTimeActivitiesWizard isOpen={isWizardOpen} setIsOpen={onCloseWizard} />}
      {isToimintoModalOpen && toimintoId && (
        <EditVapaaAjanToimintoModal
          isOpen={isToimintoModalOpen}
          onClose={onCloseToimintoModal}
          toimintoId={toimintoId}
        />
      )}

      {isPatevyysModalOpen && toimintoId && patevyysId && (
        <EditPatevyysModal
          isOpen={isPatevyysModalOpen}
          onClose={onClosePatevyysModal}
          toimintoId={toimintoId}
          patevyysId={patevyysId}
        />
      )}
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button
              variant="white"
              label={t('free-time-activities.add-new-free-time-activity')}
              onClick={() => {
                setIsWizardOpen(true);
              }}
            />
          </div>,
          actionBar,
        )}
    </MainLayout>
  );
};

export default FreeTimeActivities;
