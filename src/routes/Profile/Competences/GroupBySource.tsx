import { components } from '@/api/schema';
import { OSAAMINEN_COLOR_MAP } from '@/constants';
import { Tag } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdArrowForward, MdLightbulbOutline, MdOutlineSailing, MdOutlineSchool, MdWorkOutline } from 'react-icons/md';
import { Link, useRouteLoaderData } from 'react-router';
import { generateProfileLink } from '../utils';
import { FILTERS_ORDER, GroupByProps, MobileFilterButton, groupByHeaderClasses } from './constants';

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

  const competenceIcon = (competenceType: string) => {
    switch (competenceType) {
      case 'TOIMENKUVA':
        return <MdWorkOutline color="#AD4298" className="mr-2" />;
      case 'KOULUTUS':
        return <MdOutlineSchool color="#00818A" className="mr-2" />;
      case 'PATEVYYS':
        return <MdOutlineSailing className="text-accent mr-2" />;
      case 'MUU_OSAAMINEN':
        return <MdLightbulbOutline className="text-secondary-gray mr-2" />;
      default:
        return null;
    }
  };

  const competenceLink = (competenceType: string) => {
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
        <h2 className="text-heading-2">{t('my-competences-by-sources')}</h2>
        {mobileFilterOpenerComponent}
      </div>
      <div className="mb-10">
        {FILTERS_ORDER.map((competence) => {
          return (
            <React.Fragment key={competence}>
              <div className={`${groupByHeaderClasses} flex items-center`}>
                {competenceIcon(competence)}
                {t(`my-competences.by-${competence}`)}
              </div>
              {Array.isArray(filters[competence]) && filters[competence].some((filter) => filter.checked) ? (
                <div>
                  <div className="flex flex-wrap gap-4">
                    {osaamiset.map((val) => {
                      const label = val.osaaminen.nimi[locale] ?? val.osaaminen.uri;
                      const title = val.osaaminen.kuvaus[locale];
                      return val.lahde.tyyppi === competence && isOsaaminenVisible(competence, val.lahde.id) ? (
                        <Tag
                          label={label}
                          title={title}
                          key={val.id}
                          variant="presentation"
                          sourceType={OSAAMINEN_COLOR_MAP[val.lahde.tyyppi]}
                        />
                      ) : null;
                    })}
                  </div>
                  <Link
                    to={competenceLink(competence)}
                    key={competence}
                    type="button"
                    className="text-button-md hover:underline text-accent ml-3 mt-5"
                  >
                    <div className="flex flex-row justify-start">
                      <div className="flex items-center gap-2">
                        {t('profile.competences.edit')}
                        <MdArrowForward size={24} />
                      </div>
                    </div>
                  </Link>
                </div>
              ) : (
                <Link
                  to={competenceLink(competence)}
                  key={competence}
                  type="button"
                  className="text-button-md hover:underline text-accent ml-3"
                >
                  <div className="flex flex-row justify-start">
                    <div className="flex items-center gap-2">
                      {t('profile.competences.add')}
                      <MdArrowForward size={24} />
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
