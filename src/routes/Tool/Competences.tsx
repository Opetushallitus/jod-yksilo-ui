import { components } from '@/api/schema';
import { HelpingToolProfileLinkItem, HelpingToolsContent, OsaamisSuosittelija } from '@/components';
import { useDebounceState } from '@/hooks/useDebounceState';
import { Accordion, InputField, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdLightbulbOutline, MdOutlineSailing, MdOutlineSchool } from 'react-icons/md';
import { TbBriefcase2 } from 'react-icons/tb';
import { useOutletContext, useRouteLoaderData } from 'react-router-dom';
import { generateProfileLink } from '../Profile/utils';
import { ContextType } from './types';

const HelpingToolsContents = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const data = useRouteLoaderData('root') as components['schemas']['YksiloCsrfDto'] | null;
  const competencesSlug = 'slugs.profile.competences';

  const educationLink = React.useMemo(
    () => generateProfileLink([competencesSlug, 'slugs.profile.education-history'], data, language, t),
    [data, language, t],
  );
  const workLink = React.useMemo(
    () => generateProfileLink([competencesSlug, 'slugs.profile.work-history'], data, language, t),
    [data, language, t],
  );
  const freeTimeLink = React.useMemo(
    () => generateProfileLink([competencesSlug, 'slugs.profile.free-time-activities'], data, language, t),
    [data, language, t],
  );
  const somethingElseLink = React.useMemo(
    () => generateProfileLink([competencesSlug, 'slugs.profile.something-else'], data, language, t),
    [data, language, t],
  );

  return (
    <HelpingToolsContent text={t('profile.help-text')}>
      <HelpingToolProfileLinkItem
        profileLink={educationLink}
        icon={<MdOutlineSchool size={24} color="#00818A" />}
        title={t('profile.education-history.title')}
      />
      <HelpingToolProfileLinkItem
        profileLink={workLink}
        icon={<TbBriefcase2 size={24} color="#AD4298" />}
        title={t('profile.work-history.title')}
      />
      <HelpingToolProfileLinkItem
        profileLink={freeTimeLink}
        icon={<MdOutlineSailing size={24} className="text-accent" />}
        title={t('profile.free-time-activities.title')}
      />
      <HelpingToolProfileLinkItem
        profileLink={somethingElseLink}
        icon={<MdLightbulbOutline size={24} className="text-secondary-5" />}
        title={t('profile.something-else.title')}
      />
    </HelpingToolsContent>
  );
};

const Competences = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { sm } = useMediaQueries();

  const [debouncedTaito, taito, setTaito] = useDebounceState('', 500);
  const {
    competences: [osaamiset, setOsaamiset],
  } = useOutletContext<ContextType>();

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-3">
        <div className="order-1 col-span-1 sm:col-span-2">
          <h1 className="mb-5 mt-7 text-heading-1 text-black">{t('tool.competences.heading-1')}</h1>

          <div className="flex flex-col pb-7 gap-6 text-body-md text-black">
            <p>{t('tool.competences.page-description')}</p>
            <p>{t('tool.competences.field-description')}</p>
          </div>
        </div>

        <div className="order-3 col-span-1 sm:order-2 sm:col-span-2">
          <div className="mb-5">
            <InputField
              label={t('tool.competences.input-field-placeholder')}
              placeholder={t('tool.competences.input-field-placeholder')}
              value={taito}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTaito(event.target.value)}
            />
          </div>
          <OsaamisSuosittelija description={debouncedTaito} onChange={setOsaamiset} value={osaamiset} />
        </div>
        <div className="order-2 col-span-1 mb-8 flex flex-col gap-4 sm:order-3 sm:mb-0 bg-todo">
          {sm ? (
            <>
              <span className="text-heading-4 text-black">{t('tools')}</span>
              <HelpingToolsContents />
            </>
          ) : (
            <Accordion
              title={t('tools')}
              expandLessText={t('expand-less')}
              expandMoreText={t('expand-more')}
              lang={language}
            >
              <HelpingToolsContents />
            </Accordion>
          )}
        </div>
      </div>
    </div>
  );
};

export default Competences;
