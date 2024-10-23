import { components } from '@/api/schema';
import { OSAAMINEN_COLOR_MAP } from '@/constants';
import { Tag } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useRouteLoaderData } from 'react-router-dom';
import { generateProfileLink } from '../utils';
import { COMPETENCE_TYPES, GroupByProps, MobileFilterButton, groupByHeaderClasses } from './constants';

export const GroupBySource = ({
  filters,
  locale,
  osaamiset,
  isOsaaminenVisible,
  mobileFilterOpenerComponent,
}: GroupByProps & MobileFilterButton) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const ArrowIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.175 9H0V7H12.175L6.575 1.4L8 0L16 8L8 16L6.575 14.6L12.175 9Z" fill="#006DB3" />
    </svg>
  );

  const data = useRouteLoaderData('root') as components['schemas']['YksiloCsrfDto'] | null;
  const competencesSlug = 'slugs.profile.competences';

  const workLink = React.useMemo(
    () => generateProfileLink([competencesSlug, 'slugs.profile.work-history'], data, language, t),
    [data, language, t],
  );
  const educationLink = React.useMemo(
    () => generateProfileLink([competencesSlug, 'slugs.profile.education-history'], data, language, t),
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

  const competenceLinks = (competenceType: string) => {
    switch (competenceType) {
      case 'TOIMENKUVA':
        return workLink.to;
      case 'KOULUTUS':
        return educationLink.to;
      case 'PATEVYYS':
        return freeTimeLink.to;
      case 'MUU_OSAAMINEN':
        return somethingElseLink.to;
      default:
        return '';
    }
  };

  return (
    <>
      <div className="flex flex-row justify-between gap-5">
        <h2 className="my-6 text-heading-2">{t('my-competences-by-sources')}</h2>
        {mobileFilterOpenerComponent}
      </div>
      <div className="mb-10">
        {COMPETENCE_TYPES.map((competence) => {
          return (
            <React.Fragment key={competence}>
              <div className={groupByHeaderClasses}>{t(`my-competences.by-${competence}`)}</div>
              {Array.isArray(filters[competence]) && filters[competence].some((filter) => filter.checked) ? (
                <div>
                  <div className="flex flex-wrap gap-4">
                    {osaamiset.map((val) => {
                      const label = val.osaaminen.nimi[locale] ?? val.osaaminen.uri;
                      const title = val.osaaminen.kuvaus[locale];
                      return (
                        val.lahde.tyyppi === competence &&
                        isOsaaminenVisible(competence, val.lahde.id) && (
                          <Tag
                            label={label}
                            title={title}
                            key={val.id}
                            variant="presentation"
                            sourceType={OSAAMINEN_COLOR_MAP[val.lahde.tyyppi]}
                          />
                        )
                      );
                    })}
                  </div>
                  <Link
                    to={competenceLinks(competence)}
                    key={competence}
                    type="button"
                    className="text-button-md hover:underline px-5 py-3 text-accent mt-3"
                  >
                    <div className="flex flex-row justify-start">
                      <div className="flex items-center gap-3">
                        {t('profile.competences.edit')}
                        <ArrowIcon />
                      </div>
                    </div>
                  </Link>
                </div>
              ) : (
                <Link
                  to={competenceLinks(competence)}
                  key={competence}
                  type="button"
                  className="text-button-md hover:underline px-5 py-3 text-accent"
                >
                  <div className="flex flex-row justify-start">
                    <div className="flex items-center gap-3">
                      {t('profile.competences.add')}
                      <ArrowIcon />
                    </div>
                  </div>
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
};
