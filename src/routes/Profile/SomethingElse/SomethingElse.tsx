import { OsaaminenDto } from '@/api/osaamiset';
import { MainLayout } from '@/components';
import EditMuuOsaaminenModal from '@/routes/Profile/SomethingElse/EditMuuOsaaminenModal';
import { getLocalizedText, sortByProperty } from '@/utils';
import { Button, Tag } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdLightbulbOutline } from 'react-icons/md';
import { useLoaderData, useRevalidator } from 'react-router';
import { ProfileNavigationList } from '../components';

const SomethingElse = () => {
  const { t, i18n } = useTranslation();
  const title = t('profile.something-else.title');
  const data = useLoaderData() as OsaaminenDto[];
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const revalidator = useRevalidator();

  const onAddModalClose = () => {
    setIsModalOpen(false);
    revalidator.revalidate();
  };

  const sortedData = React.useMemo(() => [...data].sort(sortByProperty(`nimi.${i18n.language}`)), [data, i18n]);

  return (
    <MainLayout navChildren={<ProfileNavigationList />}>
      {isModalOpen && <EditMuuOsaaminenModal onClose={onAddModalClose} isOpen={isModalOpen} />}
      <title>{title}</title>
      <h1 className="mb-5 text-heading-2 sm:text-heading-1 flex items-center">
        <MdLightbulbOutline className="text-secondary-gray mr-2" />
        {title}
      </h1>
      <p className="mb-8 text-body-lg">{t('profile.something-else.description')}</p>
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
          label={data.length > 0 ? t('profile.competences.edit') : t('profile.competences.add')}
          onClick={() => {
            setIsModalOpen(true);
          }}
        />
      </div>
    </MainLayout>
  );
};

export default SomethingElse;
