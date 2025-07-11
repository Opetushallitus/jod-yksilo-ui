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
import RateAiContent from '@/components/RateAiContent/RateAiContent';
import { ScrollHeading } from '@/components/ScrollHeading/ScrollHeading';
import { useEnvironment } from '@/hooks/useEnvironment';
import { type MahdollisuusTyyppi } from '@/routes/types';
import { useToolStore } from '@/stores/useToolStore';
import { copyToClipboard, getLocalizedText } from '@/utils';
import { JodPrint, JodShare } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface OpportunityDetailsSection {
  navTitle: string;
  /* Optional extra text to show after the title. Does not appear in the navigation */
  titleAppendix?: string;
  content: React.ReactNode;
  showAiInfoInTitle?: boolean;
  showAiRating?: boolean;
  showInDevOnly?: boolean;
  showDivider?: boolean;
  showNavTitle?: boolean;
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
        <SimpleNavigationList title={getLocalizedText(data.otsikko)} collapsible>
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

      {(data as components['schemas']['TyomahdollisuusFullDto']).aineisto ? (
        <div className="uppercase font-arial">
          {(data as components['schemas']['TyomahdollisuusFullDto']).aineisto === 'TMT'
            ? t('opportunity-type.work')
            : t('opportunity-type.occupation')}
        </div>
      ) : null}
      {/* Action bar */}
      <div className="flex flex-row flex-wrap gap-x-7 gap-y-5 my-6 print:hidden">
        <FavoriteToggle
          isFavorite={isFavorite}
          onToggleFavorite={() => (!isLoggedIn ? handleLoginRequired() : handleToggleFavorite())}
        />
        {isDev && (
          <ActionButton
            label={t('share')}
            icon={<JodShare className="text-accent" />}
            onClick={() => void copyToClipboard(window.location.href)}
          />
        )}
        {!!window.print && (
          <ActionButton label={t('print')} icon={<JodPrint className="text-accent" />} onClick={doPrint} />
        )}
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-7">
        {!!data &&
          sections.filter(filterDevSections).map((section) => (
            <div key={section.navTitle} className="flex flex-col">
              <ScrollHeading
                title={section.navTitle}
                appendix={section.titleAppendix}
                heading="h2"
                className={`text-heading-2 ${(section.showNavTitle ?? true) ? '' : 'text-transparent text-[0px] size-0'}`}
                hasAiContent={section.showAiInfoInTitle}
              />
              <div className="flex flex-row justify-between">{section.content}</div>
              {(section.showAiRating ?? false) && isDev && (
                <div className="my-7">
                  <RateAiContent onDislike={notImplemented} onLike={notImplemented} />
                </div>
              )}
              {(section.showDivider ?? true) && <div className="mt-8 border-b" />}
            </div>
          ))}
      </div>
    </MainLayout>
  );
};

export default OpportunityDetails;
