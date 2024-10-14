import { OsaaminenDto } from '@/api/osaamiset';
import {
  MainLayout,
  RoutesNavigationList,
  SimpleNavigationList,
  Title,
  type RoutesNavigationListProps,
} from '@/components';
import EditMuuOsaaminenModal from '@/routes/Profile/SomethingElse/EditMuuOsaaminenModal';
import { getLocalizedText, sortByProperty } from '@/utils';
import { Button, Tag } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useOutletContext, useRevalidator } from 'react-router-dom';
import { mapNavigationRoutes } from '../utils';

const SomethingElse = () => {
  const routes: RoutesNavigationListProps['routes'] = useOutletContext();
  const { t, i18n } = useTranslation();
  const title = t('profile.something-else.title');
  const navigationRoutes = React.useMemo(() => mapNavigationRoutes(routes), [routes]);
  const data = useLoaderData() as OsaaminenDto[];
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const revalidator = useRevalidator();

  const onAddModalClose = () => {
    setIsModalOpen(false);
    revalidator.revalidate();
  };

  const sortedData = React.useMemo(() => [...data].sort(sortByProperty(`nimi.${i18n.language}`)), [data, i18n]);

  return (
    <MainLayout
      navChildren={
        <SimpleNavigationList title={t('profile.index')}>
          <RoutesNavigationList routes={navigationRoutes} />
        </SimpleNavigationList>
      }
    >
      {isModalOpen && <EditMuuOsaaminenModal onClose={onAddModalClose} isOpen={isModalOpen} />}
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-lg text-todo">{t('profile.something-else.description')}</p>
      {data.length > 0 && (
        <h2 className="mb-5 pb-3 text-heading-3 border-b border-border-gray">
          {t('profile.something-else.my-other-comptetences')}
        </h2>
      )}
      <div className="flex flex-wrap gap-3">
        {sortedData.map((val) => (
          <Tag
            label={getLocalizedText(val.nimi)}
            title={getLocalizedText(val.kuvaus)}
            key={val.uri}
            variant="presentation"
            sourceType="jotain-muuta"
          />
        ))}
      </div>
      <div className="flex pt-7">
        <Button
          variant="white"
          label={
            data.length > 0
              ? t('profile.something-else.edit-other-competences')
              : t('profile.something-else.add-other-competences')
          }
          onClick={() => {
            setIsModalOpen(true);
          }}
        />
      </div>
    </MainLayout>
  );
};

export default SomethingElse;
