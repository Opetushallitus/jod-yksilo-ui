import { components } from '@/api/schema';
import { HelpingToolProfileLinkItem } from '@/components';
import { HelpingToolExternalLinkItem } from '@/components/HelpingToolsContent/HelpingToolLinkItem';
import { generateProfileLink } from '@/routes/Profile/utils';
import { Accordion } from '@jod/design-system';
import {
  JodArrowRight,
  JodFavs,
  JodInterests,
  JodOpenInNew,
  JodOther,
  JodSkills,
  JodWork,
} from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useRouteLoaderData } from 'react-router';

const AdditionalSupport = () => {
  const data = useRouteLoaderData('root') as components['schemas']['YksiloCsrfDto'] | null;
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const competencesSlug = 'slugs.profile.competences';

  const { lng } = useParams();
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
  const interestsLink = React.useMemo(
    () => generateProfileLink(['slugs.profile.interests'], data, language, t),
    [data, language, t],
  );

  const Arrow = <JodArrowRight size={16} className="text-accent" />;

  return (
    <div className="bg-white rounded p-6">
      <Accordion title={t('tool.tools.title')} lang={language}>
        <div className="flex flex-col gap-5">
          <p className="text-body-xs sm:text-body-sm mb-3 text-secondary-gray">{t('tool.tools.help-text')}</p>
          <ul className="flex flex-col gap-5">
            <HelpingToolProfileLinkItem
              profileLink={workLink}
              iconLeft={<JodWork color="#AD4298" />}
              iconRight={Arrow}
              title={t('tool.tools.work-history')}
            />
            <HelpingToolProfileLinkItem
              profileLink={educationLink}
              iconLeft={<JodSkills color="#00818A" />}
              title={t('tool.tools.education-history')}
              iconRight={Arrow}
            />
            <HelpingToolProfileLinkItem
              profileLink={freeTimeLink}
              iconLeft={<JodInterests className="text-accent" />}
              title={t('tool.tools.free-time-activities')}
              iconRight={Arrow}
            />
            <HelpingToolProfileLinkItem
              profileLink={somethingElseLink}
              iconLeft={<JodOther className="text-secondary-gray" />}
              title={t('tool.tools.something-else')}
              iconRight={Arrow}
            />
            <HelpingToolProfileLinkItem
              profileLink={interestsLink}
              iconLeft={<JodFavs color="#006DB3" />}
              title={t('profile.interests.title')}
              iconRight={Arrow}
            />
          </ul>
          <p className="text-body-xs sm:text-body-sm mb-3 text-secondary-gray">{t('tool.tools.help-text-2')}</p>
          <ul className="flex flex-col gap-5">
            <HelpingToolExternalLinkItem
              href={`/urataidot/${lng}`}
              title={t('tool.tools.career-skills-self-assessment-tool')}
              iconRight={<JodOpenInNew className="text-accent" />}
            />
            <HelpingToolExternalLinkItem
              href="https://www.suomi.fi/palveluhakemisto/osaamispolku"
              title={t('tool.tools.service-directory')}
              iconRight={<JodOpenInNew className="text-accent" />}
            />
          </ul>
        </div>
      </Accordion>
    </div>
  );
};

export default AdditionalSupport;
