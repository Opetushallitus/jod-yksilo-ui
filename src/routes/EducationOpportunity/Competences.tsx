/* eslint-disable sonarjs/no-duplicate-string */
import { MainLayout, RoutesNavigationList, RoutesNavigationListProps, SimpleNavigationList, Title } from '@/components';
import { useActionBar } from '@/hooks/useActionBar';
import Tabs from '@/routes/EducationOpportunity/Tabs';
import { getLocalizedText, sortByProperty } from '@/utils';
import { Accordion, Button, Tag } from '@jod/design-system';
import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { LoaderData } from './loader';

const Competences = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { koulutusmahdollisuus, osaamiset } = useOutletContext<LoaderData>();
  const title = koulutusmahdollisuus?.otsikko[language] ?? '';
  const sortedCompetences = React.useMemo(
    () => [...(osaamiset ?? [])].sort(sortByProperty(`nimi.${language}`)),
    [osaamiset, language],
  );

  const routes: RoutesNavigationListProps['routes'] = [
    {
      active: false,
      name: t('education-opportunity.specific-professional-competences.title'),
      path: `#${t('education-opportunity.specific-professional-competences.title')}`,
      replace: true,
    },
  ];
  const actionBar = useActionBar();

  return (
    <MainLayout
      navChildren={
        <SimpleNavigationList title={t('education-opportunity.competences.navigation')} collapsible>
          <RoutesNavigationList routes={routes} />
        </SimpleNavigationList>
      }
    >
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <Tabs />
      <div className="flex flex-col gap-11">
        <Accordion
          title={
            <h2
              id={t('education-opportunity.specific-professional-competences.title')}
              className="text-heading-3 scroll-mt-[96px]"
            >
              {t('education-opportunity.specific-professional-competences.title')}
            </h2>
          }
          expandMoreText={t('expand-more')}
          expandLessText={t('expand-less')}
          lang={language}
        >
          <p className="text-body-sm font-arial mt-4 mb-4">
            {t('education-opportunity.specific-professional-competences.description')}
          </p>
          <div className="flex flex-wrap gap-4">
            {sortedCompetences.map((competence) => (
              <Tag
                label={getLocalizedText(competence.nimi)}
                title={getLocalizedText(competence.kuvaus)}
                key={competence.uri}
                variant="presentation"
              />
            ))}
          </div>
        </Accordion>
      </div>
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button variant="white" label="TODO: Luo polku" />
            <Button variant="white" label="TODO: Lisää suosikkeihin" />
            <Button variant="white" label="TODO: Vertaile osaamisia" />
          </div>,
          actionBar,
        )}
    </MainLayout>
  );
};

export default Competences;
