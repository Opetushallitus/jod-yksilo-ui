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

  interface YksiloLeafItem {
    key: string;
    title: string;
  }

  interface YksiloGroupItem extends YksiloLeafItem {
    items: YksiloLeafItem[];
  }

  type YksiloItem = YksiloGroupItem;

  const YksiloRegisterContent = () => {
    const { t } = useTranslation();

    const raw = t('privacy-policy-and-cookies.register-information-content.yksilo.content', { returnObjects: true });
    const content: YksiloItem[] = Array.isArray(raw) ? (raw as YksiloItem[]) : [];

    return (
      <ul className="list-disc">
        {content.map((item) => (
          <li key={item.key} style={{}}>
            <strong>{item.title}</strong>
            {item.items?.length > 0 && (
              <ul className="ml-5 list-[circle]">
                {item.items.map((sub) => (
                  <li key={sub.key}>{sub.title}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    );
  };

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
      {
        navTitle: t('privacy-policy-and-cookies.register-controller.title'),
        content: (
          <div>
            <p>
              <Trans i18nKey="privacy-policy-and-cookies.register-controller.description-1" />
            </p>
            <ol className="ml-6 mb-4 list-decimal">
              <li>{t('privacy-policy-and-cookies.register-controller.list.item-1')}</li>
              <li>{t('privacy-policy-and-cookies.register-controller.list.item-2')}</li>
              <li>{t('privacy-policy-and-cookies.register-controller.list.item-3')}</li>
              <li>{t('privacy-policy-and-cookies.register-controller.list.item-4')}</li>
              <li>{t('privacy-policy-and-cookies.register-controller.list.item-5')}</li>
              <li>{t('privacy-policy-and-cookies.register-controller.list.item-6')}</li>
            </ol>
            <p>{t('privacy-policy-and-cookies.register-controller.description-2')}</p>
          </div>
        ),
      },
      {
        navTitle: t('privacy-policy-and-cookies.data-handling-use.title'),
        content: (
          <div>
            <Trans i18nKey="privacy-policy-and-cookies.data-handling-use.description" />

            <h3 className="mt-6 mb-3 text-heading-3-mobile sm:text-heading-3">
              {t('privacy-policy-and-cookies.data-handling-use.legal-basis.title')}
            </h3>
            <p>
              <Trans i18nKey="privacy-policy-and-cookies.data-handling-use.legal-basis.description" />
            </p>
          </div>
        ),
      },
      {
        navTitle: t('privacy-policy-and-cookies.register-information-content.title'),
        content: <YksiloRegisterContent />,
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
          <div key={section.navTitle} className="flex flex-col mb-8">
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
