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
import { EducationHistoryWizard } from '@/routes/Profile/EducationHistory/EducationHistoryWizard';
import EditKoulutusModal from '@/routes/Profile/EducationHistory/modals/EditKoulutusModal';
import EditKoulutuskokonaisuusModal from '@/routes/Profile/EducationHistory/modals/EditKoulutuskokonaisuusModal';
import { Button } from '@jod/design-system';
import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useOutletContext, useRevalidator } from 'react-router-dom';
import { mapNavigationRoutes } from '../utils';
import { Koulutuskokonaisuus, getEducationHistoryTableRows } from './utils';

const EducationHistory = () => {
  const routes: RoutesNavigationListProps['routes'] = useOutletContext();
  const koulutuskokonaisuudet = useLoaderData() as Koulutuskokonaisuus[];
  const { t } = useTranslation();
  const title = t('profile.education-history');
  const navigationRoutes = React.useMemo(() => mapNavigationRoutes(routes), [routes]);
  const actionBar = useActionBar();
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [isKoulutuskokonaisuusOpen, setIsKoulutuskokonaisuusOpen] = React.useState(false);
  const [isKoulutusOpen, setIsKoulutusOpen] = React.useState(false);
  const [koulutusId, setKoulutusId] = React.useState<string | undefined>(undefined);
  const [koulutuskokonaisuusId, setKoulutuskokonaisuusId] = React.useState<string | undefined>(undefined);
  const [rows, setRows] = React.useState<ExperienceTableRowData[]>(getEducationHistoryTableRows(koulutuskokonaisuudet));
  const revalidator = useRevalidator(); // For reloading data after modal close

  React.useEffect(() => {
    setRows(getEducationHistoryTableRows(koulutuskokonaisuudet));
  }, [koulutuskokonaisuudet]);

  const handleRowClick = (row: ExperienceTableRowData) => {
    if (Array.isArray(row.subrows)) {
      setKoulutuskokonaisuusId(row.key);
      setIsKoulutuskokonaisuusOpen(true);
    } else {
      const koulutus = koulutuskokonaisuudet.find((kk) => kk.koulutukset.find((k) => k.id === row.key));

      if (koulutus?.id) {
        setKoulutuskokonaisuusId(koulutus.id);
        setKoulutusId(row.key);
        setIsKoulutusOpen(true);
      }
    }
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
        mainColumnHeader={t('education-history.education-or-degree')}
        rows={rows}
        onRowClick={handleRowClick}
      />
      {isKoulutuskokonaisuusOpen && (
        <EditKoulutuskokonaisuusModal
          isOpen={isKoulutuskokonaisuusOpen}
          onClose={onCloseKategoriaModal}
          koulutuskokonaisuusId={koulutuskokonaisuusId!}
        />
      )}
      {isKoulutusOpen && (
        <EditKoulutusModal
          isOpen={isKoulutusOpen}
          onClose={onCloseKoulutusModal}
          koulutuskokonaisuusId={koulutuskokonaisuusId!}
          koulutusId={koulutusId!}
        />
      )}
      {isWizardOpen && <EducationHistoryWizard isOpen={isWizardOpen} onClose={onCloseWizard} />}
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button
              variant="white"
              label={t('education-history.add-new-education')}
              onClick={() => setIsWizardOpen(true)}
            />
          </div>,
          actionBar,
        )}
    </MainLayout>
  );
};

export default EducationHistory;
