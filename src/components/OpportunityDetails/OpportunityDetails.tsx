import type { components } from '@/api/schema';
import { ActionButton, AiInfo, FavoriteToggle, MainLayout } from '@/components';
import { createLoginDialogFooter } from '@/components/createLoginDialogFooter';
import { ScrollHeading } from '@/components/ScrollHeading/ScrollHeading';
import { useEnvironment } from '@/hooks/useEnvironment';
import { useLoginLink } from '@/hooks/useLoginLink';
import { useModal } from '@/hooks/useModal';
import { getMahdollisuusAlityyppi } from '@/routes/Tool/utils';
import type { MahdollisuusAlityyppi, MahdollisuusTyyppi } from '@/routes/types';
import { useToolStore } from '@/stores/useToolStore';
import { copyToClipboard, getLocalizedText } from '@/utils';
import { getLinkTo } from '@/utils/routeUtils';
import { type MenuSection, PageNavigation, useMediaQueries } from '@jod/design-system';
import { JodPrint, JodShare } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { useShallow } from 'zustand/shallow';
import { CounselingCard } from '../CounselingCard/CounselingCard';
import { OpportunityType } from '../OpportunityType/OpportunityType';
import { RateContent } from '../RateContent/RateContent';
import { TitleIcon } from '../TitleIcon/TitleIcon';

export interface OpportunityDetailsSection {
  navTitle: string;
  navTitleHidden?: boolean;
  /* Optional extra text to show after the title. Does not appear in the navigation */
  titleAppendix?: string;
  content: React.ReactNode;
  showAiInfoInTitle?: boolean;
  showInDevOnly?: boolean;
  showDivider?: boolean;
  showNavTitle?: boolean;
}

export interface OpportunityDetailsProps {
  data: components['schemas']['KoulutusmahdollisuusFullDto'] | components['schemas']['TyomahdollisuusFullDto'];
  isLoggedIn: boolean;
  mahdollisuusTyyppi: MahdollisuusTyyppi;
  sections: OpportunityDetailsSection[];
  showAiInfoInTitle?: boolean;
}
/**
 * A generic component for displaying details of an education or job opportunity.
 */
const OpportunityDetails = ({
  data,
  isLoggedIn,
  mahdollisuusTyyppi,
  sections,
  showAiInfoInTitle,
}: OpportunityDetailsProps) => {
  const { isDev } = useEnvironment();
  const { t, i18n } = useTranslation();
  const title = getLocalizedText(data?.otsikko);
  const { lg } = useMediaQueries();
  const { isSuosikki, toggleSuosikki } = useToolStore(
    useShallow((state) => ({
      isSuosikki: state.suosikit?.some((suosikki) => suosikki.kohdeId === data?.id),
      toggleSuosikki: state.toggleSuosikki,
    })),
  );

  const mahdollisuusAlityyppi = getMahdollisuusAlityyppi({ mahdollisuusTyyppi, ...data });

  const { showDialog, closeAllModals } = useModal();
  const { state } = useLocation();
  const loginLink = useLoginLink({
    callbackURL: state?.callbackURL
      ? `/${i18n.language}/${state?.callbackURL}`
      : `/${i18n.language}/${t('slugs.profile.index')}/${t('slugs.profile.front')}`,
  });

  const handleToggleFavorite = async () => {
    if (data?.id) {
      await toggleSuosikki(data.id, mahdollisuusTyyppi);
    }
  };

  const doPrint = () => {
    globalThis.print();
  };

  const filterDevSections = React.useCallback(
    (section: OpportunityDetailsSection) => !section.showInDevOnly || (isDev && section.showInDevOnly),
    [isDev],
  );

  const menuSection: MenuSection = React.useMemo(
    () => ({
      title: t('on-this-page'),
      linkItems: sections.filter(filterDevSections).map((section) => ({
        label: section.navTitle,
        linkComponent: getLinkTo(`#${section.navTitle}`),
      })),
    }),
    [sections, filterDevSections, t],
  );

  const navChildren = React.useMemo(() => {
    const jobVariant = mahdollisuusAlityyppi === 'MUU_TYOMAHDOLLISUUS' ? 'tyomahdollisuus' : 'ammatti';
    const variant = mahdollisuusTyyppi === 'TYOMAHDOLLISUUS' ? jobVariant : 'koulutusmahdollisuus';
    return (
      <div className="flex flex-col gap-6">
        <PageNavigation menuSection={menuSection} activeIndicator="dot" />
        {(mahdollisuusAlityyppi === 'MUU_TYOMAHDOLLISUUS' ||
          mahdollisuusAlityyppi === 'AMMATTI' ||
          mahdollisuusAlityyppi === 'MUU_KOULUTUS') && (
          <RateContent
            variant={variant}
            area={mahdollisuusTyyppi === 'TYOMAHDOLLISUUS' ? 'Työmahdollisuus' : 'Koulutusmahdollisuus'}
          />
        )}
        <CounselingCard />
      </div>
    );
  }, [menuSection, mahdollisuusAlityyppi, mahdollisuusTyyppi]);

  return (
    <MainLayout navChildren={navChildren}>
      {title ? <title>{title}</title> : null}
      <OpportunityHeader
        title={title}
        mahdollisuusTyyppi={mahdollisuusTyyppi}
        mahdollisuusAlityyppi={mahdollisuusAlityyppi}
        showAiInfoInTitle={showAiInfoInTitle}
      />
      {/* Action bar */}
      <div className="flex flex-col sm:flex-row gap-3 my-6 md:mt-7 md:mb-8 md:justify-end items-start print:hidden">
        <FavoriteToggle
          isFavorite={isLoggedIn && !!data?.id && isSuosikki}
          favoriteName={data?.otsikko}
          onToggleFavorite={() =>
            isLoggedIn
              ? handleToggleFavorite()
              : showDialog({
                  title: t('common:login'),
                  description: t('login-for-favorites'),
                  closeParentModal: true,
                  footer: createLoginDialogFooter(t, loginLink, closeAllModals),
                })
          }
          bgClassName="bg-bg-gray-2"
        />
        {isDev && (
          <ActionButton
            label={t('common:share')}
            icon={<JodShare className="text-accent" />}
            onClick={() => void copyToClipboard(globalThis.location.href)}
            className="bg-bg-gray-2"
          />
        )}
        {!!globalThis.print && (
          <ActionButton
            label={t('common:print')}
            icon={<JodPrint className="text-accent" />}
            onClick={doPrint}
            className="bg-bg-gray-2"
          />
        )}
      </div>

      {!lg && (
        <div className="mb-8">
          <PageNavigation menuSection={menuSection} activeIndicator="dot" collapsed />
        </div>
      )}
      {/* Sections */}
      {!!data &&
        sections.filter(filterDevSections).map((section) => (
          <div key={section.navTitle} className="flex flex-col mb-7">
            <ScrollHeading
              title={section.navTitle}
              appendix={section.titleAppendix}
              heading="h2"
              className={`text-heading-2 ${(section.showNavTitle ?? true) ? 'mb-3' : 'text-transparent text-[0px] size-0'}`}
            />
            <div className="flex flex-row justify-between">{section.content}</div>
            {(section.showDivider ?? true) && <div className="border-b border-border-gray" />}
          </div>
        ))}
    </MainLayout>
  );
};

interface OpportunityHeaderProps {
  title: string;
  mahdollisuusTyyppi: MahdollisuusTyyppi;
  mahdollisuusAlityyppi: MahdollisuusAlityyppi;
  showAiInfoInTitle?: boolean;
}

const OpportunityHeader = ({
  title,
  mahdollisuusTyyppi,
  mahdollisuusAlityyppi,
  showAiInfoInTitle = false,
}: OpportunityHeaderProps) => {
  const bgColorClassName =
    mahdollisuusTyyppi === 'KOULUTUSMAHDOLLISUUS' ? 'bg-secondary-2-dark' : 'bg-secondary-4-dark-2';
  const textColorClassName =
    mahdollisuusTyyppi === 'KOULUTUSMAHDOLLISUUS' ? 'text-secondary-2-dark' : 'text-secondary-4-dark-2';
  return (
    <div className="flex flex-row">
      <div
        className={`flex items-center justify-center size-9 aspect-square rounded-full text-white ${bgColorClassName} print:hidden`}
      >
        <TitleIcon mahdollisuusAlityyppi={mahdollisuusAlityyppi} />
      </div>
      <div className="ml-4 flex flex-col justify-center">
        <OpportunityType mahdollisuusAlityyppi={mahdollisuusAlityyppi} showTypeTooltip />
        <h1
          data-testid={'opportunity-heading-title'}
          className={`text-heading-1-mobile leading-7 sm:text-heading-1 sm:leading-[36px] hyphens-auto ${textColorClassName} text-pretty break-words focus:outline-0`}
        >
          {title}
          {showAiInfoInTitle && (
            <div className="ml-2 print:hidden inline *:align-top">
              {
                <AiInfo
                  type={mahdollisuusTyyppi === 'KOULUTUSMAHDOLLISUUS' ? 'education-opportunity' : 'job-opportunity'}
                />
              }
            </div>
          )}
        </h1>
      </div>
    </div>
  );
};

export default OpportunityDetails;
