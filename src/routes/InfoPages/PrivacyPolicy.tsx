import { MainLayout } from '@/components';
import { ArticleAccordion } from '@/components/ArticleAccordion';
import { IconHeading } from '@/components/IconHeading';
import { InfoBox, InfoboxItem } from '@/components/InfoBox';
import { ScrollHeading } from '@/components/ScrollHeading/ScrollHeading';
import { useEnvironment } from '@/hooks/useEnvironment';
import { getLinkTo } from '@/utils/routeUtils';
import { MenuSection, PageNavigation } from '@jod/design-system';
import { JodInfo } from '@jod/design-system/icons';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ArticleSection } from '../types';

interface YksiloLeafItem {
  key: string;
  title: string;
}

interface YksiloGroupItem extends YksiloLeafItem {
  items: YksiloLeafItem[];
}

type YksiloItem = YksiloGroupItem;

const RegisterContent = ({ contentKey }: { contentKey: string }) => {
  const { t } = useTranslation();

  const raw = t(contentKey, { returnObjects: true });
  const content: YksiloItem[] = Array.isArray(raw) ? (raw as YksiloItem[]) : [];

  return (
    <ul className="list-disc">
      {content.map((item) => (
        <li key={item.key}>
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
const PrivacyPolicy = () => {
  const { isDev } = useEnvironment();
  const { t } = useTranslation();
  const title = t('privacy-policy');

  const filterDevSections = React.useCallback(
    (section: ArticleSection) => !section.showInDevOnly || (isDev && section.showInDevOnly),
    [isDev],
  );

  const privacyPolicySections: ArticleSection[] = React.useMemo(() => {
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
            <ul className="ml-6 mb-4 list-disc">
              <li>{t('privacy-policy-and-cookies.data-handling-use.legal-basis.list.item-1')}</li>
              <li>{t('privacy-policy-and-cookies.data-handling-use.legal-basis.list.item-2')}</li>
              <li>{t('privacy-policy-and-cookies.data-handling-use.legal-basis.list.item-3')}</li>
              <li>{t('privacy-policy-and-cookies.data-handling-use.legal-basis.list.item-4')}</li>
              <li>{t('privacy-policy-and-cookies.data-handling-use.legal-basis.list.item-5')}</li>
            </ul>
          </div>
        ),
      },
      {
        navTitle: t('privacy-policy-and-cookies.register-information-content.title'),
        content: (
          <div>
            <p>
              <Trans i18nKey="privacy-policy-and-cookies.register-information-content.description" />
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <ArticleAccordion
                titleText={t('privacy-policy-and-cookies.register-information-content.yksilo.title')}
                content={
                  <RegisterContent contentKey="privacy-policy-and-cookies.register-information-content.yksilo.content" />
                }
              />
              <ArticleAccordion
                titleText={t('privacy-policy-and-cookies.register-information-content.ohjaaja.title')}
                content={
                  <RegisterContent contentKey="privacy-policy-and-cookies.register-information-content.ohjaaja.content" />
                }
              />
            </div>
          </div>
        ),
      },
      {
        navTitle: t('privacy-policy-and-cookies.recipients-of-personal-data.title'),
        content: (
          <p>
            <Trans i18nKey="privacy-policy-and-cookies.recipients-of-personal-data.description" />
          </p>
        ),
      },
      {
        navTitle: t('privacy-policy-and-cookies.info-about-3rd-country.title'),
        content: <p>{t('privacy-policy-and-cookies.info-about-3rd-country.description')}</p>,
      },
      {
        navTitle: t('privacy-policy-and-cookies.storing-time-of-personal-data.title'),
        content: (
          <>
            <p>
              <Trans i18nKey="privacy-policy-and-cookies.storing-time-of-personal-data.description" />
            </p>
            <div>
              <h3 className="font-poppins mt-6 mb-3 text-heading-3-mobile sm:text-heading-3">
                {t('privacy-policy-and-cookies.storing-time-of-personal-data.data-subject-rights.title')}
              </h3>
              <div className="flex flex-col gap-2">
                <ArticleAccordion
                  titleText={t(
                    'privacy-policy-and-cookies.storing-time-of-personal-data.data-subject-rights.access-personal-data.title',
                  )}
                  content={
                    <Trans
                      i18nKey={
                        'privacy-policy-and-cookies.storing-time-of-personal-data.data-subject-rights.access-personal-data.description'
                      }
                    />
                  }
                />

                <ArticleAccordion
                  titleText={t(
                    'privacy-policy-and-cookies.storing-time-of-personal-data.data-subject-rights.rectification.title',
                  )}
                  content={
                    <Trans
                      i18nKey={
                        'privacy-policy-and-cookies.storing-time-of-personal-data.data-subject-rights.rectification.description'
                      }
                    />
                  }
                />
                <ArticleAccordion
                  titleText={t(
                    'privacy-policy-and-cookies.storing-time-of-personal-data.data-subject-rights.delete.title',
                  )}
                  content={
                    <Trans
                      i18nKey={
                        'privacy-policy-and-cookies.storing-time-of-personal-data.data-subject-rights.delete.description'
                      }
                    />
                  }
                />
                <ArticleAccordion
                  titleText={t(
                    'privacy-policy-and-cookies.storing-time-of-personal-data.data-subject-rights.restrict-processing.title',
                  )}
                  content={
                    <Trans
                      i18nKey={
                        'privacy-policy-and-cookies.storing-time-of-personal-data.data-subject-rights.restrict-processing.description'
                      }
                    />
                  }
                />
                <ArticleAccordion
                  titleText={t(
                    'privacy-policy-and-cookies.storing-time-of-personal-data.data-subject-rights.object.title',
                  )}
                  content={
                    <Trans
                      i18nKey={
                        'privacy-policy-and-cookies.storing-time-of-personal-data.data-subject-rights.object.description'
                      }
                    />
                  }
                />
                <ArticleAccordion
                  titleText={t(
                    'privacy-policy-and-cookies.storing-time-of-personal-data.data-subject-rights.transfer.title',
                  )}
                  content={
                    <Trans
                      i18nKey={
                        'privacy-policy-and-cookies.storing-time-of-personal-data.data-subject-rights.transfer.description'
                      }
                    />
                  }
                />
                <ArticleAccordion
                  titleText={t(
                    'privacy-policy-and-cookies.storing-time-of-personal-data.data-subject-rights.withdraw-consent.title',
                  )}
                  content={
                    <Trans
                      i18nKey={
                        'privacy-policy-and-cookies.storing-time-of-personal-data.data-subject-rights.withdraw-consent.description'
                      }
                    />
                  }
                />
                <ArticleAccordion
                  titleText={t(
                    'privacy-policy-and-cookies.storing-time-of-personal-data.data-subject-rights.request-of-data.title',
                  )}
                  content={
                    <Trans
                      i18nKey={
                        'privacy-policy-and-cookies.storing-time-of-personal-data.data-subject-rights.request-of-data.description'
                      }
                      components={{
                        CustomLink: (
                          <Link
                            to="https://assets.ctfassets.net/4h0h2z8iv5uv/2odzXnRlO1YPgjQjcIOAHu/033736e6a4288f7cf15983a2175f780e/Rekisteritietojen_tarkastuslomake_suomi.pdf"
                            className="inline-flex text-accent"
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        ),
                      }}
                    />
                  }
                />
                <ArticleAccordion
                  titleText={t(
                    'privacy-policy-and-cookies.storing-time-of-personal-data.data-subject-rights.complaint.title',
                  )}
                  content={
                    <Trans
                      i18nKey={
                        'privacy-policy-and-cookies.storing-time-of-personal-data.data-subject-rights.complaint.description'
                      }
                    />
                  }
                />
              </div>
            </div>
          </>
        ),
      },
      {
        navTitle: t('privacy-policy-and-cookies.obligation-to-provide.title'),
        content: <p>{t('privacy-policy-and-cookies.obligation-to-provide.description')}</p>,
      },
      {
        navTitle: t('privacy-policy-and-cookies.acquiring.title'),
        content: <p>{t('privacy-policy-and-cookies.acquiring.description')}</p>,
      },
      {
        navTitle: t('privacy-policy-and-cookies.automatic-handling.title'),
        content: <p>{t('privacy-policy-and-cookies.automatic-handling.description')}</p>,
      },
    ];
  }, [t]);

  const cookiesSections: ArticleSection[] = React.useMemo(() => {
    return [
      {
        navTitle: t('privacy-cookies.title'), // Semantically there can not be another <h1> tag, therefor this is also <h2>
        content: <></>,
      },
      {
        navTitle: t('privacy-cookies.what.title'),
        content: (
          <div>
            <p>
              <Trans i18nKey="privacy-cookies.what.description-1" />
            </p>
            <ul className="ml-5 my-4 list-disc">
              <li>{t('privacy-cookies.what.list.item-1')}</li>
              <li>{t('privacy-cookies.what.list.item-2')}</li>
              <li>{t('privacy-cookies.what.list.item-3')}</li>
            </ul>
            <p>{t('privacy-cookies.what.description-2')}</p>
          </div>
        ),
      },
      {
        navTitle: t('privacy-cookies.what-for.title'),
        content: (
          <div>
            <p>{t('privacy-cookies.what-for.description-1')}</p>
            <ul className="ml-5 my-4 list-disc">
              <li>{t('privacy-cookies.what-for.list.item-1')}</li>
              <li>{t('privacy-cookies.what-for.list.item-2')}</li>
            </ul>
            <p>
              <Trans i18nKey="privacy-cookies.what-for.description-2" />
            </p>
          </div>
        ),
      },
      {
        navTitle: t('privacy-cookies.3rd-party.title'),
        content: (
          <Trans
            i18nKey="privacy-cookies.3rd-party.description"
            components={{
              CustomLink1: (
                <Link
                  to="https://www.microsoft.com/en-us/privacy/privacystatement"
                  className="inline-flex text-accent"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
              CustomLink2: (
                <Link
                  to="https://policies.google.com/privacy"
                  className="inline-flex text-accent"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
            }}
          />
        ),
      },
      {
        navTitle: t('privacy-cookies.possession.title'),
        content: <Trans i18nKey="privacy-cookies.possession.description" />,
      },
      {
        navTitle: t('privacy-cookies.site-specific.title'),
        content: <Trans i18nKey="privacy-cookies.site-specific.description" />,
      },
      {
        navTitle: t('privacy-cookies.blocking.title'),
        content: <Trans i18nKey="privacy-cookies.blocking.description" />,
      },
    ];
  }, [t]);

  const navChildren = React.useMemo(() => {
    const allSections = [...privacyPolicySections, ...cookiesSections];

    const menuSection: MenuSection = {
      title: t('on-this-page'),
      linkItems: allSections.filter(filterDevSections).map((section) => ({
        label: section.navTitle,
        LinkComponent: getLinkTo(`#${section.navTitle}`),
      })),
    };
    return <PageNavigation menuSection={menuSection} activeIndicator="dot" className={'mb-4'} />;
  }, [t, privacyPolicySections, cookiesSections, filterDevSections]);

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
        {privacyPolicySections.filter(filterDevSections).map((section) => (
          <div key={section.navTitle} className="flex flex-col mb-8">
            <ScrollHeading
              title={section.navTitle}
              heading="h2"
              className={`text-heading-2-mobile sm:text-heading-2 font-poppins ${(section.showNavTitle ?? true) ? 'mb-3' : 'text-transparent text-[0px] size-0'}`}
            />
            <div className="flex flex-col justify-between">{section.content}</div>
          </div>
        ))}

        {cookiesSections.filter(filterDevSections).map((section) => (
          <div key={section.navTitle} className="flex flex-col mb-8">
            <ScrollHeading
              title={section.navTitle}
              heading="h2"
              className={`text-heading-2-mobile sm:text-heading-2 font-poppins ${(section.showNavTitle ?? true) ? 'mb-3' : 'text-transparent text-[0px] size-0'}`}
            />
            <div className="flex flex-col justify-between">{section.content}</div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
};

export default PrivacyPolicy;
