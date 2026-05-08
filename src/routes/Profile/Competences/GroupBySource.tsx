import React from 'react';
import { useTranslation } from 'react-i18next';

import { Accordion, Button, EmptyState, Tag } from '@jod/design-system';
import { JodArrowRight } from '@jod/design-system/icons';

import { OSAAMINEN_COLOR_MAP } from '@/constants';
import { useArrowKeyControls } from '@/hooks/useArrowKeyControls';
import { useShowSessionExpiredDialog } from '@/hooks/useShowSessionExpiredDialog';
import { useIsSessionExpired, useYksiloProfileLinkData } from '@/stores/useSessionManagerStore';
import { removeDuplicatesByKey } from '@/utils';
import { getLinkTo } from '@/utils/routeUtils';

import { generateProfileLink, getTextClassByCompetenceSourceType } from '../utils';
import { type CompetenceSourceType, FILTERS_ORDER, type GroupByProps, type MobileFilterButton } from './constants';

interface SourceSectionProps extends Omit<GroupByProps, 'filterKeys'> {
  sourceType: Exclude<CompetenceSourceType, 'KIINNOSTUS'>;
}
const SourceSection = ({ sourceType, osaamiset, filters, locale, isOsaaminenVisible }: SourceSectionProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const profileLinkData = useYksiloProfileLinkData();
  const competencesSlug = t('slugs.profile.competences');
  const isSessionExpired = useIsSessionExpired();
  const showSessionExpiredDialog = useShowSessionExpiredDialog();

  // Remove duplicate osaamiset per lähdetyyppi
  const nonDuplicateOsaamiset = React.useMemo(() => {
    return removeDuplicatesByKey(osaamiset, (o) => o.osaaminen.uri + o.lahde.tyyppi);
  }, [osaamiset]);

  const links = React.useMemo(
    () => ({
      TOIMENKUVA: generateProfileLink([competencesSlug, t('slugs.profile.work-history')], profileLinkData, language, t)
        .to,
      KOULUTUS: generateProfileLink(
        [competencesSlug, t('slugs.profile.education-history')],
        profileLinkData,
        language,
        t,
      ).to,
      PATEVYYS: generateProfileLink(
        [competencesSlug, t('slugs.profile.free-time-activities')],
        profileLinkData,
        language,
        t,
      ).to,
      MUU_OSAAMINEN: generateProfileLink(
        [competencesSlug, t('slugs.profile.something-else')],
        profileLinkData,
        language,
        t,
      ).to,
      KIINNOSTUS: undefined,
    }),
    [competencesSlug, profileLinkData, language, t],
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

  const getLinkButton = (competence: CompetenceSourceType) => {
    const link = competence && links[competence];

    if (!link) {
      return null;
    }

    const buttonActionProps = isSessionExpired
      ? {
          onClick: showSessionExpiredDialog,
        }
      : {
          linkComponent: getLinkTo(link),
        };

    return (
      <Button
        {...buttonActionProps}
        key={competence}
        label={linkLabels[competence]}
        icon={<JodArrowRight />}
        iconSide="right"
        variant="white"
        size="sm"
        className="w-fit"
        data-testid={`competences-move-to-${competence.toLowerCase()}`}
      />
    );
  };

  const { ref, handleKeyDown } = useArrowKeyControls(nonDuplicateOsaamiset);

  return (
    <div key={sourceType} className="mb-11 flex flex-col">
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
              <ul className="flex flex-wrap gap-4" ref={ref} onKeyDown={handleKeyDown}>
                {nonDuplicateOsaamiset.map((val) => {
                  const label = val.osaaminen.nimi[locale] ?? val.osaaminen.uri;
                  const tooltip = val.osaaminen.kuvaus[locale];
                  return val.lahde.tyyppi === sourceType && isOsaaminenVisible(sourceType, val.lahde.id) ? (
                    <li key={val.id} className="max-w-full">
                      <Tag
                        label={label}
                        tooltip={tooltip}
                        screenReaderTooltip={t('description-for', { description: tooltip })}
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
};

export const GroupBySource = ({
  filters,
  locale,
  osaamiset,
  isOsaaminenVisible,
  mobileFilterOpenerComponent,
}: GroupByProps & MobileFilterButton) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="mb-7 flex flex-row justify-between gap-5">
        <h2 className="text-heading-2-mobile sm:text-heading-2">{t('my-competences-by-sources')}</h2>
        {mobileFilterOpenerComponent}
      </div>

      {FILTERS_ORDER.filter((f) => f !== 'KIINNOSTUS').map((sourceType) => {
        return (
          <SourceSection
            key={sourceType}
            sourceType={sourceType}
            osaamiset={osaamiset}
            filters={filters}
            locale={locale}
            isOsaaminenVisible={isOsaaminenVisible}
          />
        );
      })}
    </>
  );
};
