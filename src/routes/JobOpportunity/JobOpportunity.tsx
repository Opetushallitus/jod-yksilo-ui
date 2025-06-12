import { AiInfo } from '@/components';
import { CompareCompetencesTable } from '@/components/CompareTable/CompareCompetencesTable';
import { JobJakaumaList } from '@/components/JakaumaList/JakaumaList';
import OpportunityDetails, { type OpportunityDetailsSection } from '@/components/OpportunityDetails/OpportunityDetails';
import { useToolStore } from '@/stores/useToolStore';
import { getLocalizedText, hashString, sortByProperty } from '@/utils';
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
  const { tyomahdollisuus, osaamiset, isLoggedIn } = useLoaderData<LoaderData>();
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

  const sections: OpportunityDetailsSection[] = [
    {
      navTitle: t('description'),
      titleAppendix: getLocalizedText(tyomahdollisuus.otsikko),
      showDivider: false,
      showAiRating: false,
      showAiInfoInTitle: hasAiContent,
      content: <p className="text-body-lg font-arial">{getLocalizedText(tyomahdollisuus?.kuvaus)}</p>,
    },
    {
      navTitle: t('job-opportunity.most-common-job-tasks.title'),
      showAiInfoInTitle: false,
      showAiRating: true,
      content: (
        <ul className="list-disc ml-7 text-body-lg text-black">
          {tyomahdollisuusTehtavat.map((value: string, index: number) => (
            // eslint-disable-next-line react/no-array-index-key
            <li key={`${hashString(value)}-${index}`} className="text-capitalize text-body">
              {value}
            </li>
          ))}
        </ul>
      ),
    },
    {
      navTitle: t('job-opportunity.competences.title'),
      titleAppendix: getLocalizedText(tyomahdollisuus.otsikko),
      showAiInfoInTitle: hasAiContent,
      showAiRating: true,
      content: <CompareCompetencesTable rows={competencesTableData} className="mt-4" />,
    },
    {
      navTitle: t('job-opportunity.more-information'),
      showNavTitle: true,
      showDivider: false,
      showAiRating: true,
      content: (
        <div className="bg-white p-6 flex flex-col gap-6">
          <div className="flex justify-between">
            <h3 className="text-heading-3">{t('job-opportunity.special-characteristics-from-tyomarkkinatori')}:</h3>
            <div className="pl-7">
              <AiInfo />
            </div>
          </div>
          <p>{t('job-opportunity.special-characteristics-from-tyomarkkinatori-description')}</p>

          <div className="grid w-full grow grid-cols-2 gap-6">
            <JobJakaumaList name="tyonJatkuvuus" />
            <JobJakaumaList name="kielitaito" />
            <JobJakaumaList name="koulutusala" />
            <JobJakaumaList name="ajokortti" />
            <JobJakaumaList name="rikosrekisteriote" />
          </div>
        </div>
      ),
    },
  ];
  return (
    <OpportunityDetails data={tyomahdollisuus} isLoggedIn={isLoggedIn} tyyppi="TYOMAHDOLLISUUS" sections={sections} />
  );
};

export default JobOpportunity;
