import { useLocalizedRoutes } from '@/hooks/useLocalizedRoutes';
import { langLabels, supportedLanguageCodes } from '@/i18n/config';
import { ExternalLinkSection, LinkComponent, NavigationMenu } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { RxExternalLink } from 'react-icons/rx';
import { Link } from 'react-router';
import { useMenuRoutes } from './menuRoutes';

const FrontPageLink = ({ children, className }: LinkComponent) => {
  // Navigate to the landing page
  return (
    <a href="/" className={className}>
      {children}
    </a>
  );
};

const LanguageSelectionLinkComponent = (generateLocalizedPath: (langCode: string) => string, langCode: string) => {
  const LanguageSelectionLink = (props: LinkComponent) => {
    const localizedPath = generateLocalizedPath(langCode);
    return <Link to={localizedPath} {...props} />;
  };
  return LanguageSelectionLink;
};

export const NavMenu = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { generateLocalizedPath } = useLocalizedRoutes();

  const menuItems = useMenuRoutes(onClose);

  const getLanguageSelectionItems = React.useCallback(() => {
    return supportedLanguageCodes.map((code) => ({
      label: langLabels[code] ?? code,
      value: code,
      linkComponent: LanguageSelectionLinkComponent(generateLocalizedPath, code),
    }));
  }, [generateLocalizedPath]);

  const languageSelectionItems = getLanguageSelectionItems();

  const externalLinkSections: ExternalLinkSection[] = [
    {
      title: t('navigation.external.title'),
      linkItems: [
        {
          label: t('navigation.external.ohjaaja.label'),
          url: t('navigation.external.ohjaaja.url'),
          description: t('navigation.external.ohjaaja.description'),
          accentColor: '#66CBD1',
        },
        {
          label: t('navigation.external.tietopalvelu.label'),
          url: t('navigation.external.tietopalvelu.url'),
          description: t('navigation.external.tietopalvelu.description'),
          accentColor: '#EBB8E1',
        },
      ],
    },
  ];

  return (
    <NavigationMenu
      open={open}
      accentColor="#85C4EC"
      FrontPageLinkComponent={FrontPageLink}
      backLabel={t('back')}
      menuItems={menuItems}
      ariaCloseMenu={t('close-menu')}
      openSubMenuLabel={t('open-submenu')}
      frontPageLinkLabel={t('front-page')}
      onClose={onClose}
      selectedLanguage={language}
      languageSelectionItems={languageSelectionItems}
      externalLinkSections={externalLinkSections}
      extraSection={
        <div className="flex flex-col">
          <span className="text-body-sm mb-5 mt-2 flex">{t('navigation.extra.title')}</span>
          <a
            href={t('navigation.extra.urataidot.url', { language })}
            target="_blank"
            rel="noopener noreferrer"
            className="pl-6 pr-3 flex flex-row flex-1 space-between group focus:outline-accent"
          >
            <div className="flex flex-col flex-1 gap-3 py-3">
              <div className="flex flex-row">
                <span className="flex flex-1 group-hover:underline text-button-md">
                  {t('navigation.extra.urataidot.label')}
                </span>
                <RxExternalLink size={24} role="presentation" />
              </div>
            </div>
          </a>
        </div>
      }
    />
  );
};
