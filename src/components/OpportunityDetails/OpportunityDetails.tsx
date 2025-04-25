import { components } from '@/api/schema';
import {
  ActionButton,
  AiInfo,
  FavoriteToggle,
  LoginModal,
  MainLayout,
  RoutesNavigationList,
  SimpleNavigationList,
} from '@/components';
import { ScrollHeading } from '@/components/ScrollHeading/ScrollHeading';
import { useEnvironment } from '@/hooks/useEnvironment';
import { type MahdollisuusTyyppi } from '@/routes/types';
import { useToolStore } from '@/stores/useToolStore';
import { copyToClipboard, getLocalizedText } from '@/utils';
import React, { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { MdCompareArrows, MdOutlinePrint, MdOutlineRoute, MdOutlineShare } from 'react-icons/md';

export interface OpportunityDetailsSection {
  navTitle: string;
  content: JSX.Element;
  hasAiContent?: boolean;
  showInDevOnly?: boolean;
}

export interface OpportunityDetailsProps {
  data: components['schemas']['KoulutusmahdollisuusFullDto'] | components['schemas']['TyomahdollisuusFullDto'];
  isLoggedIn: boolean;
  tyyppi: MahdollisuusTyyppi;
  sections: OpportunityDetailsSection[];
  showAiInfoInTitle?: boolean;
}
/**
 * A generic component for displaying details of an education or job opportunity.
 */
const OpportunityDetails = ({ data, isLoggedIn, tyyppi, sections, showAiInfoInTitle }: OpportunityDetailsProps) => {
  const { isDev } = useEnvironment();
  const [loginModalOpen, setLoginModalOpen] = React.useState(false);
  const { t } = useTranslation();
  const title = getLocalizedText(data?.otsikko);
  const toolStore = useToolStore();
  const [isFavorite, setIsFavorite] = React.useState(false);

  React.useEffect(() => {
    setIsFavorite(toolStore.suosikit?.some((suosikki) => suosikki.kohdeId === data?.id));
  }, [toolStore.suosikit, data?.id]);

  const handleLoginRequired = () => {
    setLoginModalOpen(true);
  };

  const handleToggleFavorite = async () => {
    if (data?.id) {
      await toolStore.toggleSuosikki(data.id, tyyppi);
    }
  };

  const notImplemented = () => {
    // eslint-disable-next-line no-console
    console.log('Feature not implemented');
  };

  const doPrint = () => {
    window.print();
  };

  const filterDevSections = (section: OpportunityDetailsSection) =>
    !section.showInDevOnly || (isDev && section.showInDevOnly);

  const routes = sections.filter(filterDevSections).map((section) => ({
    active: false,
    name: section.navTitle,
    path: `#${section.navTitle}`,
    replace: true,
  }));

  return (
    <MainLayout
      navChildren={
        <SimpleNavigationList title={t(`opportunity-description-${tyyppi}`)} collapsible>
          <RoutesNavigationList routes={routes} />
        </SimpleNavigationList>
      }
    >
      {loginModalOpen && <LoginModal onClose={() => setLoginModalOpen(false)} isOpen={loginModalOpen} />}
      {title && <title>{title}</title>}
      <div className="flex flex-row justify-between items-center mb-5">
        <h1 className="text-heading-2 sm:text-heading-1">{title}</h1>
        {showAiInfoInTitle && (
          <span className="print:hidden mr-2">
            <AiInfo />
          </span>
        )}
      </div>

      {/* Action bar */}
      <div className="flex flex-row flex-wrap gap-x-7 gap-y-5 my-8 print:hidden">
        <FavoriteToggle
          isFavorite={isFavorite}
          onToggleFavorite={() => (!isLoggedIn ? handleLoginRequired() : handleToggleFavorite())}
        />
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
            onClick={() => void copyToClipboard(window.location.href)}
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

      {/* Sections */}
      <div className="flex flex-col gap-7">
        {!!data &&
          sections.filter(filterDevSections).map((section) => (
            <div key={section.navTitle}>
              <ScrollHeading
                title={section.navTitle}
                heading="h2"
                className="text-heading-2"
                hasAiContent={section.hasAiContent}
              />
              <div className="flex flex-row justify-between">{section.content}</div>
            </div>
          ))}
      </div>
    </MainLayout>
  );
};

export default OpportunityDetails;
