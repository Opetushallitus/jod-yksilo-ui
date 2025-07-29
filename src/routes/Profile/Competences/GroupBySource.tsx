import { components } from '@/api/schema';
import { OSAAMINEN_COLOR_MAP } from '@/constants';
import { getLocalizedText } from '@/utils';
import { EmptyState, Tag } from '@jod/design-system';
import { JodArrowRight, JodInterests, JodOther, JodSkills, JodWork } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useRouteLoaderData } from 'react-router';
import { generateProfileLink } from '../utils';
import { FILTERS_ORDER, GroupByProps, MobileFilterButton, groupByHeaderClasses } from './constants';

export const GroupBySource = ({
  filters,
  locale,
  osaamiset,
  muutOsaamisetVapaateksti,
  isOsaaminenVisible,
  mobileFilterOpenerComponent,
}: GroupByProps &
  MobileFilterButton & {
    muutOsaamisetVapaateksti?: components['schemas']['LokalisoituTeksti'];
  }) => {
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
        return <JodWork size={20} color="#AD4298" className="mr-2" />;
      case 'KOULUTUS':
        return <JodSkills size={20} color="#00818A" className="mr-2" />;
      case 'PATEVYYS':
        return <JodInterests size={20} className="text-accent mr-2" />;
      case 'MUU_OSAAMINEN':
        return <JodOther size={20} className="text-secondary-gray mr-2" />;
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

  const localizedMuutOsaamisetVapaateksti = getLocalizedText(muutOsaamisetVapaateksti);
  const [localizedMuutOsaamisetVapaatekstiExpanded, setLocalizedMuutOsaamisetVapaatekstiExpanded] =
    React.useState(false);
  const localizedMuutOsaamisetVapaatekstiMaxLength = 180;
  const shouldShowExpandButton = localizedMuutOsaamisetVapaateksti.length > localizedMuutOsaamisetVapaatekstiMaxLength;

  // Helper to truncate text
  const getTruncatedText = (text: string, maxLength = localizedMuutOsaamisetVapaatekstiMaxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
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

              {(Array.isArray(filters[competence]) || localizedMuutOsaamisetVapaateksti.length > 0) &&
              filters[competence].some((filter) => filter.checked) ? (
                <div>
                  <div className="flex flex-col gap-7">
                    {osaamiset.filter(
                      (val) => val.lahde.tyyppi === competence && isOsaaminenVisible(competence, val.lahde.id),
                    ).length > 0 && (
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
                    )}
                    {competence === 'MUU_OSAAMINEN' && localizedMuutOsaamisetVapaateksti.length > 0 && (
                      <div className="flex flex-col bg-white px-5 py-4 rounded gap-3 border-2 border-[#CCC]">
                        <p className="text-help">{t('profile.something-else.free-form-description-of-my-interests')}</p>
                        <p className="text-body-sm whitespace-pre-line">
                          {localizedMuutOsaamisetVapaatekstiExpanded
                            ? localizedMuutOsaamisetVapaateksti
                            : getTruncatedText(localizedMuutOsaamisetVapaateksti)}
                        </p>
                        {shouldShowExpandButton && (
                          <div>
                            <button
                              onClick={() =>
                                setLocalizedMuutOsaamisetVapaatekstiExpanded((currentState) => !currentState)
                              }
                              className="text-body-sm text-accent hover:underline hover:cursor-pointer"
                            >
                              {localizedMuutOsaamisetVapaatekstiExpanded ? t('show-less') : t('show-more')}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
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
                        <JodArrowRight />
                      </div>
                    </div>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mt-6 mb-7">
                    <EmptyState text={t(`my-competences.missing-${competence}`)} />
                  </div>

                  <Link
                    to={competenceLink(competence)}
                    key={competence}
                    type="button"
                    className="text-button-md hover:underline text-accent ml-3"
                  >
                    <div className="flex flex-row justify-start">
                      <div className="flex items-center gap-2">
                        {t('profile.competences.add')}
                        <JodArrowRight />
                      </div>
                    </div>
                  </Link>
                </>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
};
