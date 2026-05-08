import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import { useShallow } from 'zustand/shallow';

import { Button, useMediaQueries } from '@jod/design-system';
import { JodOpenInNew } from '@jod/design-system/icons';

import opintopolkuLogo from '@/../assets/opintopolku.svg';
import { CompareCompetencesTable } from '@/components/CompareTable/CompareCompetencesTable';
import { CounselingCard } from '@/components/CounselingCard/CounselingCard';
import { EducationJakaumaList } from '@/components/JakaumaList/JakaumaList';
import OpportunityDetails, { type OpportunityDetailsSection } from '@/components/OpportunityDetails/OpportunityDetails';
import { RateContent } from '@/components/RateContent/RateContent';
import { useEnvironment } from '@/hooks/useEnvironment';
import type { LoaderData } from '@/routes/EducationOpportunity/loader';
import type { JakaumaKey } from '@/routes/types';
import { useIsLoggedIn } from '@/stores/useSessionManagerStore';
import { useToolStore } from '@/stores/useToolStore';
import { getLocalizedText, normalizeMultilineText } from '@/utils';
import { getLinkTo } from '@/utils/routeUtils';

import { OpintopolkuKoulutusList } from './OpintopolkuKoulutusList';
import { getDurationText } from './utils';

const EducationOpportunity = () => {
  const { jakaumat, koulutusmahdollisuus, osaamiset, profiiliKiinnostuksetUris } = useLoaderData<LoaderData>();
  const isLoggedIn = useIsLoggedIn();
  const { kuvaus, kesto, koulutukset } = koulutusmahdollisuus;
  const { sm, lg } = useMediaQueries();
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { isPrd } = useEnvironment();

  const kartoitetutKiinnostuksetUris = useToolStore(
    useShallow((state) =>
      state.kiinnostukset.filter((k) => k.tyyppi === 'KARTOITETTU').map((osaaminen) => osaaminen.id),
    ),
  );

  const competencesTableData = React.useMemo(
    () =>
      osaamiset.map((competence) => ({
        ...competence,
        profiili:
          kartoitetutKiinnostuksetUris.includes(competence.uri) || profiiliKiinnostuksetUris.includes(competence.uri),
        esiintyvyys: koulutusmahdollisuus.jakaumat?.osaaminen?.arvot.find((arvo) => arvo.arvo === competence.uri)
          ?.osuus,
      })),
    [osaamiset, kartoitetutKiinnostuksetUris, profiiliKiinnostuksetUris, koulutusmahdollisuus.jakaumat],
  );

  const title = getLocalizedText(koulutusmahdollisuus.otsikko);
  const opintopolkuUrl = React.useMemo(
    () =>
      new URL(encodeURI(`https://${isPrd ? 'opintopolku.fi' : 'testiopintopolku.fi'}/konfo/${language}/haku/${title}`))
        .href,
    [language, title, isPrd],
  );

  const durationText = getDurationText(kesto);

  const sections: OpportunityDetailsSection[] = [
    {
      navTitle: t('description'),
      showAiInfoInTitle: true,
      showDivider: false,
      content: (
        <p className="font-arial text-body-md whitespace-pre-line">
          {normalizeMultilineText(getLocalizedText(kuvaus))}
        </p>
      ),
    },
    ...(durationText
      ? [
          {
            navTitle: t('duration'),
            showDivider: false,
            content: <p className="font-arial text-body-md">{durationText}</p>,
          } as OpportunityDetailsSection,
        ]
      : []),
    {
      navTitle: t('job-opportunity.competences.title'),
      showAiInfoInTitle: true,
      showDivider: false,
      content: (
        <div className="flex grow flex-col gap-6">
          <span className="font-arial">{t('education-opportunity.competences.description')}</span>
          <CompareCompetencesTable rows={competencesTableData} mode="kiinnostus" />
          {!lg && (
            <RateContent
              variant={koulutusmahdollisuus.tyyppi === 'TUTKINTO' ? 'tutkinto' : 'koulutusmahdollisuus'}
              area="Koulutusmahdollisuus"
            />
          )}
        </div>
      ),
    },
    {
      navTitle: t('education-opportunity.education-characteristics'),
      showNavTitle: false,
      showInDevOnly: false,
      showDivider: sm,
      content: (
        <div className="flex w-full flex-col">
          <div
            className="mb-7 flex flex-col gap-7 bg-white p-6 lg:mb-9"
            data-testid="education-opportunity-statistics-section"
          >
            <h3 className="text-heading-2-mobile sm:text-heading-2">
              {t('education-opportunity.education-characteristics')}
            </h3>
            <div className="grid w-full grow grid-cols-2 gap-6">
              {(Object.keys(jakaumat) as JakaumaKey[])
                .filter((key) => !['osaaminen', 'ammatti', isPrd ? 'kunta' : undefined].includes(key))
                .map((key) => (
                  <EducationJakaumaList key={key} name={key} />
                ))}
            </div>
          </div>
          {!lg && (
            <div className="mb-9">
              <CounselingCard />
            </div>
          )}
        </div>
      ),
    },
    {
      navTitle: t('education-opportunity.open-educations'),
      showDivider: false,
      showNavTitle: false,
      content: (
        <div className="mb-9 flex w-full flex-col" data-testid="education-opportunity-opintopolku-section">
          <div className="mb-7 flex h-9 items-center bg-[#397B0F] pl-4">
            <img src={opintopolkuLogo} alt={t('education-opportunity.opintopolku.banner-alt-text')} className="h-6" />
          </div>
          <h3 className="mb-4 text-heading-2">{t('education-opportunity.opintopolku.title')}</h3>
          <p>{t('education-opportunity.opintopolku.description')}</p>
          <div className="mt-7">
            <Button
              testId="education-opportunity-open-opintopolku"
              size="sm"
              label={t('education-opportunity.opintopolku.button-label')}
              icon={<JodOpenInNew ariaLabel={t('common:external-link')} />}
              iconSide="right"
              linkComponent={getLinkTo(opintopolkuUrl, { useAnchor: true, target: '_blank' })}
            />
          </div>
          <OpintopolkuKoulutusList koulutukset={koulutukset} />
        </div>
      ),
    },
  ];

  return (
    <OpportunityDetails
      data={koulutusmahdollisuus}
      isLoggedIn={isLoggedIn}
      mahdollisuusTyyppi="KOULUTUSMAHDOLLISUUS"
      sections={sections}
      showAiInfoInTitle
    />
  );
};

export default EducationOpportunity;
