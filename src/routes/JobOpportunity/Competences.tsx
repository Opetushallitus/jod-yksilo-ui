/* eslint-disable sonarjs/no-duplicate-string */
import { MainLayout, RoutesNavigationList, RoutesNavigationListProps, SimpleNavigationList, Title } from '@/components';
import { useActionBar } from '@/hooks/useActionBar';
import { Accordion, Button } from '@jod/design-system';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import Tabs from './Tabs';
import { mockTyomahdollisuus } from './utils';

const Competences = () => {
  const { i18n, t } = useTranslation();
  const title = mockTyomahdollisuus.nimi;
  const routes: RoutesNavigationListProps['routes'] = [
    {
      active: false,
      name: t('job-opportunity.specific-professional-competences.title'),
      path: `#${t('job-opportunity.specific-professional-competences.title')}`,
    },
    {
      active: false,
      name: t('job-opportunity.general-working-life-skills.title'),
      path: `#${t('job-opportunity.general-working-life-skills.title')}`,
    },
    {
      active: false,
      name: t('job-opportunity.digital-skills-for-citizens.title'),
      path: `#${t('job-opportunity.digital-skills-for-citizens.title')}`,
    },
    {
      active: false,
      name: t('job-opportunity.personal-characteristics.title'),
      path: `#${t('job-opportunity.personal-characteristics.title')}`,
    },
  ];
  const actionBar = useActionBar();

  return (
    <MainLayout
      navChildren={
        <SimpleNavigationList title={t('job-opportunity.competences.navigation')} collapsible>
          <RoutesNavigationList routes={routes} />
        </SimpleNavigationList>
      }
    >
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1 font-poppins">{title}</h1>
      <Tabs />
      <div className="flex flex-col gap-11">
        <div>
          <Accordion
            title={
              <h2
                id={t('job-opportunity.specific-professional-competences.title')}
                className="text-heading-3 font-poppins"
              >
                {t('job-opportunity.specific-professional-competences.title')}
              </h2>
            }
            expandMoreText={t('expand-more')}
            expandLessText={t('expand-less')}
            lang={i18n.language}
          >
            <p className="text-body-sm mt-4 mb-4">
              {t('job-opportunity.specific-professional-competences.description')}
            </p>
            <ol className="list-decimal ml-7 font-bold text-black leading-7">
              {mockTyomahdollisuus.ammatillisetErityisosaamiset.map((competence) => (
                <li key={competence}>{competence}</li>
              ))}
            </ol>
          </Accordion>
        </div>
        <div>
          <Accordion
            title={
              <h2 id={t('job-opportunity.general-working-life-skills.title')} className="text-heading-3 font-poppins">
                {t('job-opportunity.general-working-life-skills.title')}
              </h2>
            }
            expandMoreText={t('expand-more')}
            expandLessText={t('expand-less')}
            lang={i18n.language}
          >
            <p className="text-body-sm mb-6 mt-4">{t('job-opportunity.general-working-life-skills.description')}</p>
            <div className="bg-bg-gray h-[380px]" />
          </Accordion>
        </div>
        <div>
          <Accordion
            title={
              <h2 id={t('job-opportunity.digital-skills-for-citizens.title')} className="text-heading-3 font-poppins">
                {t('job-opportunity.digital-skills-for-citizens.title')}
              </h2>
            }
            expandMoreText={t('expand-more')}
            expandLessText={t('expand-less')}
            lang={i18n.language}
          >
            <p className="text-body-sm mb-6 mt-4">{t('job-opportunity.digital-skills-for-citizens.description')}</p>
            <div className="bg-bg-gray h-[380px]" />
          </Accordion>
        </div>
        <div>
          <Accordion
            title={
              <h2 id={t('job-opportunity.personal-characteristics.title')} className="text-heading-3 font-poppins">
                {t('job-opportunity.personal-characteristics.title')}
              </h2>
            }
            expandMoreText={t('expand-more')}
            expandLessText={t('expand-less')}
            lang={i18n.language}
          >
            <p className="text-body-sm mb-6 mt-4">{t('job-opportunity.personal-characteristics.description')}</p>
            <div className="bg-bg-gray h-[380px]" />
          </Accordion>
        </div>
      </div>
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button
              variant="white"
              label="Takaisin"
              icon="arrow_back"
              iconSide="left"
              onClick={() => {
                alert('Takaisin');
              }}
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

export default Competences;
