import {
  ExperienceTable,
  MainLayout,
  RoutesNavigationList,
  SimpleNavigationList,
  Title,
  type ExperienceTableRowData,
  type RoutesNavigationListProps,
} from '@/components';
import { EducationHistoryWizard } from '@/routes/Profile/EducationHistory/EducationHistoryWizard';
import EditKoulutuskokonaisuusModal from '@/routes/Profile/EducationHistory/modals/EditKoulutuskokonaisuusModal';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useOutletContext, useRevalidator } from 'react-router-dom';
import { mapNavigationRoutes } from '../utils';
import AddOrEditKoulutusModal from './modals/AddOrEditKoulutusModal';
import { Koulutuskokonaisuus, getEducationHistoryTableRows } from './utils';

const EducationHistory = () => {
  const routes = useOutletContext<RoutesNavigationListProps['routes']>();
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
  const { t } = useTranslation();
  const title = t('profile.education-history.title');
  const navigationRoutes = React.useMemo(() => mapNavigationRoutes(routes), [routes]);
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [isKoulutuskokonaisuusOpen, setIsKoulutuskokonaisuusOpen] = React.useState(false);
  const [isKoulutusOpen, setIsKoulutusOpen] = React.useState(false);
  const [koulutusId, setKoulutusId] = React.useState<string | undefined>(undefined);
  const [koulutuskokonaisuusId, setKoulutuskokonaisuusId] = React.useState<string | undefined>(undefined);
  const [rows, setRows] = React.useState<ExperienceTableRowData[]>(
    getEducationHistoryTableRows(koulutuskokonaisuudet, osaamisetMap),
  );
  const revalidator = useRevalidator(); // For reloading data after modal close

  React.useEffect(() => {
    setRows(getEducationHistoryTableRows(koulutuskokonaisuudet, osaamisetMap));
  }, [koulutuskokonaisuudet, osaamisetMap]);

  const onRowClick = (row: ExperienceTableRowData) => {
    setKoulutuskokonaisuusId(row.key);
    setIsKoulutuskokonaisuusOpen(true);
  };

  const onNestedRowClick = (row: ExperienceTableRowData) => {
    const koulutus = koulutuskokonaisuudet.find((kk) => kk.koulutukset.find((k) => k.id === row.key));
    if (koulutus?.id) {
      setKoulutuskokonaisuusId(koulutus.id);
      setKoulutusId(row.key);
      setIsKoulutusOpen(true);
    }
  };

  const onAddNestedRowClick = (row: ExperienceTableRowData) => {
    setKoulutuskokonaisuusId(row.key);
    setIsKoulutusOpen(true);
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
      <p className="mb-9 text-body-lg">{t('profile.education-history.description')}</p>
      <ExperienceTable
        mainColumnHeader={t('education-history.education-or-degree')}
        addNewLabel={t('education-history.add-new-education')}
        addNewNestedLabel={t('education-history.add-new-degree')}
        rows={rows}
        onAddClick={() => setIsWizardOpen(true)}
        onRowClick={onRowClick}
        onNestedRowClick={onNestedRowClick}
        onAddNestedRowClick={onAddNestedRowClick}
      />
      {isKoulutuskokonaisuusOpen && koulutuskokonaisuusId && (
        <EditKoulutuskokonaisuusModal
          isOpen={isKoulutuskokonaisuusOpen}
          onClose={onCloseKategoriaModal}
          koulutuskokonaisuusId={koulutuskokonaisuusId}
        />
      )}
      {isKoulutusOpen && koulutuskokonaisuusId && (
        <AddOrEditKoulutusModal
          isOpen={isKoulutusOpen}
          onClose={onCloseKoulutusModal}
          koulutuskokonaisuusId={koulutuskokonaisuusId}
          koulutusId={koulutusId}
        />
      )}
      {isWizardOpen && <EducationHistoryWizard isOpen={isWizardOpen} onClose={onCloseWizard} />}
    </MainLayout>
  );
};

export default EducationHistory;
