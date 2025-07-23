import { ExperienceTable, MainLayout, type ExperienceTableRowData } from '@/components';
import { useModal } from '@/hooks/useModal';
import { EditVapaaAjanToimintoModal } from '@/routes/Profile/FreeTimeActivities/modals/EditVapaaAjanToimintoModal';
import { JodArrowRight, JodInterests } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLoaderData } from 'react-router';
import { ProfileNavigationList } from '../components';
import { FreeTimeActivitiesWizard } from './FreeTimeActivitiesWizard';
import { AddOrEditPatevyysModal } from './modals/AddOrEditPatevyysModal';
import { getFreeTimeActivitiesTableRows, type VapaaAjanToiminto } from './utils';

const FreeTimeActivities = () => {
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
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const title = t('profile.free-time-activities.title');
  const [rows, setRows] = React.useState(getFreeTimeActivitiesTableRows(vapaaAjanToiminnot, osaamisetMap));
  const { showModal } = useModal();

  React.useEffect(() => {
    setRows(getFreeTimeActivitiesTableRows(vapaaAjanToiminnot, osaamisetMap));
  }, [vapaaAjanToiminnot, osaamisetMap]);

  const onRowClick = (row: ExperienceTableRowData) => {
    showModal(EditVapaaAjanToimintoModal, { toimintoId: row.key });
  };

  const onNestedRowClick = (row: ExperienceTableRowData) => {
    const toiminto = vapaaAjanToiminnot.find((vat) => vat.patevyydet.find((p) => p.id === row.key));
    if (toiminto?.id) {
      showModal(AddOrEditPatevyysModal, {
        toimintoId: toiminto.id,
        patevyysId: row.key,
      });
    }
  };

  const onAddNestedRowClick = (row: ExperienceTableRowData) => {
    showModal(AddOrEditPatevyysModal, { toimintoId: row.key });
  };

  return (
    <MainLayout navChildren={<ProfileNavigationList />}>
      <title>{title}</title>
      <h1 className="mb-5 text-heading-2 sm:text-heading-1 flex items-center">
        <JodInterests size={36} className="text-accent mr-2" />
        {title}
      </h1>
      <p className="mb-5 text-body-lg">{t('profile.free-time-activities.description')}</p>
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
        mainColumnHeader={t('free-time-activities.theme-or-activity')}
        addNewLabel={t('free-time-activities.add-new-free-time-theme-and-activities')}
        addNewNestedLabel={t('free-time-activities.add-new-activity')}
        rows={rows}
        onAddClick={() => {
          showModal(FreeTimeActivitiesWizard);
        }}
        onRowClick={onRowClick}
        onNestedRowClick={onNestedRowClick}
        onAddNestedRowClick={onAddNestedRowClick}
      />
    </MainLayout>
  );
};

export default FreeTimeActivities;
