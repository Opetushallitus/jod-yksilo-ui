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
import {
  JodBuild,
  JodCertificate,
  JodInfoFilled,
  JodPrint,
  JodShare,
  JodWorkPossibilities,
} from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { useShallow } from 'zustand/shallow';
import { CounselingBanner } from '../CounselingBanner/CounselingBanner';
import { IconHeading } from '../IconHeading';
import { RateAiContent } from '../RateAiContent/RateAiContent';
import { TooltipWrapper } from '../Tooltip/TooltipWrapper';

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

const TitleIcon = ({
  tyyppi,
  aineisto,
}: {
  tyyppi: MahdollisuusTyyppi;
  aineisto: 'AMMATTITIETO' | 'TMT' | undefined;
}) => {
  if (tyyppi === 'TYOMAHDOLLISUUS') {
    return aineisto === 'AMMATTITIETO' ? (
      <JodBuild className="text-white" />
    ) : (
      <JodWorkPossibilities className="text-white" />
    );
  }
  return <JodCertificate className="text-white" />;
};

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
  const { sm } = useMediaQueries();
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
    window.print();
  };

  const filterDevSections = React.useCallback(
    (section: OpportunityDetailsSection) => !section.showInDevOnly || (isDev && section.showInDevOnly),
    [isDev],
  );

  const typeText = React.useMemo(() => {
    if (tyyppi === 'TYOMAHDOLLISUUS') {
      return t(`opportunity-type.work.${jobData.aineisto ?? 'TMT'}`);
    } else if (tyyppi === 'KOULUTUSMAHDOLLISUUS') {
      return t(`opportunity-type.education.${educationData.tyyppi}`);
    } else {
      return null;
    }
  }, [tyyppi, t, jobData.aineisto, educationData.tyyppi]);

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
        {jobData.aineisto === 'TMT' && (
          <RateAiContent
            variant={tyyppi === 'TYOMAHDOLLISUUS' ? 'tyomahdollisuus' : 'koulutusmahdollisuus'}
            area={tyyppi === 'TYOMAHDOLLISUUS' ? 'Työmahdollisuus' : 'Koulutusmahdollisuus'}
          />
        )}
        <CounselingBanner />
      </>
    );
  }, [t, sections, filterDevSections, tyyppi, jobData.aineisto]);

  const typeTooltip = React.useMemo(() => {
    if (tyyppi === 'TYOMAHDOLLISUUS') {
      const text = {
        TMT: t('opportunity-tooltip.work.TMT'),
        AMMATTITIETO: t('opportunity-tooltip.work.AMMATTITIETO'),
      }[jobData.aineisto ?? 'TMT'];

      return (
        <div className="font-arial text-white leading-5 text-card-label">
          <p className="mb-2">{typeText}</p>
          <p className="font-normal">{text}</p>
        </div>
      );
    } else if (tyyppi === 'KOULUTUSMAHDOLLISUUS') {
      const text = {
        TUTKINTO: t('opportunity-tooltip.education.TUTKINTO'),
        EI_TUTKINTO: t('opportunity-tooltip.education.EI_TUTKINTO'),
      }[educationData.tyyppi];

      return (
        <div className="font-arial text-white leading-5 text-card-label">
          <p className="mb-2">{tyyppi}</p>
          <p className="font-normal">{text}</p>
        </div>
      );
    } else {
      return null;
    }
  }, [tyyppi, jobData.aineisto, educationData.tyyppi, t, typeText]);

  const OpportunityType = typeText ? (
    <div className="uppercase text-body-sm font-semibold text-primary-gray flex items-center gap-3 mb-4 sm:mb-0">
      {typeText}
      <TooltipWrapper tooltipPlacement="top" tooltipContent={typeTooltip}>
        <JodInfoFilled className="text-secondary-gray" />
      </TooltipWrapper>
    </div>
  ) : null;

  return (
    <MainLayout navChildren={navChildren}>
      {title ? <title>{title}</title> : null}
      <div className="flex flex-col">
        {!sm && OpportunityType}
        <div>
          <IconHeading
            icon={<TitleIcon tyyppi={tyyppi} aineisto={jobData.aineisto} />}
            title={
              <span>
                {title}
                {showAiInfoInTitle && <span className="relative print:hidden ml-2">{<AiInfo />}</span>}
              </span>
            }
            dataTestId="opportunity-details-title"
          />
        </div>

        <div className="flex justify-between flex-wrap gap-y-5 sm:mt-6 sm:mb-8">
          {sm && OpportunityType}

          {/* Action bar */}
          <div className="flex flex-col sm:flex-row sm:gap-7 gap-3 sm:my-0 my-6 print:hidden">
            <FavoriteToggle
              isFavorite={isLoggedIn && !!data?.id && isSuosikki}
              favoriteName={data?.otsikko}
              onToggleFavorite={() =>
                !isLoggedIn
                  ? showDialog({
                      title: t('login'),
                      description: t('login-for-favorites'),
                      closeParentModal: true,
                      footer: createLoginDialogFooter(t, loginLink, closeAllModals),
                    })
                  : handleToggleFavorite()
              }
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
        </div>
      </div>
      {/* Sections */}
      {!!data &&
        sections.filter(filterDevSections).map((section) => (
          <div key={section.navTitle} className="flex flex-col mb-7">
            <ScrollHeading
              title={section.navTitle}
              appendix={section.titleAppendix}
              heading="h2"
              className={`text-heading-2 ${(section.showNavTitle ?? true) ? 'mb-3' : 'text-transparent text-[0px] size-0'}`}
              hasAiContent={section.showAiInfoInTitle}
            />
            <div className="flex flex-row justify-between">{section.content}</div>
            {(section.showDivider ?? true) && <div className="border-b border-border-gray" />}
          </div>
        ))}
    </MainLayout>
  );
};

export default OpportunityDetails;
