import tmtLogo from '@/../assets/tyomarkkinatori.svg';
import { AiInfo } from '@/components';
import { CompareCompetencesTable } from '@/components/CompareTable/CompareCompetencesTable';
import { CounselingBanner } from '@/components/CounselingBanner/CounselingBanner';
import { JobJakaumaList } from '@/components/JakaumaList/JakaumaList';
import OpportunityDetails, { type OpportunityDetailsSection } from '@/components/OpportunityDetails/OpportunityDetails';
import { RateAiContent } from '@/components/RateAiContent/RateAiContent';
import { useToolStore } from '@/stores/useToolStore';
import { formatDate, getLocalizedText, hashString, sortByProperty } from '@/utils';
import { getLinkTo } from '@/utils/routeUtils';
import { Button, useMediaQueries } from '@jod/design-system';
import { JodOpenInNew } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import { useShallow } from 'zustand/shallow';
import type { LoaderData } from './loader';

const JobOpportunity = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { sm } = useMediaQueries();
  const { tyomahdollisuus, osaamiset, isLoggedIn, ammattiryhma } = useLoaderData<LoaderData>();
  const hasAiContent = tyomahdollisuus.aineisto !== 'AMMATTITIETO';
  const omatOsaamisetUris = useToolStore(useShallow((state) => state.osaamiset.map((osaaminen) => osaaminen.id)));
  const competencesTableData = React.useMemo(
    () =>
      osaamiset
        .map((competence) => ({ ...competence, profiili: omatOsaamisetUris?.includes(competence.uri) }))
        .sort(sortByProperty(`nimi.${language}`)),
    [osaamiset, language, omatOsaamisetUris],
  );

  const tyomahdollisuusTehtavat =
    getLocalizedText(tyomahdollisuus?.tehtavat) !== ''
      ? getLocalizedText(tyomahdollisuus?.tehtavat)
          .split('\n')
          .sort((a: string, b: string) => a.localeCompare(b))
      : [];

  const tmtUrl = React.useMemo(() => {
    const url = new URL(t('job-opportunity.tyomarkkinatori.url'));

    if (ammattiryhma?.koodi) {
      url.searchParams.set('in', ammattiryhma.koodi);
    }

    return url.href;
  }, [ammattiryhma?.koodi, t]);

  const sections: OpportunityDetailsSection[] = [
    {
      navTitle: t('description'),
      showDivider: false,
      showAiInfoInTitle: hasAiContent,
      content: <p className="text-body-lg font-arial">{getLocalizedText(tyomahdollisuus?.kuvaus)}</p>,
    },
    {
      navTitle: t('job-opportunity.most-common-job-tasks.title'),
      showDivider: false,
      showAiInfoInTitle: false,
      content: (
        <ul className="list-disc ml-7">
          {tyomahdollisuusTehtavat.map((value: string, index: number) => (
            <li
              // eslint-disable-next-line react/no-array-index-key
              key={`${hashString(value)}-${index}`}
              className="text-capitalize text-body-md font-arial text-primary-gray"
            >
              {value}
            </li>
          ))}
        </ul>
      ),
    },
    {
      navTitle: t('job-opportunity.competences.title'),
      showAiInfoInTitle: hasAiContent,
      content: (
        <div className="flex flex-col gap-6 mb-9 grow">
          <span className="font-arial">{t('job-opportunity.competences.description')}</span>
          <CompareCompetencesTable rows={competencesTableData} />
          {!sm && (
            <>
              <RateAiContent variant="mahdollisuus" area="Työmahdollisuus" />
              <CounselingBanner />
            </>
          )}
        </div>
      ),
    },
    {
      navTitle: t('job-opportunity.professional-group'),
      titleAppendix: getLocalizedText(ammattiryhma?.nimi),
      content: <div className="font-arial">{getLocalizedText(ammattiryhma?.kuvaus)}</div>,
      showDivider: false,
    },
    {
      navTitle: t('job-opportunity.salary-data.title'),
      showDivider: false,
      showNavTitle: false,
      showAiInfoInTitle: false,
      content: (
        <div className="bg-white p-6">
          <div className="flex items-center">
            <h3 className="text-heading-3">{t('job-opportunity.salary-data.title')}</h3>
          </div>

          {tyomahdollisuus?.palkkatiedot ? (
            <>
              <p className="text-secondary-gray">
                {formatDate(new Date(tyomahdollisuus?.palkkatiedot?.tiedotHaettu), 'medium')}
              </p>

              <div className="flex justify-around text-center gap-11 my-8">
                <div>
                  <h2 className="font-bold text-heading-1">
                    {tyomahdollisuus?.palkkatiedot?.alinDesiiliPalkka || '--'} €
                  </h2>
                  <p className="mb-1 text-secondary-gray">{t('job-opportunity.salary-data.lowest-decile')}</p>
                </div>

                <div>
                  <h2 className="font-bold text-heading-1">
                    {tyomahdollisuus?.palkkatiedot?.mediaaniPalkka || '--'} €
                  </h2>
                  <p className="mb-1 text-secondary-gray">{t('job-opportunity.salary-data.median')}</p>
                </div>

                <div>
                  <h2 className="font-bold text-heading-1">
                    {tyomahdollisuus?.palkkatiedot?.ylinDesiiliPalkka || '--'} €
                  </h2>
                  <p className="mb-1 text-secondary-gray">{t('job-opportunity.salary-data.highest-decile')}</p>
                </div>
              </div>

              <p className="m-0 text-secondary-gray">{t('job-opportunity.salary-data.description')}</p>
            </>
          ) : (
            <p className="text-secondary-gray">{t('job-opportunity.salary-data.not-available')}</p>
          )}
        </div>
      ),
    },
    {
      navTitle: t('job-opportunity.job-advertisement-characteristics'),
      showNavTitle: false,
      content: (
        <div className="bg-white p-6 flex flex-col gap-6 mb-9">
          <div className="flex items-center gap-4">
            <h3 className="text-heading-3">{t('job-opportunity.job-advertisement-characteristics')}</h3>
            <AiInfo />
          </div>
          <p className="font-arial">{t('job-opportunity.job-advertisement-characteristics-description')}</p>

          <div className="grid w-full grow grid-cols-2 gap-7">
            <JobJakaumaList name="tyonJatkuvuus" />
            <JobJakaumaList name="kielitaito" />
            <JobJakaumaList name="koulutusala" />
            <JobJakaumaList name="ajokortti" />
            <JobJakaumaList name="rikosrekisteriote" />
          </div>
        </div>
      ),
    },
    {
      navTitle: t('job-opportunity.open-jobs'),
      showNavTitle: false,
      content: (
        <div className="flex flex-col w-full mb-9" data-testid="job-opportunity-tmt-section">
          <div className="bg-[#442496] h-9 flex items-center pl-4 mb-7">
            <img src={tmtLogo} alt={t('job-opportunity.tyomarkkinatori.banner-alt-text')} className="h-7" />
          </div>
          <h3 className="text-heading-2 mb-4">{t('job-opportunity.tyomarkkinatori.title')}</h3>
          <p>{t('job-opportunity.tyomarkkinatori.description')}</p>
          <Button
            data-testid="job-opportunity-open-tyomarkkinatori"
            size="sm"
            className="w-fit mt-7"
            label={t('job-opportunity.tyomarkkinatori.button-label')}
            icon={<JodOpenInNew />}
            iconSide="right"
            LinkComponent={getLinkTo(tmtUrl, { useAnchor: true, target: '_blank' })}
          />
        </div>
      ),
    },
  ];
  return (
    <OpportunityDetails data={tyomahdollisuus} isLoggedIn={isLoggedIn} tyyppi="TYOMAHDOLLISUUS" sections={sections} />
  );
};

export default JobOpportunity;
