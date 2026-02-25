import type { components } from '@/api/schema';
import { OSAAMINEN_COLOR_MAP } from '@/constants';
import { removeDuplicatesByKey } from '@/utils';
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
  isOsaaminenVisible,
  mobileFilterOpenerComponent,
}: GroupByProps & MobileFilterButton) => {
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
              {Array.isArray(filters[sourceType]) && filters[sourceType].some((filter) => filter.checked) ? (
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
