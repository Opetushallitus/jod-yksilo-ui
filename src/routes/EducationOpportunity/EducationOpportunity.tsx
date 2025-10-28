import opintopolkuLogo from '@/../assets/opintopolku.svg';
import { CompareCompetencesTable } from '@/components/CompareTable/CompareCompetencesTable';
import { EducationJakaumaList } from '@/components/JakaumaList/JakaumaList';
import OpportunityDetails, { type OpportunityDetailsSection } from '@/components/OpportunityDetails/OpportunityDetails';
import { RateAiContent } from '@/components/RateAiContent/RateAiContent';
import type { LoaderData } from '@/routes/EducationOpportunity/loader';
import type { JakaumaKey } from '@/routes/types';
import { useToolStore } from '@/stores/useToolStore';
import { getLocalizedText, sortByProperty } from '@/utils';
import { getLinkTo } from '@/utils/routeUtils';
import { Button, useMediaQueries } from '@jod/design-system';
import { JodOpenInNew } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import { useShallow } from 'zustand/shallow';

const EducationOpportunity = () => {
  const { jakaumat, koulutusmahdollisuus, osaamiset, isLoggedIn } = useLoaderData<LoaderData>();
  const { kuvaus, kesto } = koulutusmahdollisuus;
  const { sm } = useMediaQueries();
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const duration = React.useMemo(() => {
    if (!kesto?.mediaani || kesto.mediaani === 0) {
      return null;
    }

    return kesto?.mediaani < 12
      ? t('education-opportunity.duration.average-months', { count: kesto.mediaani })
      : t('education-opportunity.duration.average-years', { count: Math.round(kesto.mediaani / 12) });
  }, [kesto?.mediaani, t]);

  const kartoitetutKiinnostuksetUris = useToolStore(
    useShallow((state) =>
      state.kiinnostukset.filter((k) => k.tyyppi === 'KARTOITETTU').map((osaaminen) => osaaminen.id),
    ),
  );
  const competencesTableData = React.useMemo(
    () =>
      osaamiset
        .map((competence) => ({ ...competence, profiili: kartoitetutKiinnostuksetUris?.includes(competence.uri) }))
        .sort(sortByProperty(`nimi.${language}`)),
    [osaamiset, language, kartoitetutKiinnostuksetUris],
  );

  const title = getLocalizedText(koulutusmahdollisuus.otsikko);
  const opintopolkuUrl = React.useMemo(
    () => new URL(encodeURI(`https://opintopolku.fi/konfo/${language}/haku/${title}`)).href,
    [language, title],
  );

  const sections: OpportunityDetailsSection[] = [
    {
      navTitle: t('description'),
      showAiInfoInTitle: true,
      showDivider: false,
      content: <p className="text-body-md font-arial">{getLocalizedText(kuvaus)}</p>,
    },
    ...(duration
      ? [
          {
            navTitle: t('duration'),
            showDivider: false,
            content: <p className="text-body-md font-arial">{duration}</p>,
          } as OpportunityDetailsSection,
        ]
      : []),
    {
      navTitle: t('job-opportunity.competences.title'),
      showAiInfoInTitle: true,
      showDivider: false,
      content: (
        <div className="flex flex-col gap-6 grow">
          <span className="font-arial">{t('education-opportunity.competences.description')}</span>
          <CompareCompetencesTable rows={competencesTableData} mode="kiinnostus" />
          {!sm && <RateAiContent variant="koulutusmahdollisuus" area="Koulutusmahdollisuus" />}
        </div>
      ),
    },
    {
      navTitle: t('education-opportunity.education-characteristics'),
      showNavTitle: false,
      showInDevOnly: false,
      showDivider: sm,
      content: (
        <div className="bg-white p-6 flex flex-col gap-7 mb-8">
          <h3 className="sm:text-heading-2 text-heading-2-mobile">
            {t('education-opportunity.education-characteristics')}
          </h3>
          <div className="grid w-full grow grid-cols-2 gap-6">
            {(Object.keys(jakaumat) as JakaumaKey[])
              .filter((key) => !['osaaminen', 'ammatti'].includes(key))
              .map((key) => (
                <EducationJakaumaList key={key} name={key} />
              ))}
          </div>
        </div>
      ),
    },
    {
      navTitle: t('education-opportunity.open-educations'),
      showNavTitle: false,
      content: (
        <div className="flex flex-col w-full mb-9" data-testid="education-opportunity-opintopolku-section">
          <div className="bg-[#397B0F] h-9 flex items-center pl-4 mb-7">
            <img src={opintopolkuLogo} alt={t('education-opportunity.opintopolku.banner-alt-text')} className="h-6" />
          </div>
          <h3 className="text-heading-2 mb-4">{t('education-opportunity.opintopolku.title')}</h3>
          <p>{t('education-opportunity.opintopolku.description')}</p>
          <div className="mt-7">
            <Button
              data-testid="education-opportunity-open-opintopolku"
              size="sm"
              label={t('education-opportunity.opintopolku.button-label')}
              icon={<JodOpenInNew ariaLabel={t('external-link')} />}
              iconSide="right"
              LinkComponent={getLinkTo(opintopolkuUrl, { useAnchor: true, target: '_blank' })}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <OpportunityDetails
      data={koulutusmahdollisuus}
      isLoggedIn={isLoggedIn}
      tyyppi="KOULUTUSMAHDOLLISUUS"
      sections={sections}
      showAiInfoInTitle
    />
  );
};

export default EducationOpportunity;
