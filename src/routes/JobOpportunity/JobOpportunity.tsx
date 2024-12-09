import {
  ActionButton,
  FavoriteToggle,
  LoginModal,
  MainLayout,
  RoutesNavigationList,
  SimpleNavigationList,
  Title,
} from '@/components';
import { CompareCompetencesTable } from '@/components/CompareTable/CompareCompetencesTable';
import { useEnvironment } from '@/hooks/useEnvironment';
import { useToolStore } from '@/stores/useToolStore';
import { getLocalizedText, getLocalizedTextByLang } from '@/utils';
import { tidyClasses as tc } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdCompareArrows, MdOutlinePrint, MdOutlineRoute, MdOutlineShare } from 'react-icons/md';
import { useLoaderData } from 'react-router';
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
  const { tyomahdollisuus, ammatit, ammattiryhma, osaamiset, isLoggedIn } = useLoaderData() as LoaderData;
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

  interface Section {
    navTitle: string; // Navigation title
    content: JSX.Element; // Section content
    dev?: boolean; // Only render in dev environment
  }
  const sections: Section[] = [
    {
      navTitle: t('job-opportunity.description'),
      content: <p className="text-body-md font-arial mt-5">{getLocalizedText(tyomahdollisuus?.kuvaus)}</p>,
    },
    {
      navTitle: t('job-opportunity.most-common-job-tasks.title'),
      content: <p className="text-body-md font-arial mt-5">{getLocalizedText(tyomahdollisuus?.tehtavat)}</p>,
    },
    {
      navTitle: t('job-opportunity.occupations.title'),
      content: (
        <ol className="list-decimal ml-7 mt-5 text-body-lg font-medium text-black leading-7">
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
        <ul className="list-none ml-0 mt-5 text-body-lg font-medium text-black leading-7">
          <li
            className="text-capitalize text-body"
            title={`${ammattiryhma?.uri}\n${getLocalizedTextByLang('en', ammattiryhma?.kuvaus)}`}
            key={ammattiryhma?.uri}
          >
            {getLocalizedText(ammattiryhma?.nimi)}
          </li>
        </ul>
      ),
      dev: true,
    },
    {
      navTitle: t('job-opportunity.key-figures.title'),
      content: (
        <>
          <p className="text-body-md font-arial mb-6 mt-4">{t('job-opportunity.key-figures.description')}</p>
          <div className="bg-todo h-[380px]" />
        </>
      ),
      dev: true,
    },
    {
      navTitle: t('job-opportunity.labour-market-picture.title'),
      content: (
        <>
          <p className="text-body-md font-arial mb-6 mt-4">{t('job-opportunity.labour-market-picture.description')}</p>
          <div className="bg-todo h-[380px]" />
        </>
      ),
      dev: true,
    },
    {
      navTitle: t('job-opportunity.salary-trends.title'),
      content: (
        <>
          <p className="text-body-md font-arial mb-6 mt-4">{t('job-opportunity.salary-trends.description')}</p>
          <div className="bg-todo h-[380px]" />
        </>
      ),
      dev: true,
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
          <p className="text-body-md font-arial mb-6 mt-4">{t('job-opportunity.employment-trends.description')}</p>
          <div className="bg-todo h-[380px]" />
        </>
      ),
      dev: true,
    },
    {
      navTitle: t('job-opportunity.related-jobs.title'),
      content: (
        <>
          <p className="text-body-md font-arial mb-6 mt-4">{t('job-opportunity.related-jobs.description')}</p>
          <div className="bg-todo h-[380px] mb-8" />
        </>
      ),
      dev: true,
    },
  ];

  const filterDevSections = (section: Section) => !section.dev || (isDev && section.dev);

  const routes = sections.filter(filterDevSections).map((section) => ({
    active: false,
    name: section.navTitle,
    path: `#${section.navTitle}`,
    replace: true,
  }));

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
        {!!tyomahdollisuus &&
          sections.filter(filterDevSections).map((section) => (
            <div key={section.navTitle}>
              <ScrollHeading title={section.navTitle} heading="h2" className="text-heading-2" />
              {section.content}
            </div>
          ))}
      </div>
    </MainLayout>
  );
};

export default JobOpportunity;
