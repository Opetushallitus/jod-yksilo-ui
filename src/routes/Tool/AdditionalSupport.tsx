import { components } from '@/api/schema';
import { HelpingToolProfileLinkItem } from '@/components';
import { HelpingToolExternalLinkItem } from '@/components/HelpingToolsContent/HelpingToolLinkItem';
import { generateProfileLink } from '@/routes/Profile/utils';
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
import { IconWrapper } from './components/IconWrapper';

const AdditionalSupport = () => {
  const data = useRouteLoaderData('root') as components['schemas']['YksiloCsrfDto'] | null;
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const competencesSlug = t('slugs.profile.competences');

  const { lng } = useParams();
  const educationLink = React.useMemo(
    () => generateProfileLink([competencesSlug, t('slugs.profile.education-history')], data, language, t),
    [competencesSlug, data, language, t],
  );
  const workLink = React.useMemo(
    () => generateProfileLink([competencesSlug, t('slugs.profile.work-history')], data, language, t),
    [competencesSlug, data, language, t],
  );
  const freeTimeLink = React.useMemo(
    () => generateProfileLink([competencesSlug, t('slugs.profile.free-time-activities')], data, language, t),
    [competencesSlug, data, language, t],
  );
  const somethingElseLink = React.useMemo(
    () => generateProfileLink([competencesSlug, t('slugs.profile.something-else')], data, language, t),
    [competencesSlug, data, language, t],
  );
  const interestsLink = React.useMemo(
    () => generateProfileLink([t('slugs.profile.interests')], data, language, t),
    [data, language, t],
  );

  const Arrow = <JodArrowRight className="text-accent" />;

  return (
    <div className="bg-white rounded">
      <div className="flex flex-col gap-5 mt-5">
        <p className="text-body-sm sm:text-body-md text-primary-gray font-arial">{t('tool.tools.help-text')}</p>
        <ul className="flex flex-col gap-5 my-6">
          <HelpingToolProfileLinkItem
            profileLink={workLink}
            iconLeft={<IconWrapper color="#AD4298" Icon={JodWork} />}
            iconRight={Arrow}
            title={t('tool.tools.work-history')}
            testId="additional-support-work-history"
          />
          <HelpingToolProfileLinkItem
            profileLink={educationLink}
            iconLeft={<IconWrapper color="#00818A" Icon={JodSkills} />}
            title={t('tool.tools.education-history')}
            iconRight={Arrow}
            testId="additional-support-education-history"
          />
          <HelpingToolProfileLinkItem
            profileLink={freeTimeLink}
            iconLeft={<IconWrapper color="#006db3" Icon={JodInterests} />}
            title={t('tool.tools.free-time-activities')}
            iconRight={Arrow}
            testId="additional-support-something-else"
          />
          <HelpingToolProfileLinkItem
            profileLink={somethingElseLink}
            iconLeft={<IconWrapper color="#6E6E6E" Icon={JodOther} />}
            title={t('tool.tools.something-else')}
            iconRight={Arrow}
            testId="additional-support-free-time-activities"
          />
          <HelpingToolProfileLinkItem
            profileLink={interestsLink}
            iconLeft={<IconWrapper color="#EE7C45" Icon={JodFavs} />}
            title={t('profile.interests.title')}
            iconRight={Arrow}
            testId="additional-support-interests"
          />
        </ul>
        <p className="text-body-sm sm:text-body-md mb-6 font-arial text-primary-gray">{t('tool.tools.help-text-2')}</p>
        <ul className="flex flex-col gap-5">
          <HelpingToolExternalLinkItem
            href={`/urataidot/${lng}`}
            title={t('tool.tools.career-skills-self-assessment-tool')}
            iconRight={<JodOpenInNew className="text-accent" ariaLabel={t('common:external-link')} />}
            testId="additional-support-career-skills"
          />
          <HelpingToolExternalLinkItem
            href={t('common:navigation.extra.palveluhakemisto.url')}
            title={t('tool.tools.service-directory')}
            iconRight={<JodOpenInNew className="text-accent" ariaLabel={t('common:external-link')} />}
            testId="additional-support-service-directory"
          />
        </ul>
      </div>
    </div>
  );
};

export default AdditionalSupport;
