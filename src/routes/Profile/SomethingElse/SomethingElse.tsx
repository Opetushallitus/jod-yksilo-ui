import { MainLayout } from '@/components';
import { useModal } from '@/hooks/useModal';
import EditMuuOsaaminenModal from '@/routes/Profile/SomethingElse/EditMuuOsaaminenModal';
import { getLocalizedText, sortByProperty } from '@/utils';
import { Button, EmptyState, Tag, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import { ProfileNavigationList, ProfileSectionTitle } from '../components';
import { ToolCard } from '../components/ToolCard';

const SomethingElse = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const title = t('profile.something-else.title');
  const { showModal } = useModal();
  const { lg } = useMediaQueries();
  const { muuOsaaminen } = useLoaderData();

  const sortedData = React.useMemo(
    () => [...muuOsaaminen].sort(sortByProperty(`nimi.${language}`)),
    [muuOsaaminen, language],
  );

  return (
    <MainLayout
      navChildren={
        <div className="flex flex-col gap-5">
          <ProfileNavigationList />
          <ToolCard testId="something-else-go-to-tool" />
        </div>
      }
    >
      {!lg && (
        <div className="mb-6">
          <ProfileNavigationList collapsed />
        </div>
      )}
      <title>{title}</title>
      <ProfileSectionTitle type="MUU_OSAAMINEN" title={title} />
      <p className="mb-5 text-body-lg">{t('profile.something-else.description')}</p>

      {muuOsaaminen.length === 0 && (
        <div className="mt-6 mb-7" data-testid="something-else-empty-state">
          <EmptyState text={t('profile.something-else.empty')} />
        </div>
      )}

      {muuOsaaminen.length > 0 && (
        <h2 className="mb-5 pb-3 text-heading-3 border-b border-border-gray">
          {t('profile.something-else.my-other-comptetences')}
        </h2>
      )}
      <ul className="flex flex-wrap gap-3" data-testid="something-else-tags">
        {sortedData.map((val) => (
          <li key={val.uri} className="max-w-full">
            <Tag
              label={getLocalizedText(val.nimi)}
              tooltip={getLocalizedText(val.kuvaus)}
              variant="presentation"
              sourceType="jotain-muuta"
            />
          </li>
        ))}
      </ul>
      <div className="flex pt-7 mb-8">
        <Button
          variant="accent"
          label={muuOsaaminen.length > 0 ? t('profile.competences.edit') : t('profile.competences.add')}
          onClick={() => {
            showModal(EditMuuOsaaminenModal, { data: muuOsaaminen });
          }}
          data-testid="something-else-edit"
        />
      </div>
      {lg ? null : <ToolCard testId="something-else-go-to-tool" className="mt-6" />}
    </MainLayout>
  );
};

export default SomethingElse;
