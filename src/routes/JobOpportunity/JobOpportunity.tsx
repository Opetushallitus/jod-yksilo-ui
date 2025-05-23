import { CompareCompetencesTable } from '@/components/CompareTable/CompareCompetencesTable';
import JakaumaList from '@/components/JakaumaList/JakaumaList';
import OpportunityDetails, { type OpportunityDetailsSection } from '@/components/OpportunityDetails/OpportunityDetails';
import type { JakaumaKey } from '@/routes/types';
import { useToolStore } from '@/stores/useToolStore';
import { getLocalizedText, hashString } from '@/utils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import type { LoaderData } from './loader';

const JobOpportunity = () => {
  const { t } = useTranslation();
  const { tyomahdollisuus, ammatit, ammattiryhma, osaamiset, isLoggedIn, jakaumat, codesetValues } =
    useLoaderData<LoaderData>();
  const hasAiContent = tyomahdollisuus.aineisto !== 'AMMATTITIETO';

  const toolStore = useToolStore();
  const omatOsaamisetUris = React.useMemo(
    () => toolStore.osaamiset?.map((osaaminen) => osaaminen.id),
    [toolStore.osaamiset],
  );
  const competencesTableData = React.useMemo(
    () => osaamiset.map((competence) => ({ ...competence, profiili: omatOsaamisetUris?.includes(competence.uri) })),
    [osaamiset, omatOsaamisetUris],
  );
  const clusterSize = tyomahdollisuus?.jakaumat?.ammatti?.maara;

  const tyomahdollisuusTehtavat =
    getLocalizedText(tyomahdollisuus?.tehtavat) !== ''
      ? getLocalizedText(tyomahdollisuus?.tehtavat)
          .split('\n')
          .sort((a: string, b: string) => a.localeCompare(b))
      : [];

  const codesetKeys: JakaumaKey[] = ['maa', 'maakunta', 'kunta', 'tyokieli'];
  const booleanKeys: JakaumaKey[] = ['rikosrekisteriote', 'matkustusvaatimus', 'sijaintiJoustava'];
  const codesAsValue: JakaumaKey[] = ['ajokortti', 'kielitaito'];

  const sections: OpportunityDetailsSection[] = [
    {
      navTitle: t('description'),
      hasAiContent,
      content: <p className="text-body-md font-arial">{getLocalizedText(tyomahdollisuus?.kuvaus)}</p>,
    },
    {
      navTitle: t('job-opportunity.most-common-job-tasks.title'),
      hasAiContent,
      content: (
        <ol className="list-decimal ml-7 text-body-lg font-medium text-black leading-7">
          {tyomahdollisuusTehtavat.map((value: string, index: number) => (
            // eslint-disable-next-line react/no-array-index-key
            <li key={`${hashString(value)}-${index}`} className="text-capitalize text-body">
              {value}
            </li>
          ))}
        </ol>
      ),
    },
    {
      navTitle: t('job-opportunity.occupations.title'),
      content: (
        <ol className="list-decimal ml-7 text-body-lg font-medium text-black leading-7">
          {ammatit.map((ammatti) => (
            <li
              className="text-capitalize text-body"
              title={`${ammatti.koodi} ${getLocalizedText(ammatti.kuvaus)} (${ammatti.osuus.toFixed(1)}%, N = ${clusterSize})`}
              key={ammatti.uri}
            >
              {getLocalizedText(ammatti.nimi)}
            </li>
          ))}
        </ol>
      ),
    },
    {
      navTitle: t('job-opportunity.professional-group'),
      content: (
        <ul className="list-none ml-0 text-body-lg font-medium text-black leading-7">
          <li
            className="text-capitalize text-body"
            title={`${ammattiryhma?.uri}\n${(getLocalizedText(ammattiryhma?.kuvaus), 'en')}`}
            key={ammattiryhma?.uri}
          >
            {getLocalizedText(ammattiryhma?.nimi)}
          </li>
        </ul>
      ),
    },
    {
      navTitle: t('job-opportunity.key-figures.title'),
      content: (
        <>
          <p className="text-body-md font-arial mb-6">{t('job-opportunity.key-figures.description')}</p>
          <div className="bg-todo h-[380px]" />
        </>
      ),
      showInDevOnly: true,
    },
    {
      navTitle: t('job-opportunity.labour-market-picture.title'),
      content: (
        <>
          <p className="text-body-md font-arial mb-6">{t('job-opportunity.labour-market-picture.description')}</p>
          <div className="bg-todo h-[380px]" />
        </>
      ),
      showInDevOnly: true,
    },
    {
      navTitle: t('job-opportunity.salary-trends.title'),
      content: (
        <>
          <p className="text-body-md font-arial mb-6">{t('job-opportunity.salary-trends.description')}</p>
          <div className="bg-todo h-[380px]" />
        </>
      ),
      showInDevOnly: true,
    },
    {
      navTitle: t('job-opportunity.competences.title'),
      content: (
        <CompareCompetencesTable
          opportunityName={tyomahdollisuus?.otsikko}
          rows={competencesTableData}
          className="mt-4"
        />
      ),
    },
    {
      navTitle: t('job-opportunity.employment-trends.title'),
      content: (
        <>
          <p className="text-body-md font-arial mb-6">{t('job-opportunity.employment-trends.description')}</p>
          <div className="bg-todo h-[380px]" />
        </>
      ),
      showInDevOnly: true,
    },
    {
      navTitle: t('job-opportunity.related-jobs.title'),
      content: (
        <>
          <p className="text-body-md font-arial mb-6">{t('job-opportunity.related-jobs.description')}</p>
          <div className="bg-todo h-[380px] mb-8" />
        </>
      ),
      showInDevOnly: true,
    },
    {
      navTitle: t('more-information'),
      content: (
        <div className="grid w-full grow grid-cols-2 gap-6">
          {(Object.keys(jakaumat) as JakaumaKey[])
            .filter((key) => !['osaaminen', 'ammatti'].includes(key))
            .map((key) => (
              <JakaumaList
                booleanKeys={booleanKeys}
                codesAsValue={codesAsValue}
                codesetKeys={codesetKeys}
                codesetValues={codesetValues}
                jakaumat={jakaumat}
                key={key}
                name={key}
              />
            ))}
        </div>
      ),
    },
  ];
  return (
    <OpportunityDetails
      data={tyomahdollisuus}
      isLoggedIn={isLoggedIn}
      tyyppi="TYOMAHDOLLISUUS"
      sections={sections}
      showAiInfoInTitle={hasAiContent}
    />
  );
};

export default JobOpportunity;
