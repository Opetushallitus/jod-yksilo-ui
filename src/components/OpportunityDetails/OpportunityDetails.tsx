import type { components } from '@/api/schema';
import { ActionButton, AiInfo, FavoriteToggle, MainLayout } from '@/components';
import { createLoginDialogFooter } from '@/components/createLoginDialogFooter';
import { ScrollHeading } from '@/components/ScrollHeading/ScrollHeading';
import { useEnvironment } from '@/hooks/useEnvironment';
import { useLoginLink } from '@/hooks/useLoginLink';
import { useModal } from '@/hooks/useModal';
import { type MahdollisuusTyyppi } from '@/routes/types';
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
import { RateAiContent } from '../RateAiContent/RateAiContent';
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
  tyyppi: MahdollisuusTyyppi;
  sections: OpportunityDetailsSection[];
  showAiInfoInTitle?: boolean;
}
/**
 * A generic component for displaying details of an education or job opportunity.
 */
const OpportunityDetails = ({ data, isLoggedIn, tyyppi, sections, showAiInfoInTitle }: OpportunityDetailsProps) => {
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
  const jobData = data as components['schemas']['TyomahdollisuusFullDto'];
  const educationData = data as components['schemas']['KoulutusmahdollisuusFullDto'];

  const { showDialog, closeAllModals } = useModal();
  const { state } = useLocation();
  const loginLink = useLoginLink({
    callbackURL: state?.callbackURL
      ? `/${i18n.language}/${state?.callbackURL}`
      : `/${i18n.language}/${t('slugs.profile.index')}/${t('slugs.profile.front')}`,
  });

  const handleToggleFavorite = async () => {
    if (data?.id) {
      await toggleSuosikki(data.id, tyyppi);
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
    return (
      <div className="flex flex-col gap-6">
        <PageNavigation menuSection={menuSection} activeIndicator="dot" />
        {(jobData.aineisto === 'TMT' || educationData.tyyppi === 'EI_TUTKINTO') && (
          <RateAiContent
            variant={tyyppi === 'TYOMAHDOLLISUUS' ? 'tyomahdollisuus' : 'koulutusmahdollisuus'}
            area={tyyppi === 'TYOMAHDOLLISUUS' ? 'Työmahdollisuus' : 'Koulutusmahdollisuus'}
          />
        )}
        <CounselingCard />
      </div>
    );
  }, [menuSection, jobData.aineisto, educationData.tyyppi, tyyppi]);

  return (
    <MainLayout navChildren={navChildren}>
      {title ? <title>{title}</title> : null}
      <OpportunityHeader
        title={title}
        tyyppi={educationData.tyyppi}
        mahdollisuusTyyppi={tyyppi}
        aineisto={jobData.aineisto}
        showAiInfoInTitle={showAiInfoInTitle}
      />
      {/* Action bar */}
      <div className="flex flex-col sm:flex-row gap-3 my-6 md:mt-7 md:mb-8 md:justify-end items-start print:hidden">
        <FavoriteToggle
          isFavorite={isLoggedIn && !!data?.id && isSuosikki}
          favoriteName={data?.otsikko}
          onToggleFavorite={() =>
            !isLoggedIn
              ? showDialog({
                  title: t('common:login'),
                  description: t('login-for-favorites'),
                  closeParentModal: true,
                  footer: createLoginDialogFooter(t, loginLink, closeAllModals),
                })
              : handleToggleFavorite()
          }
          bgClassName="bg-bg-gray-2"
        />
        {isDev && (
          <ActionButton
            label={t('common:share')}
            icon={<JodShare className="text-accent" />}
            onClick={() => void copyToClipboard(window.location.href)}
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
  aineisto?: components['schemas']['TyomahdollisuusDto']['aineisto'];
  tyyppi?: components['schemas']['KoulutusmahdollisuusDto']['tyyppi'];
  showAiInfoInTitle?: boolean;
}

const OpportunityHeader = ({
  title,
  mahdollisuusTyyppi,
  aineisto,
  tyyppi,
  showAiInfoInTitle = false,
}: OpportunityHeaderProps) => {
  return (
    <div className="flex flex-row">
      <div className="flex items-center justify-center size-9 aspect-square rounded-full text-white bg-secondary-1-dark-2 print:hidden">
        <TitleIcon tyyppi={mahdollisuusTyyppi} aineisto={aineisto} />
      </div>
      <div className="ml-4 flex flex-col justify-center">
        <OpportunityType mahdollisuusTyyppi={mahdollisuusTyyppi} aineisto={aineisto} tyyppi={tyyppi} showTypeTooltip />
        <h1
          data-testid={'opportunity-heading-title'}
          className={`text-heading-1-mobile leading-7 sm:text-heading-1 sm:leading-[36px] hyphens-auto text-secondary-1-dark-2 text-pretty break-words focus:outline-0`}
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
