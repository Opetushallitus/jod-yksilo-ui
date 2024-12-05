import {
  ActionButton,
  FavoriteToggle,
  LoginModal,
  MainLayout,
  RoutesNavigationList,
  RoutesNavigationListProps,
  SimpleNavigationList,
  Title,
} from '@/components';
import { CompareCompetencesTable } from '@/components/CompareTable/CompareCompetencesTable';
import { useEnvironment } from '@/hooks/useEnvironment';
import { useToolStore } from '@/stores/useToolStore';
import { getLocalizedText } from '@/utils';
import { tidyClasses as tc } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdCompareArrows, MdOutlinePrint, MdOutlineRoute, MdOutlineShare } from 'react-icons/md';
import { useLoaderData } from 'react-router-dom';
import { LoaderData } from './loader';

interface ScrollHeadingProps {
  title: string;
  heading: 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
  className: string;
}
const ScrollHeading = ({ title, heading, className }: ScrollHeadingProps) => {
  const HeadingTag = heading as keyof JSX.IntrinsicElements;
  return (
    <HeadingTag id={title} className={tc(`scroll-mt-[96px] ${className}`)}>
      {title}
    </HeadingTag>
  );
};

const JobOpportunity = () => {
  const { t } = useTranslation();
  const { tyomahdollisuus, ammatit, osaamiset, isLoggedIn } = useLoaderData() as LoaderData;
  const toolStore = useToolStore();
  const { isDev } = useEnvironment();
  const title = getLocalizedText(tyomahdollisuus?.otsikko);
  const [loginModalOpen, setLoginModalOpen] = React.useState(false);
  const omatOsaamisetUris = React.useMemo(
    () => toolStore.osaamiset?.map((osaaminen) => osaaminen.id),
    [toolStore.osaamiset],
  );
  const competencesTableData = React.useMemo(
    () => osaamiset.map((competence) => ({ ...competence, profiili: omatOsaamisetUris?.includes(competence.uri) })),
    [osaamiset, omatOsaamisetUris],
  );
  const clusterSize = tyomahdollisuus?.jakaumat?.ammatti?.maara;

  interface HeadingRoute {
    title: string;
    isDev?: boolean;
  }

  const createHeadingRoutes = (headings: HeadingRoute[]): RoutesNavigationListProps['routes'] => {
    return headings
      .filter((h) => !h.isDev || isDev)
      .map((hf) => {
        return {
          active: false,
          name: hf.title,
          path: `#${hf.title}`,
          replace: true,
        };
      });
  };

  const routes = createHeadingRoutes([
    { title: t('job-opportunity.description') },
    { title: t('job-opportunity.most-common-job-tasks.title') },
    { title: t('job-opportunity.occupations.title') },
    { title: t('job-opportunity.professional-group'), isDev: true },
    { title: t('job-opportunity.key-figures.title'), isDev: true },
    { title: t('job-opportunity.labour-market-picture.title'), isDev: true },
    { title: t('job-opportunity.salary-trends.title'), isDev: true },
    { title: t('job-opportunity.competences.title') },
    { title: t('job-opportunity.employment-trends.title'), isDev: true },
    { title: t('job-opportunity.related-jobs.title'), isDev: true },
  ]);

  const [isFavorite, setIsFavorite] = React.useState(false);

  React.useEffect(() => {
    setIsFavorite(toolStore.suosikit?.some((suosikki) => suosikki.suosionKohdeId === tyomahdollisuus?.id));
  }, [toolStore.suosikit, tyomahdollisuus?.id]);

  const onToggleFavorite = async () => {
    if (!isLoggedIn) {
      setLoginModalOpen(true);
    } else if (tyomahdollisuus?.id) {
      await toolStore.toggleSuosikki(tyomahdollisuus.id, 'TYOMAHDOLLISUUS');
    }
  };

  const notImplemented = () => {
    // eslint-disable-next-line no-console
    console.log('Feature not implemented');
  };

  const doPrint = () => {
    window.print();
  };

  return (
    <MainLayout
      navChildren={
        <SimpleNavigationList title={t('job-opportunity.navigation')} collapsible>
          <RoutesNavigationList routes={routes} />
        </SimpleNavigationList>
      }
    >
      {loginModalOpen && <LoginModal onClose={() => setLoginModalOpen(false)} isOpen={loginModalOpen} />}
      <Title value={title ?? ''} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <div className="flex flex-row flex-wrap gap-x-7 gap-y-5 my-8 print:hidden">
        <FavoriteToggle isFavorite={isFavorite} onToggleFavorite={() => void onToggleFavorite()} />
        {isDev && (
          <ActionButton
            label={t('compare')}
            icon={<MdCompareArrows size={24} className="text-accent" />}
            onClick={notImplemented}
            className="bg-todo"
          />
        )}
        {isDev && (
          <ActionButton
            label={t('create-path')}
            icon={<MdOutlineRoute size={24} className="text-accent transform rotate-90 -scale-x-100" />}
            onClick={notImplemented}
            className="bg-todo"
          />
        )}
        {isDev && (
          <ActionButton
            label={t('share')}
            icon={<MdOutlineShare size={24} className="text-accent" />}
            onClick={notImplemented}
            className="bg-todo"
          />
        )}
        {!!window.print && (
          <ActionButton
            label={t('print')}
            icon={<MdOutlinePrint size={24} className="text-accent" />}
            onClick={doPrint}
          />
        )}
      </div>
      <div className="flex flex-col gap-7">
        <div>
          <ScrollHeading title={t('job-opportunity.description')} heading="h2" className="text-heading-2" />
          <p className="text-body-md font-arial mt-5">{getLocalizedText(tyomahdollisuus?.kuvaus)}</p>
        </div>
        <div>
          <ScrollHeading
            title={t('job-opportunity.most-common-job-tasks.title')}
            heading="h2"
            className="text-heading-2"
          />
          <p className="text-body-md font-arial mt-5">{getLocalizedText(tyomahdollisuus?.tehtavat)}</p>
        </div>
        <div>
          <ScrollHeading title={t('job-opportunity.occupations.title')} heading="h2" className="text-heading-2" />
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
        </div>
        {isDev && (
          <div>
            <ScrollHeading title={t('job-opportunity.professional-group')} heading="h2" className="text-heading-2" />
            <p className="text-body-md font-arial mb-6 mt-4">{tyomahdollisuus?.ammattiryhma}</p>
          </div>
        )}
        {isDev && (
          <div>
            <ScrollHeading title={t('job-opportunity.key-figures.title')} heading="h2" className="text-heading-2" />
            <p className="text-body-md font-arial mb-6 mt-4">{t('job-opportunity.key-figures.description')}</p>
            <div className="bg-todo h-[380px]" />
          </div>
        )}
        {isDev && (
          <div>
            <ScrollHeading
              title={t('job-opportunity.labour-market-picture.title')}
              heading="h2"
              className="text-heading-2"
            />
            <p className="text-body-md font-arial mb-6 mt-4">
              {t('job-opportunity.labour-market-picture.description')}
            </p>
            <div className="bg-todo h-[380px]" />
          </div>
        )}
        {isDev && (
          <div>
            <ScrollHeading title={t('job-opportunity.salary-trends.title')} heading="h2" className="text-heading-2" />
            <p className="text-body-md font-arial mb-6 mt-4">{t('job-opportunity.salary-trends.description')}</p>
            <div className="bg-todo h-[380px]" />
          </div>
        )}
        <div>
          <ScrollHeading title={t('job-opportunity.competences.title')} heading="h2" className="text-heading-2" />
          <CompareCompetencesTable
            opportunityName={tyomahdollisuus?.otsikko}
            rows={competencesTableData}
            className="mt-4"
          />
        </div>
        {isDev && (
          <div>
            <ScrollHeading
              title={t('job-opportunity.employment-trends.title')}
              heading="h2"
              className="text-heading-2"
            />
            <p className="text-body-md font-arial mb-6 mt-4">{t('job-opportunity.employment-trends.description')}</p>
            <div className="bg-todo h-[380px]" />
          </div>
        )}
        {isDev && (
          <div>
            <ScrollHeading title={t('job-opportunity.related-jobs.title')} heading="h2" className="text-heading-2" />
            <p className="text-body-md font-arial mb-6 mt-4">{t('job-opportunity.related-jobs.description')}</p>
            <div className="bg-todo h-[380px] mb-8" />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default JobOpportunity;
