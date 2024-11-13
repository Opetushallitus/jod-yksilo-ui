import { MainLayout, RoutesNavigationList, RoutesNavigationListProps, SimpleNavigationList, Title } from '@/components';
import { getLocalizedText } from '@/utils';
import { Accordion, Tag } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import Tabs from './Tabs';
import { LoaderData } from './loader';

const Competences = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { tyomahdollisuus, osaamiset } = useOutletContext<LoaderData>();
  const title = getLocalizedText(tyomahdollisuus?.otsikko);

  const routes: RoutesNavigationListProps['routes'] = [
    {
      active: false,
      name: t('job-opportunity.specific-professional-competences.title'),
      path: `#${t('job-opportunity.specific-professional-competences.title')}`,
      replace: true,
    },
    {
      active: false,
      name: t('job-opportunity.general-working-life-skills.title'),
      path: `#${t('job-opportunity.general-working-life-skills.title')}`,
      replace: true,
    },
    {
      active: false,
      name: t('job-opportunity.digital-skills-for-citizens.title'),
      path: `#${t('job-opportunity.digital-skills-for-citizens.title')}`,
      replace: true,
    },
    {
      active: false,
      name: t('job-opportunity.personal-characteristics.title'),
      path: `#${t('job-opportunity.personal-characteristics.title')}`,
      replace: true,
    },
  ];

  return (
    <MainLayout
      navChildren={
        <SimpleNavigationList title={t('job-opportunity.competences.navigation')} collapsible>
          <RoutesNavigationList routes={routes} />
        </SimpleNavigationList>
      }
    >
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <Tabs />
      <div className="flex flex-col gap-11">
        <div>
          <Accordion
            title={
              <h2
                id={t('job-opportunity.specific-professional-competences.title')}
                className="text-heading-3 scroll-mt-[96px]"
              >
                {t('job-opportunity.specific-professional-competences.title')}
              </h2>
            }
            titleText={t('job-opportunity.specific-professional-competences.title')}
            lang={language}
          >
            <p className="text-body-sm font-arial mt-4 mb-4">
              {t('job-opportunity.specific-professional-competences.description')}
            </p>
            <div className="flex flex-wrap gap-3">
              {osaamiset.map((competence) => (
                <Tag
                  label={getLocalizedText(competence.nimi)}
                  title={`${getLocalizedText(competence.kuvaus)} (${competence.osuus.toFixed(1)}%)`}
                  key={competence.uri}
                  variant="presentation"
                />
              ))}
            </div>
          </Accordion>
        </div>
        <div>
          <Accordion
            title={
              <h2
                id={t('job-opportunity.general-working-life-skills.title')}
                className="text-heading-3 scroll-mt-[96px]"
              >
                {t('job-opportunity.general-working-life-skills.title')}
              </h2>
            }
            titleText={t('job-opportunity.general-working-life-skills.title')}
            lang={language}
          >
            <p className="text-body-sm font-arial mb-6 mt-4">
              {t('job-opportunity.general-working-life-skills.description')}
            </p>
            <div className="bg-todo h-[380px]" />
          </Accordion>
        </div>
        <div>
          <Accordion
            title={
              <h2
                id={t('job-opportunity.digital-skills-for-citizens.title')}
                className="text-heading-3 scroll-mt-[96px]"
              >
                {t('job-opportunity.digital-skills-for-citizens.title')}
              </h2>
            }
            titleText={t('job-opportunity.digital-skills-for-citizens.title')}
            lang={language}
          >
            <p className="text-body-sm font-arial mb-6 mt-4">
              {t('job-opportunity.digital-skills-for-citizens.description')}
            </p>
            <div className="bg-todo h-[380px]" />
          </Accordion>
        </div>
        <div>
          <Accordion
            title={
              <h2 id={t('job-opportunity.personal-characteristics.title')} className="text-heading-3 scroll-mt-[96px]">
                {t('job-opportunity.personal-characteristics.title')}
              </h2>
            }
            titleText={t('job-opportunity.personal-characteristics.title')}
            lang={language}
          >
            <p className="text-body-sm font-arial mb-6 mt-4">
              {t('job-opportunity.personal-characteristics.description')}
            </p>
            <div className="bg-todo h-[380px]" />
          </Accordion>
        </div>
      </div>
    </MainLayout>
  );
};

export default Competences;
