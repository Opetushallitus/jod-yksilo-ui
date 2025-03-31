import { components } from '@/api/schema';
import { MainLayout } from '@/components';
import { ESCO_OCCUPATION_PREFIX } from '@/constants';
import EditKiinnostusModal from '@/routes/Profile/Interests/EditKiinnostusModal';
import { getLocalizedText, sortByProperty } from '@/utils';
import { Button, Tag } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useRevalidator } from 'react-router';
import { ProfileNavigationList } from '../components';

const Interests = () => {
  const { t, i18n } = useTranslation();
  const data = useLoaderData() as components['schemas']['OsaaminenDto'][];
  const title = t('profile.interests.title');
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const revalidator = useRevalidator();

  const onAddModalClose = () => {
    setIsAddModalOpen(false);
    revalidator.revalidate();
  };

  const sortedData = React.useMemo(() => [...data].sort(sortByProperty(`nimi.${i18n.language}`)), [data, i18n]);

  const sortedSkills = sortedData.filter((value) => !value.uri.startsWith(ESCO_OCCUPATION_PREFIX));
  const sortedOccupations = sortedData.filter((value) => value.uri.startsWith(ESCO_OCCUPATION_PREFIX));

  return (
    <MainLayout
      navChildren={
        <div className="flex flex-col gap-5">
          <ProfileNavigationList />
        </div>
      }
    >
      {isAddModalOpen && <EditKiinnostusModal onClose={onAddModalClose} isOpen={isAddModalOpen} />}
      <title>{title}</title>
      <h1 className="text-heading-1 mb-5">{title}</h1>
      <p className="mb-8 text-body-lg">{t('profile.interests.description')}</p>
      {sortedSkills.length > 0 && (
        <>
          <h2 className="mb-5 pb-3 text-heading-3 border-b border-border-gray">
            {t('profile.interests.skills-that-interest-me')}
          </h2>
          <div className="flex flex-wrap gap-3">
            {sortedSkills.map((val) => (
              <Tag
                label={getLocalizedText(val.nimi)}
                title={getLocalizedText(val.kuvaus)}
                key={val.uri}
                variant="presentation"
                sourceType="kiinnostus"
              />
            ))}
          </div>
        </>
      )}
      {sortedOccupations.length > 0 && (
        <>
          <h2 className="mb-5 pb-3 text-heading-3 border-b border-border-gray mt-8">
            {t('profile.interests.occupations-that-interest-me')}
          </h2>
          <div className="flex flex-wrap gap-3">
            {sortedOccupations.map((val) => (
              <Tag
                label={getLocalizedText(val.nimi)}
                title={getLocalizedText(val.kuvaus)}
                key={val.uri}
                variant="presentation"
                sourceType="kiinnostus"
              />
            ))}
          </div>
        </>
      )}
      <div className="flex pt-7">
        <Button
          variant="white"
          label={t('profile.interests.edit-interests')}
          onClick={() => {
            setIsAddModalOpen(true);
          }}
        />
      </div>
    </MainLayout>
  );
};

export default Interests;
