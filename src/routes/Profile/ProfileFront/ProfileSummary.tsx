import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { cx, Tooltip, TooltipContent, TooltipTrigger } from '@jod/design-system';

import { TooltipWrapper } from '@/components/Tooltip/TooltipWrapper';
import {
  getBgClassByProfileSectionType,
  getIconByProfileSectionType,
  type ProfileSectionType,
} from '@/routes/Profile/utils';

import type { ProfileSummary as ProfileSummaryData } from './loader';

interface SectionItem {
  testId: string;
  type: ProfileSectionType;
  label: string;
  count: number;
  tooltip: string;
  to: string;
  filledClassName: string;
}

interface CompetenceItem {
  testId: string;
  label: string;
  count: number;
  tooltip: string;
}

const SectionCard = ({ item }: { item: SectionItem }) => {
  const descriptionId = React.useId();
  const isFilled = item.count > 0;

  return (
    <li className="min-h-[76px]">
      <Link
        to={item.to}
        aria-describedby={descriptionId}
        className={cx(
          'group flex h-full items-center gap-3 rounded-md p-4 sm:flex-col sm:justify-center sm:gap-2 sm:px-3 sm:py-5',
          isFilled ? item.filledClassName : 'bg-white',
        )}
        data-testid={`profile-summary-section-${item.testId}`}
      >
        <span
          className={cx(
            'flex aspect-square size-[28px] shrink-0 items-center justify-center rounded-full text-white sm:size-6 [&>svg]:size-5',
            getBgClassByProfileSectionType(item.type),
          )}
          aria-hidden
        >
          {getIconByProfileSectionType(item.type)}
        </span>
        <Tooltip placement="top">
          <TooltipTrigger asChild noAriaDescribedby>
            <span className="max-w-full min-w-0 font-arial text-body-md wrap-break-word hyphens-auto sm:text-center">
              <span className="font-bold group-hover:underline">{item.label}</span>
              {isFilled ? (
                <span>
                  &nbsp;(<span data-testid={`profile-summary-section-count-${item.testId}`}>{item.count}</span>)
                </span>
              ) : (
                <span data-testid={`profile-summary-section-count-${item.testId}`} className="hidden sm:inline">
                  &nbsp;-
                </span>
              )}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-3xs z-50 rounded-md bg-primary-gray p-4 font-arial text-body-sm text-white">
            {item.tooltip}
          </TooltipContent>
        </Tooltip>
      </Link>
      <span id={descriptionId} className="sr-only">
        {item.tooltip}
      </span>
    </li>
  );
};

const CompetenceCount = ({ item }: { item: CompetenceItem }) => (
  <li className="flex">
    <TooltipWrapper tooltipContent={item.tooltip} tooltipPlacement="top" className="sm:text-body-sm">
      <span className="font-arial text-body-md" data-testid={`profile-summary-competences-${item.testId}`}>
        {item.label}&nbsp;&nbsp;
        <span data-testid={`profile-summary-competences-count-${item.testId}`}>
          {item.count > 0 ? item.count : '-'}
        </span>
      </span>
    </TooltipWrapper>
  </li>
);

export const ProfileSummary = ({ summary }: { summary: ProfileSummaryData }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const profileRoot = `/${language}/${t('slugs.profile.index')}`;
  const competencesRoot = `${profileRoot}/${t('slugs.profile.competences')}`;
  const { sections: s, osaamiset: o } = summary;

  const sections: SectionItem[] = [
    {
      testId: 'work-history',
      type: 'TOIMENKUVA',
      label: t('profile.summary.sections.work-history.label'),
      count: s.tyopaikat,
      tooltip:
        s.tyopaikat > 0
          ? t('profile.summary.sections.work-history.filled', { count: s.tyopaikat })
          : t('profile.summary.sections.work-history.empty'),
      to: `${competencesRoot}/${t('slugs.profile.work-history')}`,
      filledClassName: 'bg-primary-4-light-2',
    },
    {
      testId: 'education-history',
      type: 'KOULUTUS',
      label: t('profile.summary.sections.education-history.label'),
      count: s.koulutukset,
      tooltip:
        s.koulutukset > 0
          ? t('profile.summary.sections.education-history.filled', { count: s.koulutukset })
          : t('profile.summary.sections.education-history.empty'),
      to: `${competencesRoot}/${t('slugs.profile.education-history')}`,
      filledClassName: 'bg-primary-2-light-2',
    },
    {
      testId: 'free-time-activities',
      type: 'TOIMINTO',
      label: t('profile.summary.sections.free-time-activities.label'),
      count: s.vapaaAjanToiminnot,
      tooltip:
        s.vapaaAjanToiminnot > 0
          ? t('profile.summary.sections.free-time-activities.filled', { count: s.vapaaAjanToiminnot })
          : t('profile.summary.sections.free-time-activities.empty'),
      to: `${competencesRoot}/${t('slugs.profile.free-time-activities')}`,
      filledClassName: 'bg-primary-1-light-2',
    },
    {
      testId: 'interests',
      type: 'KIINNOSTUS',
      label: t('profile.summary.sections.interests.label'),
      count: s.kiinnostukset,
      tooltip:
        s.kiinnostukset > 0
          ? t('profile.summary.sections.interests.filled', { count: s.kiinnostukset })
          : t('profile.summary.sections.interests.empty'),
      to: `${profileRoot}/${t('slugs.profile.interests')}`,
      filledClassName: 'bg-primary-3-light-2',
    },
    {
      testId: 'favorites',
      type: 'SUOSIKKI',
      label: t('profile.summary.sections.favorites.label'),
      count: s.suosikit,
      tooltip:
        s.suosikit > 0
          ? t('profile.summary.sections.favorites.filled', { count: s.suosikit })
          : t('profile.summary.sections.favorites.empty'),
      to: `${profileRoot}/${t('slugs.profile.favorites')}`,
      filledClassName: 'bg-primary-1-light-1',
    },
    {
      testId: 'goals',
      type: 'TAVOITTEENI',
      label: t('profile.summary.sections.goals.label'),
      count: s.tavoitteet,
      tooltip:
        s.tavoitteet > 0
          ? t('profile.summary.sections.goals.filled', { count: s.tavoitteet })
          : t('profile.summary.sections.goals.empty'),
      to: `${profileRoot}/${t('slugs.profile.goals')}`,
      filledClassName: 'bg-primary-1-light-1',
    },
  ];

  // Ordered so that the desktop two-column layout fills column by column
  const competences: CompetenceItem[] = [
    {
      testId: 'work-history',
      label: t('profile.summary.competences.work-history.label'),
      count: o.tyopaikat,
      tooltip:
        o.tyopaikat > 0
          ? t('profile.summary.competences.work-history.filled', { count: o.tyopaikat })
          : t('profile.summary.competences.work-history.empty'),
    },
    {
      testId: 'education-history',
      label: t('profile.summary.competences.education-history.label'),
      count: o.koulutukset,
      tooltip:
        o.koulutukset > 0
          ? t('profile.summary.competences.education-history.filled', { count: o.koulutukset })
          : t('profile.summary.competences.education-history.empty'),
    },
    {
      testId: 'free-time-activities',
      label: t('profile.summary.competences.free-time-activities.label'),
      count: o.vapaaAjanToiminnot,
      tooltip:
        o.vapaaAjanToiminnot > 0
          ? t('profile.summary.competences.free-time-activities.filled', { count: o.vapaaAjanToiminnot })
          : t('profile.summary.competences.free-time-activities.empty'),
    },
    {
      testId: 'interests',
      label: t('profile.summary.competences.interests.label'),
      count: o.kiinnostukset,
      tooltip:
        o.kiinnostukset > 0
          ? t('profile.summary.competences.interests.filled', { count: o.kiinnostukset })
          : t('profile.summary.competences.interests.empty'),
    },
    {
      testId: 'something-else',
      label: t('profile.summary.competences.something-else.label'),
      count: o.muutOsaamiset,
      tooltip:
        o.muutOsaamiset > 0
          ? t('profile.summary.competences.something-else.filled', { count: o.muutOsaamiset })
          : t('profile.summary.competences.something-else.empty'),
    },
  ];

  return (
    <section data-testid="profile-summary" className="font-poppins">
      <h2 className="mb-5 text-heading-3-mobile sm:text-heading-2">{t('profile.summary.title')}</h2>
      <ul className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {sections.map((item) => (
          <SectionCard key={item.testId} item={item} />
        ))}
      </ul>
      <div className="flex flex-col gap-5 rounded-md bg-white p-6 sm:flex-row sm:gap-0">
        <Link
          to={competencesRoot}
          className="flex shrink-0 flex-col text-accent hover:underline sm:border-r sm:border-border-gray sm:pr-6"
          data-testid="profile-summary-competences-link"
        >
          <span className="text-heading-2">{t('profile.summary.added-competences')}</span>
          <span className="text-heading-1" data-testid="profile-summary-competences-total">
            {o.total}
          </span>
        </Link>
        <ul className="grid grid-cols-1 gap-x-8 gap-y-3 font-arial sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-3 sm:pl-5">
          {competences.map((item) => (
            <CompetenceCount key={item.testId} item={item} />
          ))}
        </ul>
      </div>
    </section>
  );
};
