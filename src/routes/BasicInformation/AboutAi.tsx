import { MainLayout } from '@/components';
import { IconHeading } from '@/components/IconHeading';
import { InfoBox, InfoboxItem } from '@/components/InfoBox';
import { ScrollHeading } from '@/components/ScrollHeading/ScrollHeading';
import { useEnvironment } from '@/hooks/useEnvironment';
import { getLinkTo } from '@/utils/routeUtils';
import { Accordion, MenuSection, PageNavigation } from '@jod/design-system';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ArticleSection } from '../types';

const AiIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
    <g clipPath="url(#clip0_15716_148709)">
      <path
        d="M12.5977 2.34766C7.07766 2.34766 2.59766 6.82766 2.59766 12.3477C2.59766 17.8677 7.07766 22.3477 12.5977 22.3477C18.1177 22.3477 22.5977 17.8677 22.5977 12.3477C22.5977 6.82766 18.1177 2.34766 12.5977 2.34766ZM12.5977 15.6077L10.9677 20.0177L9.33766 15.6077L4.92766 13.9777L9.33766 12.3477L10.9677 7.93766L12.5977 12.3477L17.0077 13.9777L12.5977 15.6077ZM17.1277 9.73766L16.1677 12.3477L15.2077 9.73766L12.5977 8.77766L15.2077 7.81766L16.1677 5.20766L17.1277 7.81766L19.7377 8.77766L17.1277 9.73766Z"
        fill="white"
      />
    </g>
    <defs>
      <clipPath id="clip0_15716_148709">
        <rect width="24" height="24" fill="white" transform="translate(0.597656 0.347656)" />
      </clipPath>
    </defs>
  </svg>
);

const AboutAi = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { isDev } = useEnvironment();
  const title = t('about-ai-page.title');

  const infoBoxItems: InfoboxItem[] = React.useMemo(() => {
    return [
      {
        label: t('about-ai-page.ai-methods.data-location'),
        content: t('about-ai-page.ai-methods.data-location-eu'),
      },
      {
        label: t('about-ai-page.ai-methods.data-preservation-time'),
        content: t('about-ai-page.ai-methods.data-preservation-time-until-delete'),
      },
    ];
  }, [t]);

  const sections: ArticleSection[] = React.useMemo(() => {
    return [
      {
        navTitle: t('about-ai-page.why-ai.title'),
        content: (
          <div>
            <p className="mb-6 text-body-lg-mobile sm:text-body-lg">{t('about-ai-page.why-ai.description')}</p>
            <p className="mb-5 text-body-md-mobile sm:text-body-md">{t('about-ai-page.why-ai.possibilities.title')}</p>

            <div className="">
              <Accordion
                lang={language}
                titleText={t('about-ai-page.why-ai.possibilities.item-1.title')}
                title={
                  <span className="font-poppins text-heading-4-mobile sm:text-heading-4">
                    {t('about-ai-page.why-ai.possibilities.item-1.title')}
                  </span>
                }
              >
                <Trans i18nKey="about-ai-page.why-ai.possibilities.item-1.description" />
              </Accordion>

              <Accordion
                lang={language}
                titleText={t('about-ai-page.why-ai.possibilities.item-2.title')}
                title={
                  <span className="font-poppins text-heading-4-mobile sm:text-heading-4">
                    {t('about-ai-page.why-ai.possibilities.item-2.title')}
                  </span>
                }
              >
                <p className="mb-3 font-poppins text-heading-5">
                  <Trans i18nKey="about-ai-page.why-ai.possibilities.item-2.work.title" />
                </p>
                <p>{t('about-ai-page.why-ai.possibilities.item-2.work.description-1')}</p>
                <ul className="ml-6 mb-4 list-disc">
                  <li>{t('about-ai-page.why-ai.possibilities.item-2.work.list.item-1')}</li>
                  <li>{t('about-ai-page.why-ai.possibilities.item-2.work.list.item-2')}</li>
                  <li>{t('about-ai-page.why-ai.possibilities.item-2.work.list.item-3')}</li>
                </ul>
                <Trans i18nKey="about-ai-page.why-ai.possibilities.item-2.work.description-2" />

                <p className="mt-4 mb-3 font-poppins text-heading-5">
                  <Trans i18nKey="about-ai-page.why-ai.possibilities.item-2.education.title" />
                </p>
                <p>{t('about-ai-page.why-ai.possibilities.item-2.education.description-1')}</p>
                <ul className="ml-6 mb-3 list-disc">
                  <li>{t('about-ai-page.why-ai.possibilities.item-2.education.list.item-1')}</li>
                  <li>{t('about-ai-page.why-ai.possibilities.item-2.education.list.item-2')}</li>
                  <li>{t('about-ai-page.why-ai.possibilities.item-2.education.list.item-3')}</li>
                </ul>
                <p>{t('about-ai-page.why-ai.possibilities.item-2.education.description-2')}</p>
              </Accordion>

              <Accordion
                lang={language}
                titleText={t('about-ai-page.why-ai.possibilities.item-3.title')}
                title={
                  <span className="font-poppins text-heading-4-mobile sm:text-heading-4">
                    {t('about-ai-page.why-ai.possibilities.item-3.title')}
                  </span>
                }
              >
                {t('about-ai-page.why-ai.possibilities.item-3.description')}
              </Accordion>

              <Accordion
                lang={language}
                titleText={t('about-ai-page.why-ai.possibilities.item-4.title')}
                title={
                  <span className="font-poppins text-heading-4-mobile sm:text-heading-4">
                    {t('about-ai-page.why-ai.possibilities.item-4.title')}
                  </span>
                }
              >
                {t('about-ai-page.why-ai.possibilities.item-4.description')}
              </Accordion>

              <Accordion
                lang={language}
                titleText={t('about-ai-page.why-ai.possibilities.item-5.title')}
                title={
                  <span className="font-poppins text-heading-4-mobile sm:text-heading-4">
                    {t('about-ai-page.why-ai.possibilities.item-5.title')}
                  </span>
                }
              >
                <Trans i18nKey="about-ai-page.why-ai.possibilities.item-5.description" />
              </Accordion>
            </div>
          </div>
        ),
      },
      {
        navTitle: t('about-ai-page.ai-methods.title'),
        content: (
          <div>
            <p className="">{t('about-ai-page.ai-methods.description-1')}</p>
            <ul className="mt-3 ml-6 mb-3 list-disc">
              <li>{t('about-ai-page.ai-methods.list.item-1')}</li>
              <li>{t('about-ai-page.ai-methods.list.item-2')}</li>
              <li>{t('about-ai-page.ai-methods.list.item-3')}</li>
              <li>{t('about-ai-page.ai-methods.list.item-4')}</li>
              <li>{t('about-ai-page.ai-methods.list.item-5')}</li>
            </ul>
            <p className="">{t('about-ai-page.ai-methods.description-2')}</p>

            <InfoBox items={infoBoxItems} />
          </div>
        ),
      },
      {
        navTitle: t('about-ai-page.security.title'),
        content: (
          <div>
            <p className="">
              <Trans i18nKey={'about-ai-page.security.description-1'} />
            </p>
            <ul className="ml-6 mb-4 list-disc">
              <li>{t('about-ai-page.security.list.item-1')}</li>
              <li>{t('about-ai-page.security.list.item-2')}</li>
              <li>{t('about-ai-page.security.list.item-3')}</li>
              <li>{t('about-ai-page.security.list.item-4')}</li>
            </ul>
            <Trans i18nKey={'about-ai-page.security.description-2'} />
          </div>
        ),
      },
      {
        navTitle: t('about-ai-page.effect.title'),
        content: (
          <div>
            <p className="">{t('about-ai-page.effect.description')}</p>
            <ul className="ml-6 mb-3 list-disc">
              <li>{t('about-ai-page.effect.list.item-1')}</li>
              <li>{t('about-ai-page.effect.list.item-2')}</li>
              <li>{t('about-ai-page.effect.list.item-3')}</li>
              <li>{t('about-ai-page.effect.list.item-4')}</li>
            </ul>
          </div>
        ),
      },
      {
        navTitle: t('about-ai-page.functionality-tracking.title'),
        content: (
          <div>
            <p className="">{t('about-ai-page.functionality-tracking.description-1')}</p>
            <ul className="ml-6 mb-4 list-disc">
              <li>{t('about-ai-page.functionality-tracking.list.item-1')}</li>
              <li>{t('about-ai-page.functionality-tracking.list.item-2')}</li>
              <li>{t('about-ai-page.functionality-tracking.list.item-3')}</li>
              <li>{t('about-ai-page.functionality-tracking.list.item-4')}</li>
            </ul>
            <p className="">{t('about-ai-page.functionality-tracking.description-2')}</p>
          </div>
        ),
      },
      {
        navTitle: t('about-ai-page.limitation-of-liability.title'),
        content: (
          <p>
            <Trans i18nKey={'about-ai-page.limitation-of-liability.description'} />
          </p>
        ),
      },
    ];
  }, [t, language, infoBoxItems]);

  const filterDevSections = React.useCallback(
    (section: ArticleSection) => !section.showInDevOnly || (isDev && section.showInDevOnly),
    [isDev],
  );

  const navChildren = React.useMemo(() => {
    const menuSection: MenuSection = {
      title: t('on-this-page'),
      linkItems: sections.filter(filterDevSections).map((section) => ({
        label: section.navTitle,
        LinkComponent: getLinkTo(`#${section.navTitle}`),
      })),
    };
    return (
      <>
        <PageNavigation menuSection={menuSection} activeIndicator="dot" className={'mb-4'} />
      </>
    );
  }, [t, sections, filterDevSections]);

  return (
    <MainLayout navChildren={navChildren}>
      <title>{title}</title>

      <IconHeading icon={<AiIcon />} title={title} dataTestId="about-ai-title" />

      <div className="font-arial">
        {sections.filter(filterDevSections).map((section) => (
          <div key={section.navTitle} className="flex flex-col mb-7">
            <ScrollHeading
              title={section.navTitle}
              heading="h2"
              className={`text-heading-2-mobile sm:text-heading-2 font-poppins ${(section.showNavTitle ?? true) ? 'mb-3' : 'text-transparent text-[0px] size-0'}`}
            />
            <div className="flex flex-row justify-between">{section.content}</div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
};

export default AboutAi;
