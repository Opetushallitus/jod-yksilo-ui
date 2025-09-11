import { MainLayout } from '@/components';
import { IconHeading } from '@/components/IconHeading';
import { InfoBox, InfoboxItem } from '@/components/InfoBox';
import { ScrollHeading } from '@/components/ScrollHeading/ScrollHeading';
import { useEnvironment } from '@/hooks/useEnvironment';
import { getLinkTo } from '@/utils/routeUtils';
import { MenuSection, PageNavigation } from '@jod/design-system';
import { JodInfo } from '@jod/design-system/icons';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ArticleSection } from '../types';

const PrivacyPolicy = () => {
  const { isDev } = useEnvironment();
  const { t } = useTranslation();
  const title = t('privacy-policy');

  const filterDevSections = React.useCallback(
    (section: ArticleSection) => !section.showInDevOnly || (isDev && section.showInDevOnly),
    [isDev],
  );

  const sections: ArticleSection[] = React.useMemo(() => {
    return [
      {
        navTitle: t('privacy-policy-and-cookies.intro.title'),
        content: (
          <p>
            <Trans i18nKey="privacy-policy-and-cookies.intro.description" />
          </p>
        ),
      },
    ];
  }, [t]);

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

  const infoBoxItems: InfoboxItem[] = React.useMemo(() => {
    return [
      {
        label: t('privacy-policy-and-cookies.info.register.title'),
        content: t('privacy-policy-and-cookies.info.register.content'),
      },
      {
        label: t('privacy-policy-and-cookies.info.register-controller.title'),
        content: t('privacy-policy-and-cookies.info.register-controller.content'),
      },
      {
        label: t('privacy-policy-and-cookies.info.contact.title'),
        content: t('privacy-policy-and-cookies.info.contact.content'),
      },
      {
        label: t('privacy-policy-and-cookies.info.email.title'),
        content: t('privacy-policy-and-cookies.info.email.content'),
      },
      {
        label: t('privacy-policy-and-cookies.info.phone.title'),
        content: t('privacy-policy-and-cookies.info.phone.content'),
      },
      {
        label: t('privacy-policy-and-cookies.info.fax.title'),
        content: t('privacy-policy-and-cookies.info.fax.content'),
      },
    ];
  }, [t]);

  return (
    <MainLayout navChildren={navChildren}>
      <title>{title}</title>

      <IconHeading icon={<JodInfo />} title={title} dataTestId="privacy-policy-title" />

      <InfoBox items={infoBoxItems} className="mb-8" />

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

export default PrivacyPolicy;
