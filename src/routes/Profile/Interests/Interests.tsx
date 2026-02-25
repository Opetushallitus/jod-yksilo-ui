import { client } from '@/api/client';
import { MainLayout } from '@/components';
import { ESCO_OCCUPATION_PREFIX } from '@/constants';
import { useModal } from '@/hooks/useModal';
import EditKiinnostusModal from '@/routes/Profile/Interests/EditKiinnostusModal';
import { getLocalizedText, sortByProperty } from '@/utils';
import { Button, EmptyState, Tag, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import { ProfileNavigationList, ProfileSectionTitle } from '../components';
import { FreeFormTextInputBlock } from '../components/FreeFormTextInputBlock';
import { ToolCard } from '../components/ToolCard';

const Interests = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { showModal } = useModal();
  const { lg } = useMediaQueries();
  const { kiinnostukset, vapaateksti } = useLoaderData();
  const title = t('profile.interests.title');

  const sortedData = React.useMemo(
    () => [...kiinnostukset].sort(sortByProperty(`nimi.${language}`)),
    [kiinnostukset, language],
  );

  const sortedSkills = sortedData.filter((value) => !value.uri.startsWith(ESCO_OCCUPATION_PREFIX));
  const sortedOccupations = sortedData.filter((value) => value.uri.startsWith(ESCO_OCCUPATION_PREFIX));

  const isSkillsEmpty = sortedSkills.length === 0;
  const isOccupationSkillsEmpty = sortedOccupations.length === 0;
  const isAllSkillsEmpty = isSkillsEmpty && isOccupationSkillsEmpty;

  return (
    <MainLayout
      navChildren={
        <div className="flex flex-col gap-5">
          <ProfileNavigationList />
          <ToolCard testId="interests-go-to-tool" />
        </div>
      }
    >
      {!lg && (
        <div className="mb-6">
          <ProfileNavigationList collapsed />
        </div>
      )}
      <title>{title}</title>
      <ProfileSectionTitle type="KIINNOSTUS" title={title} />
      <p className="mb-5 text-body-lg">{t('profile.interests.description')}</p>
      {isAllSkillsEmpty && (
        <div className="mt-6 mb-7">
          <EmptyState text={t('profile.interests.empty')} testId="interests-empty-state" />
        </div>
      )}
      {!isSkillsEmpty && (
        <>
          <h2 className="mb-5 pb-3 text-heading-3 border-b border-border-gray">
            {t('profile.interests.skills-that-interest-me')}
          </h2>
          <ul className="flex flex-wrap gap-3">
            {sortedSkills.map((val) => (
              <li key={val.uri} className="max-w-full">
                <Tag
                  label={getLocalizedText(val.nimi)}
                  tooltip={getLocalizedText(val.kuvaus)}
                  variant="presentation"
                  sourceType="kiinnostus"
                />
              </li>
            ))}
          </ul>
        </>
      )}
      {!isOccupationSkillsEmpty && (
        <>
          <h2 className="mb-5 pb-3 text-heading-3 border-b border-border-gray mt-8">
            {t('profile.interests.occupations-that-interest-me')}
          </h2>
          <ul className="flex flex-wrap gap-3">
            {sortedOccupations.map((val) => (
              <li key={val.uri} className="max-w-full">
                <Tag
                  label={getLocalizedText(val.nimi)}
                  tooltip={getLocalizedText(val.kuvaus)}
                  variant="presentation"
                  sourceType="kiinnostus"
                />
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="flex pt-7 mb-7">
        <Button
          variant="accent"
          label={isAllSkillsEmpty ? t('profile.interests.add-interests') : t('profile.interests.edit-interests')}
          onClick={() => {
            showModal(EditKiinnostusModal, { data: kiinnostukset });
          }}
          testId="interests-edit-button"
        />
      </div>
      <div className="mb-7">
        <FreeFormTextInputBlock
          header={t('profile.interests.freeform.header')}
          description={t('profile.interests.freeform.description')}
          placeholder={t('profile.interests.freeform.placeholder')}
          text={vapaateksti}
          onChange={async (value) => {
            await client.PUT('/api/profiili/kiinnostukset/vapaateksti', {
              body: value,
            });
          }}
          testId="interests-freeform"
        />
      </div>
      {lg ? null : <ToolCard testId="interests-go-to-tool" className="mt-6" />}
    </MainLayout>
  );
};

export default Interests;
