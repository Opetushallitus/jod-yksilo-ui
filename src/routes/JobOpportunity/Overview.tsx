/* eslint-disable sonarjs/no-duplicate-string */
import { MainLayout, RoutesNavigationList, RoutesNavigationListProps, SimpleNavigationList, Title } from '@/components';
import { useActionBar } from '@/hooks/useActionBar';
import { useRouteId } from '@/hooks/useRouteId/useRouteId';
import { type LangCode } from '@/i18n/config';
import { Accordion, Button } from '@jod/design-system';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { MdArrowBack } from 'react-icons/md';
import { useNavigate, useRouteLoaderData } from 'react-router-dom';
import Tabs from './Tabs';
import { LoaderData } from './loader';

const Overview = () => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const routeId = useRouteId('job-opportunity', i18n.language as LangCode);
  const jobOpportunity = (useRouteLoaderData(routeId) as LoaderData)?.tyomahdollisuus;
  const lang = i18n.language;
  const title = jobOpportunity?.otsikko[lang];
  const routes: RoutesNavigationListProps['routes'] = [
    {
      active: false,
      name: t('job-opportunity.description'),
      path: `#${t('job-opportunity.description')}`,
    },
    {
      active: false,
      name: t('job-opportunity.most-common-job-tasks.title'),
      path: `#${t('job-opportunity.most-common-job-tasks.title')}`,
    },
    {
      active: false,
      name: t('job-opportunity.key-figures.title'),
      path: `#${t('job-opportunity.key-figures.title')}`,
    },
    {
      active: false,
      name: t('job-opportunity.labour-market-picture.title'),
      path: `#${t('job-opportunity.labour-market-picture.title')}`,
    },
    {
      active: false,
      name: t('job-opportunity.salary-trends.title'),
      path: `#${t('job-opportunity.salary-trends.title')}`,
    },
    {
      active: false,
      name: t('job-opportunity.employment-trends.title'),
      path: `#${t('job-opportunity.employment-trends.title')}`,
    },
    {
      active: false,
      name: t('job-opportunity.related-jobs.title'),
      path: `#${t('job-opportunity.related-jobs.title')}`,
    },
  ];
  const actionBar = useActionBar();

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
              <h2 id={t('job-opportunity.description')} className="text-heading-3">
                {t('job-opportunity.description')}
              </h2>
            }
            expandMoreText={t('expand-more')}
            expandLessText={t('expand-less')}
            lang={i18n.language}
          >
            <p className="text-body-sm font-arial mt-4">{jobOpportunity?.kuvaus?.[lang]}</p>
          </Accordion>
        </div>
        <div>
          <Accordion
            title={
              <h2 id={t('job-opportunity.most-common-job-tasks.title')} className="text-heading-3">
                {t('job-opportunity.most-common-job-tasks.title')}
              </h2>
            }
            expandMoreText={t('expand-more')}
            expandLessText={t('expand-less')}
            lang={i18n.language}
          >
            <p className="text-body-sm font-arial mt-4 mb-4">
              {t('job-opportunity.most-common-job-tasks.description')}
            </p>
            <ol className="list-decimal ml-7 font-bold text-black leading-7">
              {jobOpportunity?.jakaumat?.ammatti?.arvot.map((task) => <li key={task.arvo}>{task.arvo}</li>)}
            </ol>
          </Accordion>
        </div>
        <div>
          <Accordion
            title={
              <h2 id={t('job-opportunity.key-figures.title')} className="text-heading-3">
                {t('job-opportunity.key-figures.title')}
              </h2>
            }
            expandMoreText={t('expand-more')}
            expandLessText={t('expand-less')}
            lang={i18n.language}
          >
            <p className="text-body-sm font-arial mb-6 mt-4">{t('job-opportunity.key-figures.description')}</p>
            <div className="bg-bg-gray h-[380px]" />
          </Accordion>
        </div>
        <div>
          <Accordion
            title={
              <h2 id={t('job-opportunity.labour-market-picture.title')} className="text-heading-3">
                {t('job-opportunity.labour-market-picture.title')}
              </h2>
            }
            expandMoreText={t('expand-more')}
            expandLessText={t('expand-less')}
            lang={i18n.language}
          >
            <p className="text-body-sm font-arial mb-6 mt-4">
              {t('job-opportunity.labour-market-picture.description')}
            </p>
            <div className="bg-bg-gray h-[380px]" />
          </Accordion>
        </div>
        <div>
          <Accordion
            title={
              <h2 id={t('job-opportunity.salary-trends.title')} className="text-heading-3">
                {t('job-opportunity.salary-trends.title')}
              </h2>
            }
            expandMoreText={t('expand-more')}
            expandLessText={t('expand-less')}
            lang={i18n.language}
          >
            <p className="text-body-sm font-arial mb-6 mt-4">{t('job-opportunity.salary-trends.description')}</p>
            <div className="bg-bg-gray h-[380px]" />
          </Accordion>
        </div>
        <div>
          <Accordion
            title={
              <h2 id={t('job-opportunity.employment-trends.title')} className="text-heading-3">
                {t('job-opportunity.employment-trends.title')}
              </h2>
            }
            expandMoreText={t('expand-more')}
            expandLessText={t('expand-less')}
            lang={i18n.language}
          >
            <p className="text-body-sm font-arial mb-6 mt-4">{t('job-opportunity.employment-trends.description')}</p>
            <div className="bg-bg-gray h-[380px]" />
          </Accordion>
        </div>
        <div>
          <Accordion
            title={
              <h2 id={t('job-opportunity.related-jobs.title')} className="text-heading-3">
                {t('job-opportunity.related-jobs.title')}
              </h2>
            }
            expandMoreText={t('expand-more')}
            expandLessText={t('expand-less')}
            lang={i18n.language}
          >
            <p className="text-body-sm font-arial mb-6 mt-4">{t('job-opportunity.related-jobs.description')}</p>
            <div className="bg-bg-gray h-[380px] mb-8" />
          </Accordion>
        </div>
      </div>
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button
              variant="white"
              label={t('back')}
              icon={<MdArrowBack size={24} />}
              iconSide="left"
              onClick={() => navigate(-1)}
            />
            <Button
              variant="white"
              label="Luo polku"
              onClick={() => {
                alert('Luo polku');
              }}
            />
            <Button
              variant="white"
              label="Lisää suosikkeihin"
              onClick={() => {
                alert('Lisää suosikkeihin');
              }}
            />
            <Button
              variant="white"
              label="Vertaile osaamisia"
              onClick={() => {
                alert('Vertaile osaamisia');
              }}
            />
          </div>,
          actionBar,
        )}
    </MainLayout>
  );
};

export default Overview;
