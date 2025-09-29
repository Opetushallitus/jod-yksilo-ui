import { useLocalizedRoutes } from '@/hooks/useLocalizedRoutes';
import { langLabels, supportedLanguageCodes } from '@/i18n/config';
import { ExternalLinkSection, LinkComponent, NavigationMenu, type MenuSection } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useMenuRoutes } from './menuRoutes';

const PortalLink = ({ children, className }: LinkComponent) => {
  const {
    i18n: { language },
  } = useTranslation();

  return (
    <a href={`/${language}`} className={className}>
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

  const menuSection: MenuSection = {
    title: t('navigation.main-section.title'),
    linkItems: useMenuRoutes(onClose),
  };

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
          accentColor: '#00818A',
        },
        {
          label: t('navigation.external.tietopalvelu.label'),
          url: t('navigation.external.tietopalvelu.url'),
          description: t('navigation.external.tietopalvelu.description'),
          accentColor: '#AD4298',
        },
      ],
    },
    {
      title: t('navigation.extra.title'),
      linkItems: [
        {
          label: t('navigation.extra.palveluhakemisto.label'),
          url: t('navigation.extra.palveluhakemisto.url'),
        },
        {
          label: t('navigation.extra.urataidot.label'),
          url: t('navigation.extra.urataidot.url'),
        },
      ],
    },
  ];

  return (
    <NavigationMenu
      open={open}
      PortalLinkComponent={PortalLink}
      portalLinkLabel={t('competency-path-portal')}
      menuSection={menuSection}
      ariaCloseMenu={t('close-menu')}
      openSubMenuLabel={t('open-submenu')}
      onClose={onClose}
      selectedLanguage={language}
      languageSelectionItems={languageSelectionItems}
      externalLinkSections={externalLinkSections}
      languageSelectionTitle={t('language-selection')}
      serviceVariant="yksilo"
      data-testid="nav-menu"
    />
  );
};
