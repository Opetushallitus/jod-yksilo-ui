import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';

import { Button, EmptyState, MainLayout, Tag, useMediaQueries } from '@jod/design-system';

import { client } from '@/api/client';
import { Breadcrumb } from '@/components';
import { ESCO_OCCUPATION_PREFIX } from '@/constants';
import { useArrowKeyControls } from '@/hooks/useArrowKeyControls';
import { useModal } from '@/hooks/useModal';
import { useSessionGuardedAction } from '@/hooks/useSessionGuardedAction';
import EditKiinnostusModal from '@/routes/Profile/Interests/EditKiinnostusModal';
import { getLocalizedText, sortByProperty } from '@/utils';

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
  const guardedAction = useSessionGuardedAction();

  const sortedSkills = sortedData.filter((value) => !value.uri.startsWith(ESCO_OCCUPATION_PREFIX));
  const sortedOccupations = sortedData.filter((value) => value.uri.startsWith(ESCO_OCCUPATION_PREFIX));

  const isSkillsEmpty = sortedSkills.length === 0;
  const isOccupationSkillsEmpty = sortedOccupations.length === 0;
  const isAllSkillsEmpty = isSkillsEmpty && isOccupationSkillsEmpty;

  const { ref, handleKeyDown } = useArrowKeyControls(sortedSkills);
  const { ref: occupationsRef, handleKeyDown: onOccupationsKeyDown } = useArrowKeyControls(sortedOccupations);

  return (
    <MainLayout
      breadcrumbComponent={<Breadcrumb />}
      navChildren={
        <div className="flex flex-col gap-5">
          <ProfileNavigationList />
          <ToolCard testId="interests-go-to-tool" />
        </div>
      }
      testId="interests-page"
    >
      {!lg && (
        <div className="mb-6 px-5 sm:px-6">
          <ProfileNavigationList collapsed />
        </div>
      )}
      <title>{title}</title>
      <div className="px-5 sm:px-6 lg:pr-0 lg:pl-6">
        <ProfileSectionTitle type="KIINNOSTUS" title={title} />
        <p className="mb-7 text-body-lg-mobile sm:text-body-lg">{t('profile.interests.description')}</p>
        {isAllSkillsEmpty && (
          <div className="mt-6 mb-7">
            <EmptyState text={t('profile.interests.empty')} testId="interests-empty-state" />
          </div>
        )}
        {!isSkillsEmpty && (
          <>
            <h2
              className="mb-5 border-b border-border-gray text-heading-3-mobile sm:text-heading-3"
              data-testid="interests-skills-header"
            >
              {t('profile.interests.skills-that-interest-me')}
            </h2>
            <ul
              ref={ref}
              className="flex flex-wrap gap-3"
              onKeyDown={handleKeyDown}
              data-testid="interests-skills-list"
            >
              {sortedSkills.map((val) => (
                <li key={val.uri} className="max-w-full">
                  <Tag
                    label={getLocalizedText(val.nimi)}
                    tooltip={getLocalizedText(val.kuvaus)}
                    screenReaderTooltip={t('description-for', { description: getLocalizedText(val.kuvaus) })}
                    variant="presentation"
                    sourceType="kiinnostus"
                    testId="interest-tag"
                  />
                </li>
              ))}
            </ul>
          </>
        )}
        {!isOccupationSkillsEmpty && (
          <>
            <h2
              className="mt-8 mb-5 border-b border-border-gray text-heading-3-mobile sm:text-heading-3"
              data-testid="interests-occupations-header"
            >
              {t('profile.interests.occupations-that-interest-me')}
            </h2>
            <ul
              ref={occupationsRef}
              className="flex flex-wrap gap-3"
              onKeyDown={onOccupationsKeyDown}
              data-testid="interests-occupations-list"
            >
              {sortedOccupations.map((val) => (
                <li key={val.uri} className="max-w-full">
                  <Tag
                    label={getLocalizedText(val.nimi)}
                    tooltip={getLocalizedText(val.kuvaus)}
                    screenReaderTooltip={t('description-for', { description: getLocalizedText(val.kuvaus) })}
                    variant="presentation"
                    sourceType="kiinnostus"
                    testId="interest-tag"
                  />
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="mb-7 flex pt-7">
          <Button
            variant="accent"
            ariaHaspopup="dialog"
            label={isAllSkillsEmpty ? t('profile.interests.add-interests') : t('profile.interests.edit-interests')}
            onClick={guardedAction(showModal, EditKiinnostusModal, { data: kiinnostukset })}
            testId={kiinnostukset.length > 0 ? 'interests-edit-button' : 'interests-add-button'}
          />
        </div>
        <div className="mb-7">
          <FreeFormTextInputBlock
            header={t('profile.interests.freeform.header')}
            description={t('profile.interests.freeform.description')}
            placeholder={t('profile.interests.freeform.placeholder')}
            text={vapaateksti}
            onChange={async (value) => {
              guardedAction(async () => {
                await client.PUT('/api/profiili/kiinnostukset/vapaateksti', {
                  body: value,
                });
              })();
            }}
            testId="interests-freeform"
          />
        </div>
        {lg ? null : <ToolCard testId="interests-go-to-tool" className="mt-6" />}
      </div>
    </MainLayout>
  );
};

export default Interests;
