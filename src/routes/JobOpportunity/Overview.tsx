import { MainLayout, RoutesNavigationList, RoutesNavigationListProps, SimpleNavigationList, Title } from '@/components';
import { CompareCompetencesTable } from '@/components/CompareTable/CompareCompetencesTable';
import { useToolStore } from '@/stores/useToolStore';
import { getLocalizedText } from '@/utils';
import { Accordion } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import Tabs from './Tabs';
import { LoaderData } from './loader';

const Overview = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { tyomahdollisuus, ammatit, osaamiset } = useOutletContext<LoaderData>();
  const toolStore = useToolStore();
  const title = getLocalizedText(tyomahdollisuus?.otsikko);
  const omatOsaamisetUris = React.useMemo(
    () => toolStore.osaamiset?.map((osaaminen) => osaaminen.id),
    [toolStore.osaamiset],
  );
  const competencesTableData = React.useMemo(
    () => osaamiset.map((competence) => ({ ...competence, profiili: omatOsaamisetUris?.includes(competence.uri) })),
    [osaamiset, omatOsaamisetUris],
  );
  const clusterSize = tyomahdollisuus?.jakaumat?.ammatti?.maara;
  const routes: RoutesNavigationListProps['routes'] = [
    {
      active: false,
      name: t('job-opportunity.description'),
      path: `#${t('job-opportunity.description')}`,
      replace: true,
    },
    {
      active: false,
      name: t('job-opportunity.most-common-job-tasks.title'),
      path: `#${t('job-opportunity.most-common-job-tasks.title')}`,
      replace: true,
    },
    {
      active: false,
      name: t('job-opportunity.key-figures.title'),
      path: `#${t('job-opportunity.key-figures.title')}`,
      replace: true,
    },
    {
      active: false,
      name: t('job-opportunity.labour-market-picture.title'),
      path: `#${t('job-opportunity.labour-market-picture.title')}`,
      replace: true,
    },
    {
      active: false,
      name: t('job-opportunity.salary-trends.title'),
      path: `#${t('job-opportunity.salary-trends.title')}`,
      replace: true,
    },
    {
      active: false,
      name: t('job-opportunity.competences.title'),
      path: `#${t('job-opportunity.competences.title')}`,
      replace: true,
    },
    {
      active: false,
      name: t('job-opportunity.employment-trends.title'),
      path: `#${t('job-opportunity.employment-trends.title')}`,
      replace: true,
    },
    {
      active: false,
      name: t('job-opportunity.related-jobs.title'),
      path: `#${t('job-opportunity.related-jobs.title')}`,
      replace: true,
    },
  ];

  return (
    <MainLayout
      navChildren={
        <SimpleNavigationList title={t('job-opportunity.overview.navigation')} collapsible>
          <RoutesNavigationList routes={routes} />
        </SimpleNavigationList>
      }
    >
      <Title value={title ?? ''} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <Tabs />
      <div className="flex flex-col gap-11">
        <div>
          <Accordion
            title={
              <h2 id={t('job-opportunity.description')} className="text-heading-3 scroll-mt-[96px]">
                {t('job-opportunity.description')}
              </h2>
            }
            titleText={t('job-opportunity.description')}
            lang={language}
          >
            <p className="text-body-sm font-arial mt-4">{getLocalizedText(tyomahdollisuus?.kuvaus)}</p>
          </Accordion>
        </div>
        <div>
          <Accordion
            title={
              <h2 id={t('job-opportunity.most-common-job-tasks.title')} className="text-heading-3 scroll-mt-[96px]">
                {t('job-opportunity.most-common-job-tasks.title')}
              </h2>
            }
            titleText={t('job-opportunity.most-common-job-tasks.title')}
            lang={language}
          >
            <p className="text-body-sm font-arial mt-4 mb-4">
              {t('job-opportunity.most-common-job-tasks.description')}
            </p>
            <ol className="list-decimal ml-7 font-bold text-black leading-7">
              {ammatit.map((ammatti) => (
                <li
                  className="text-capitalize"
                  title={`${ammatti.koodi} ${getLocalizedText(ammatti.kuvaus)} (${ammatti.osuus.toFixed(1)}%, N = ${clusterSize})`}
                  key={ammatti.uri}
                >
                  {getLocalizedText(ammatti.nimi)}
                </li>
              ))}
            </ol>
          </Accordion>
        </div>
        <div>
          <Accordion
            title={
              <h2 id={t('job-opportunity.key-figures.title')} className="text-heading-3 scroll-mt-[96px]">
                {t('job-opportunity.key-figures.title')}
              </h2>
            }
            titleText={t('job-opportunity.key-figures.title')}
            lang={language}
          >
            <p className="text-body-sm font-arial mb-6 mt-4">{t('job-opportunity.key-figures.description')}</p>
            <div className="bg-todo h-[380px]" />
          </Accordion>
        </div>
        <div>
          <Accordion
            title={
              <h2 id={t('job-opportunity.labour-market-picture.title')} className="text-heading-3 scroll-mt-[96px]">
                {t('job-opportunity.labour-market-picture.title')}
              </h2>
            }
            titleText={t('job-opportunity.labour-market-picture.title')}
            lang={language}
          >
            <p className="text-body-sm font-arial mb-6 mt-4">
              {t('job-opportunity.labour-market-picture.description')}
            </p>
            <div className="bg-todo h-[380px]" />
          </Accordion>
        </div>
        <div>
          <Accordion
            title={
              <h2 id={t('job-opportunity.salary-trends.title')} className="text-heading-3 scroll-mt-[96px]">
                {t('job-opportunity.salary-trends.title')}
              </h2>
            }
            titleText={t('job-opportunity.salary-trends.title')}
            lang={language}
          >
            <p className="text-body-sm font-arial mb-6 mt-4">{t('job-opportunity.salary-trends.description')}</p>
            <div className="bg-todo h-[380px]" />
          </Accordion>
        </div>
        <div>
          <Accordion
            title={
              <h2 id={t('job-opportunity.competences.title')} className="text-heading-3 scroll-mt-[96px]">
                {t('competences')}
              </h2>
            }
            titleText={t('competences')}
            lang={language}
          >
            <CompareCompetencesTable
              opportunityName={tyomahdollisuus?.otsikko}
              rows={competencesTableData}
              className="mt-4"
            />
          </Accordion>
        </div>
        <div>
          <Accordion
            title={
              <h2 id={t('job-opportunity.employment-trends.title')} className="text-heading-3 scroll-mt-[96px]">
                {t('job-opportunity.employment-trends.title')}
              </h2>
            }
            titleText={t('job-opportunity.employment-trends.title')}
            lang={language}
          >
            <p className="text-body-sm font-arial mb-6 mt-4">{t('job-opportunity.employment-trends.description')}</p>
            <div className="bg-todo h-[380px]" />
          </Accordion>
        </div>
        <div>
          <Accordion
            title={
              <h2 id={t('job-opportunity.related-jobs.title')} className="text-heading-3 scroll-mt-[96px]">
                {t('job-opportunity.related-jobs.title')}
              </h2>
            }
            titleText={t('job-opportunity.related-jobs.title')}
            lang={language}
          >
            <p className="text-body-sm font-arial mb-6 mt-4">{t('job-opportunity.related-jobs.description')}</p>
            <div className="bg-todo h-[380px] mb-8" />
          </Accordion>
        </div>
      </div>
    </MainLayout>
  );
};

export default Overview;
