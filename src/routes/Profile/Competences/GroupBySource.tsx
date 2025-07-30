import type { components } from '@/api/schema';
import { OSAAMINEN_COLOR_MAP } from '@/constants';
import { getLocalizedText } from '@/utils';
import { getLinkTo } from '@/utils/routeUtils';
import { Accordion, Button, EmptyState, Tag } from '@jod/design-system';
import { JodArrowRight } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteLoaderData } from 'react-router';
import { generateProfileLink, getTextClassByCompetenceSourceType } from '../utils';
import { type CompetenceSourceType, FILTERS_ORDER, type GroupByProps, MobileFilterButton } from './constants';

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

  const links = React.useMemo(
    () => ({
      TOIMENKUVA: generateProfileLink([competencesSlug, 'slugs.profile.work-history'], data, language, t).to,
      KOULUTUS: generateProfileLink([competencesSlug, 'slugs.profile.education-history'], data, language, t).to,
      PATEVYYS: generateProfileLink([competencesSlug, 'slugs.profile.free-time-activities'], data, language, t).to,
      MUU_OSAAMINEN: generateProfileLink([competencesSlug, 'slugs.profile.something-else'], data, language, t).to,
    }),
    [data, language, t],
  );

  const localizedMuutOsaamisetVapaateksti = getLocalizedText(muutOsaamisetVapaateksti);
  const [localizedMuutOsaamisetVapaatekstiExpanded, setLocalizedMuutOsaamisetVapaatekstiExpanded] =
    React.useState(false);
  const localizedMuutOsaamisetVapaatekstiMaxLength = 180;
  const shouldShowExpandButton = localizedMuutOsaamisetVapaateksti.length > localizedMuutOsaamisetVapaatekstiMaxLength;

  // Helper to truncate text
  const getTruncatedText = (text: string, maxLength = localizedMuutOsaamisetVapaatekstiMaxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '…';
  };

  const getLinkButton = (competence: CompetenceSourceType) => (
    <Button
      LinkComponent={getLinkTo(links[competence])}
      key={competence}
      label={t(`profile.competences.move-to-type.${competence}`)}
      icon={<JodArrowRight />}
      iconSide="right"
      variant="white"
      size="sm"
    />
  );

  return (
    <>
      <div className="flex flex-row justify-between gap-5 mb-7">
        <h2 className="text-heading-2">{t('my-competences-by-sources')}</h2>
        {mobileFilterOpenerComponent}
      </div>

      {FILTERS_ORDER.map((competence) => {
        return (
          <div key={competence} className="flex flex-col mb-11">
            <Accordion
              lang={language}
              underline
              title={
                <div className={`truncate text-heading-3 ${getTextClassByCompetenceSourceType(competence)}`}>
                  {t(`my-competences.by-${competence}`)}
                </div>
              }
              titleText=""
            >
              {(Array.isArray(filters[competence]) || localizedMuutOsaamisetVapaateksti.length > 0) &&
              filters[competence].some((filter) => filter.checked) ? (
                <div className="mt-5 flex flex-col gap-7">
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
                  {getLinkButton(competence)}
                </div>
              ) : (
                <>
                  <div className="mt-6 mb-7">
                    <EmptyState text={t(`my-competences.missing-${competence}`)} />
                  </div>

                  <div className="mt-5">{getLinkButton(competence)}</div>
                </>
              )}
            </Accordion>
          </div>
        );
      })}
    </>
  );
};
