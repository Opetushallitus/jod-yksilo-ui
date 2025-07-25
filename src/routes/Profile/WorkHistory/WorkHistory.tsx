import { ExperienceTable, MainLayout, type ExperienceTableRowData } from '@/components';
import { useModal } from '@/hooks/useModal';
import EditTyonantajaModal from '@/routes/Profile/WorkHistory/modals/EditTyonantajaModal';
import { WorkHistoryWizard } from '@/routes/Profile/WorkHistory/WorkHistoryWizard';
import { JodArrowRight, JodWork } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLoaderData } from 'react-router';
import { ProfileNavigationList } from '../components';
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
  const { showModal } = useModal();

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
        onAddClick={() => {
          showModal(WorkHistoryWizard);
        }}
        onRowClick={onRowClick}
        onNestedRowClick={onNestedRowClick}
        onAddNestedRowClick={onAddNestedRowClick}
      />
    </MainLayout>
  );
};

export default WorkHistory;
