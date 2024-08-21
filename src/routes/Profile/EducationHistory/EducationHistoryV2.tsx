import {
  MainLayout,
  RoutesNavigationList,
  SimpleNavigationList,
  Title,
  type RoutesNavigationListProps,
} from '@/components';
import { useActionBar } from '@/hooks/useActionBar';
import { EducationHistoryWizard } from '@/routes/Profile/EducationHistory/EducationHistoryWizard';
import EditKategoriaModal from '@/routes/Profile/EducationHistory/modals/EditCategoryModal';
import EditKoulutusModal from '@/routes/Profile/EducationHistory/modals/EditKoulutusModal';
import { Button } from '@jod/design-system';
import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useOutletContext, useRevalidator } from 'react-router-dom';
import { mapNavigationRoutes } from '../utils';
import EducationTable from './EducationTable';
import { EducationRowData, Koulutus, getEducationHistoryTableRowsV2 } from './utils';

const EducationHistory = () => {
  const routes: RoutesNavigationListProps['routes'] = useOutletContext();
  const koulutukset = useLoaderData() as Koulutus[];
  const { t } = useTranslation();
  const title = t('profile.education-history');
  const navigationRoutes = React.useMemo(() => mapNavigationRoutes(routes), [routes]);
  const actionBar = useActionBar();
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = React.useState(false);
  const [isDegreeOpen, setIsDegreeOpen] = React.useState(false);
  const [koulutusId, setKoulutusId] = React.useState<string | undefined>(undefined);
  const [kategoriaId, setKategoriaId] = React.useState<string | undefined>(undefined);
  const [rows, setRows] = React.useState<EducationRowData[]>(getEducationHistoryTableRowsV2(koulutukset));
  const revalidator = useRevalidator(); // For reloading data after modal close

  React.useEffect(() => {
    setRows(getEducationHistoryTableRowsV2(koulutukset));
  }, [koulutukset]);

  const handleRowClick = (row: EducationRowData) => {
    if (Array.isArray(row.tutkinnot)) {
      setKategoriaId(row.key);
      setIsCategoryOpen(true);
    } else {
      setKoulutusId(row.key);
      setIsDegreeOpen(true);
    }
  };

  const onCloseCategoryModal = () => {
    setIsCategoryOpen(false);
    setKategoriaId(undefined);
    revalidator.revalidate();
  };

  const onCloseDegreeModal = () => {
    setIsDegreeOpen(false);
    setKoulutusId(undefined);
    revalidator.revalidate();
  };

  const onCloseAddModal = () => {
    setIsAddOpen(false);
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
      <EducationTable
        selectableColumnHeader={t('education-history.education-or-degree')}
        rows={rows}
        onRowClick={handleRowClick}
      />

      {isCategoryOpen && (
        <EditKategoriaModal isOpen={isCategoryOpen} onClose={onCloseCategoryModal} kategoriaId={kategoriaId!} />
      )}
      {isDegreeOpen && (
        <EditKoulutusModal isOpen={isDegreeOpen} onClose={onCloseDegreeModal} koulutusId={koulutusId!} />
      )}
      {isAddOpen && <EducationHistoryWizard isOpen={isAddOpen} setIsOpen={onCloseAddModal} selectedRow={undefined} />}
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button
              variant="white"
              label={t('education-history.add-new-education')}
              onClick={() => setIsAddOpen(true)}
            />
          </div>,
          actionBar,
        )}
    </MainLayout>
  );
};

export default EducationHistory;
