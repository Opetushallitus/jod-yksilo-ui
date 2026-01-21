import type { components } from '@/api/schema';
import { OSAAMINEN_COLOR_MAP } from '@/constants';
import { getLocalizedText, removeDuplicatesByKey } from '@/utils';
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
  const competencesSlug = t('slugs.profile.competences');

  // Remove duplicate osaamiset per lähdetyyppi
  const nonDuplicateOsaamiset = React.useMemo(() => {
    return removeDuplicatesByKey(osaamiset, (o) => o.osaaminen.uri + o.lahde.tyyppi);
  }, [osaamiset]);

  const links = React.useMemo(
    () => ({
      TOIMENKUVA: generateProfileLink([competencesSlug, t('slugs.profile.work-history')], data, language, t).to,
      KOULUTUS: generateProfileLink([competencesSlug, t('slugs.profile.education-history')], data, language, t).to,
      PATEVYYS: generateProfileLink([competencesSlug, t('slugs.profile.free-time-activities')], data, language, t).to,
      MUU_OSAAMINEN: generateProfileLink([competencesSlug, t('slugs.profile.something-else')], data, language, t).to,
      KIINNOSTUS: undefined,
    }),
    [competencesSlug, data, language, t],
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

  const linkLabels: Record<CompetenceSourceType, string> = {
    TOIMENKUVA: t('profile.competences.move-to-type.TOIMENKUVA'),
    KOULUTUS: t('profile.competences.move-to-type.KOULUTUS'),
    PATEVYYS: t('profile.competences.move-to-type.PATEVYYS'),
    MUU_OSAAMINEN: t('profile.competences.move-to-type.MUU_OSAAMINEN'),
    KIINNOSTUS: '',
  };

  const accordionLabels: Record<CompetenceSourceType, string> = {
    TOIMENKUVA: t('my-competences.by-TOIMENKUVA'),
    KOULUTUS: t('my-competences.by-KOULUTUS'),
    PATEVYYS: t('my-competences.by-PATEVYYS'),
    MUU_OSAAMINEN: t('my-competences.by-MUU_OSAAMINEN'),
    KIINNOSTUS: '',
  };

  const emptyStateLabels: Record<CompetenceSourceType, string> = {
    TOIMENKUVA: t('my-competences.missing-TOIMENKUVA'),
    KOULUTUS: t('my-competences.missing-KOULUTUS'),
    PATEVYYS: t('my-competences.missing-PATEVYYS'),
    MUU_OSAAMINEN: t('my-competences.missing-MUU_OSAAMINEN'),
    KIINNOSTUS: '',
  };

  const getLinkButton = (competence: CompetenceSourceType) =>
    competence && links[competence] ? (
      <Button
        linkComponent={getLinkTo(links[competence])}
        key={competence}
        label={linkLabels[competence]}
        icon={<JodArrowRight />}
        iconSide="right"
        variant="white"
        size="sm"
        className="w-fit"
        data-testid={`competences-move-to-${competence.toLowerCase()}`}
      />
    ) : null;

  return (
    <>
      <div className="flex flex-row justify-between gap-5 mb-7">
        <h2 className="text-heading-2">{t('my-competences-by-sources')}</h2>
        {mobileFilterOpenerComponent}
      </div>

      {FILTERS_ORDER.filter((f) => f !== 'KIINNOSTUS').map((sourceType) => {
        return (
          <div key={sourceType} className="flex flex-col mb-11">
            <Accordion
              underline
              title={
                <div className={`truncate text-heading-3 ${getTextClassByCompetenceSourceType(sourceType)}`}>
                  {accordionLabels[sourceType]}
                </div>
              }
              ariaLabel={accordionLabels[sourceType]}
            >
              {(Array.isArray(filters[sourceType]) || localizedMuutOsaamisetVapaateksti.length > 0) &&
              filters[sourceType].some((filter) => filter.checked) ? (
                <div className="mt-5 flex flex-col gap-7">
                  {nonDuplicateOsaamiset.some(
                    (val) => val.lahde.tyyppi === sourceType && isOsaaminenVisible(sourceType, val.lahde.id),
                  ) && (
                    <ul className="flex flex-wrap gap-4">
                      {nonDuplicateOsaamiset.map((val) => {
                        const label = val.osaaminen.nimi[locale] ?? val.osaaminen.uri;
                        const tooltip = val.osaaminen.kuvaus[locale];
                        return val.lahde.tyyppi === sourceType && isOsaaminenVisible(sourceType, val.lahde.id) ? (
                          <li key={val.id} className="max-w-full">
                            <Tag
                              label={label}
                              tooltip={tooltip}
                              variant="presentation"
                              sourceType={OSAAMINEN_COLOR_MAP[val.lahde.tyyppi]}
                            />
                          </li>
                        ) : null;
                      })}
                    </ul>
                  )}
                  {sourceType === 'MUU_OSAAMINEN' && localizedMuutOsaamisetVapaateksti.length > 0 && (
                    <div>
                      <label className="ds:inline-block ds:mb-4 ds:align-top ds:text-form-label ds:font-arial ds:text-primary-gray">
                        {t('profile.something-else.free-form-description-of-my-interests')}
                      </label>
                      <div className="flex flex-col bg-white px-5 py-4 rounded gap-3 border-2 border-primary-light-2">
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
                              data-testid="competences-freeform-toggle"
                            >
                              {localizedMuutOsaamisetVapaatekstiExpanded ? t('show-less') : t('show-more')}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {getLinkButton(sourceType)}
                </div>
              ) : (
                <>
                  <div className="mt-6 mb-7">
                    <EmptyState text={emptyStateLabels[sourceType]} />
                  </div>

                  <div className="mt-5">{getLinkButton(sourceType)}</div>
                </>
              )}
            </Accordion>
          </div>
        );
      })}
    </>
  );
};
