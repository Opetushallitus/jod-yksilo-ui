import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';

import { Button, EmptyState, MainLayout, Tag, useMediaQueries } from '@jod/design-system';

import { Breadcrumb } from '@/components';
import { useArrowKeyControls } from '@/hooks/useArrowKeyControls';
import { useModal } from '@/hooks/useModal';
import { useSessionGuardedAction } from '@/hooks/useSessionGuardedAction';
import EditMuuOsaaminenModal from '@/routes/Profile/SomethingElse/EditMuuOsaaminenModal';
import { getLocalizedText, sortByProperty } from '@/utils';

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
  const guardedAction = useSessionGuardedAction();

  const sortedData = React.useMemo(
    () => [...muuOsaaminen].sort(sortByProperty(`nimi.${language}`)),
    [muuOsaaminen, language],
  );

  const { ref, handleKeyDown } = useArrowKeyControls(sortedData);

  return (
    <MainLayout
      breadcrumbComponent={<Breadcrumb />}
      navChildren={
        <div className="flex flex-col gap-5">
          <ProfileNavigationList />
          <ToolCard testId="something-else-go-to-tool" />
        </div>
      }
    >
      {!lg && (
        <div className="mb-6 px-5 sm:px-6">
          <ProfileNavigationList collapsed />
        </div>
      )}
      <title>{title}</title>
      <div className="px-5 sm:px-6 lg:pr-0 lg:pl-6">
        <ProfileSectionTitle type="MUU_OSAAMINEN" title={title} />
        <p className="mb-7 text-body-lg-mobile sm:text-body-lg">{t('profile.something-else.description')}</p>

        {muuOsaaminen.length === 0 && (
          <div className="mt-6 mb-7" data-testid="something-else-empty-state">
            <EmptyState text={t('profile.something-else.empty')} />
          </div>
        )}

        {muuOsaaminen.length > 0 && (
          <h2 className="mb-5 border-b border-border-gray text-heading-3-mobile sm:text-heading-3">
            {t('profile.something-else.my-other-comptetences')}
          </h2>
        )}
        <ul ref={ref} className="flex flex-wrap gap-3" data-testid="something-else-tags" onKeyDown={handleKeyDown}>
          {sortedData.map((val) => (
            <li key={val.uri} className="max-w-full">
              <Tag
                label={getLocalizedText(val.nimi)}
                tooltip={getLocalizedText(val.kuvaus)}
                screenReaderTooltip={t('description-for', { description: getLocalizedText(val.kuvaus) })}
                variant="presentation"
                sourceType="jotain-muuta"
              />
            </li>
          ))}
        </ul>
        <div className="mb-8 flex pt-7">
          <Button
            variant="accent"
            ariaHaspopup="dialog"
            label={muuOsaaminen.length > 0 ? t('profile.competences.edit') : t('profile.competences.add')}
            onClick={guardedAction(showModal, EditMuuOsaaminenModal, { data: muuOsaaminen })}
            data-testid="something-else-edit"
          />
        </div>
        {lg ? null : <ToolCard testId="something-else-go-to-tool" className="mt-6" />}
      </div>
    </MainLayout>
  );
};

export default SomethingElse;
