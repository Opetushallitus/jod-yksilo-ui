import { ExperienceTable, MainLayout, type ExperienceTableRowData } from '@/components';
import EditTyonantajaModal from '@/routes/Profile/WorkHistory/modals/EditTyonantajaModal';
import { JodArrowRight, JodWork } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLoaderData, useRevalidator } from 'react-router';
import { ProfileNavigationList } from '../components';
import { WorkHistoryWizard } from './WorkHistoryWizard';
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
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const title = t('profile.work-history.title');
  const [rows, setRows] = React.useState(getWorkHistoryTableRows(tyopaikat, osaamisetMap));
  const [tyopaikkaId, setTyopaikkaId] = React.useState<string | undefined>(undefined);
  const [toimenkuvaId, setToimenkuvaId] = React.useState<string | undefined>(undefined);
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [isTyonantajaOpen, setIsTyonantajaOpen] = React.useState(false);
  const [isToimenkuvaOpen, setIsToimenkuvaOpen] = React.useState(false);
  const revalidator = useRevalidator(); // For reloading data after modal close

  React.useEffect(() => {
    setRows(getWorkHistoryTableRows(tyopaikat, osaamisetMap));
  }, [tyopaikat, osaamisetMap]);

  const onRowClick = (row: ExperienceTableRowData) => {
    setTyopaikkaId(row.key);
    setIsTyonantajaOpen(true);
  };

  const onNestedRowClick = (row: ExperienceTableRowData) => {
    const tyopaikka = tyopaikat.find((tp) => tp.toimenkuvat.find((tk) => tk.id === row.key));
    if (tyopaikka?.id) {
      setTyopaikkaId(tyopaikka.id);
      setToimenkuvaId(row.key);
      setIsToimenkuvaOpen(true);
    }
  };

  const onAddNestedRowClick = (row: ExperienceTableRowData) => {
    setTyopaikkaId(row.key);
    setIsToimenkuvaOpen(true);
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
    <MainLayout navChildren={<ProfileNavigationList />}>
      <title>{title}</title>
      <h1 className="mb-5 text-heading-2 sm:text-heading-1 flex items-center">
        <JodWork size={36} color="#AD4298" className="mr-2" />
        {title}
      </h1>
      <p className="mb-5 text-body-lg">{t('profile.work-history.description')}</p>
      <div className="mb-8">
        <Link
          to={`/${language}/${t('slugs.tool.index')}/${t('slugs.tool.competences')}`}
          className="text-button-md hover:underline text-accent mt-4"
        >
          <div className="flex items-center gap-2">
            {t('profile.favorites.link-go-to-job-and-education-opportunities')}
            <JodArrowRight />
          </div>
        </Link>
      </div>
      <ExperienceTable
        mainColumnHeader={t('work-history.workplace-or-job-description')}
        addNewLabel={t('work-history.add-new-workplace')}
        addNewNestedLabel={t('work-history.add-new-job-description')}
        rows={rows}
        onAddClick={() => setIsWizardOpen(true)}
        onRowClick={onRowClick}
        onNestedRowClick={onNestedRowClick}
        onAddNestedRowClick={onAddNestedRowClick}
      />
      {isTyonantajaOpen && tyopaikkaId && (
        <EditTyonantajaModal isOpen={isTyonantajaOpen} onClose={onCloseTyonantajaModal} tyopaikkaId={tyopaikkaId} />
      )}
      {isToimenkuvaOpen && tyopaikkaId && (
        <AddOrEditToimenkuvaModal
          isOpen={isToimenkuvaOpen}
          onClose={onCloseToimenkuvaModal}
          tyopaikkaId={tyopaikkaId}
          toimenkuvaId={toimenkuvaId}
        />
      )}
      {isWizardOpen && <WorkHistoryWizard isOpen={isWizardOpen} onClose={onCloseWizard} />}
    </MainLayout>
  );
};

export default WorkHistory;
