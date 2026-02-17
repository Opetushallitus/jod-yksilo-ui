import type { components } from '@/api/schema';
import { AiInfo, Breadcrumb, OpportunityCard } from '@/components';
import { IconHeading } from '@/components/IconHeading';
import { NavLinkBasedOnAuth } from '@/components/NavMenu/NavLinkBasedOnAuth';
import { OpportunityCardSkeleton } from '@/components/OpportunityCard';
import { RateAiContent } from '@/components/RateAiContent/RateAiContent';
import { TooltipWrapper } from '@/components/Tooltip/TooltipWrapper';
import { useInteractionMethod } from '@/hooks/useInteractionMethod';
import { useMenuClickHandler } from '@/hooks/useMenuClickHandler';
import AdditionalSupport from '@/routes/Tool/AdditionalSupport';
import { useToolStore } from '@/stores/useToolStore';
import { getLocalizedText } from '@/utils';
import { Button, cx, Spinner, tidyClasses, useMediaQueries, useNoteStack } from '@jod/design-system';
import { JodArrowRight, JodClose, JodCompass, JodInfo, JodSettings } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useRouteLoaderData } from 'react-router';
import { useShallow } from 'zustand/shallow';
import { getTypeSlug } from '../Profile/utils';
import Competences from './Competences';
import ToolAccordion from './components/ToolAccordion';
import { useTool } from './hook/useTool';
import Interests from './Interests';
import type { ToolLoaderData } from './loader';
import { OnboardingTour } from './OnboardingTour';
import ProfileImportExport from './ProfileImportExport';
import ToolSettings from './ToolSettings';
import YourOpportunitiesPagination from './YourOpportunitiesPagination';

const ExploreOpportunities = () => {
  const { t, i18n } = useTranslation();
  const {
    ammattiryhmaNimet,
    mahdollisuusEhdotukset,
    mixedMahdollisuudet,
    suosikit,
    filters,
    isLoading,
    totalItems,
    toggleSuosikki,
    updateEhdotuksetAndTyomahdollisuudet,
  } = useToolStore(
    useShallow((state) => ({
      ammattiryhmaNimet: state.ammattiryhmaNimet,
      mahdollisuusEhdotukset: state.mahdollisuusEhdotukset,
      mixedMahdollisuudet: state.mixedMahdollisuudet,
      suosikit: state.suosikit,
      filters: state.filters,
      isLoading: state.ehdotuksetLoading || state.mahdollisuudetLoading,
      totalItems: state.filteredMahdollisuudetCount,
      toggleSuosikki: state.toggleSuosikki,
      updateEhdotuksetAndTyomahdollisuudet: state.updateEhdotuksetAndTyomahdollisuudet,
    })),
  );

  const scrollRef = React.useRef<HTMLUListElement>(null);
  const { isLoggedIn } = useLoaderData<ToolLoaderData>();
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const settingsButtonRef = React.useRef<HTMLButtonElement>(null);
  const firstSettingRef = useMenuClickHandler(() => setSettingsOpen(false), settingsButtonRef);
  const isMouseInteraction = useInteractionMethod();
  const { lg } = useMediaQueries();

  // Move focus to menu content when opened
  React.useEffect(() => {
    globalThis._paq?.push(['trackEvent', 'yksilo.Kartoitustyökalut', 'Klikkaus', 'Säätimet']);
    if (settingsOpen && !isMouseInteraction && firstSettingRef.current) {
      const firstChild = firstSettingRef.current.querySelector('button');
      if (firstChild) {
        (firstChild as HTMLElement).focus();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsOpen]);

  const onCloseSettings = () => {
    updateEhdotuksetAndTyomahdollisuudet(isLoggedIn, false);
    setSettingsOpen(false);
  };

  const onToggleSettings = () => {
    if (settingsOpen) {
      onCloseSettings();
    } else {
      setSettingsOpen(true);
    }
  };

  const getTotalFilterCount = React.useCallback(() => {
    return Object.values(filters).reduce((total, filter) => total + (filter?.length ?? 0), 0);
  }, [filters]);

  const toggleFiltersText = React.useMemo(() => {
    if (settingsOpen) return t('tool.settings.toggle-title-open');

    const count = getTotalFilterCount();
    const filterCount = count > 0 ? ` (${count})` : '';
    return `${t('tool.settings.toggle-title-closed')}${filterCount}`;
  }, [getTotalFilterCount, settingsOpen, t]);

  const statusText = isLoading ? t('tool.updating') : t('tool.opportunities-loaded', { count: totalItems });
  const { permanentNotesHeight } = useNoteStack();
  const top = `${(lg ? 68 : 120) + permanentNotesHeight}px`;

  return (
    <>
      <div className="sticky not:lg:z-10 bg-bg-gray -mx-1 px-1 lg:pt-4" style={{ top }}>
        <div className="flex items-center justify-end h-9 lg:pb-4 not-lg:bg-white not-lg:w-full lg:justify-between not-lg:mb-3 not-lg:px-4">
          {lg && (
            <h2 id="opportunities-title" tabIndex={-1} className="text-heading-2-mobile sm:text-heading-2">
              {t('tool.your-opportunities.title')}
            </h2>
          )}
          <div className="flex gap-6 h-fit">
            <button
              aria-label={toggleFiltersText}
              className={tidyClasses(
                `cursor-pointer flex items-center gap-x-3 text-nowrap rounded-2xl px-5 py-1 font-semibold text-[14px] leading-[18px] hover:underline bg-bg-gray-2`,
              )}
              onClick={onToggleSettings}
              type="button"
              data-testid="open-tool-settings"
            >
              {settingsOpen ? <JodClose className="text-accent!" /> : <JodSettings className="text-accent!" />}
              {toggleFiltersText}
            </button>
          </div>
        </div>
      </div>

      {settingsOpen && (
        <ToolSettings ref={firstSettingRef} isOpen={settingsOpen} onClose={onCloseSettings} isModal={!lg} />
      )}

      <section aria-busy={isLoading}>
        <div role="status" aria-live="polite" className="sr-only">
          {statusText}
        </div>

        {isLoading ? (
          <div aria-hidden="true" className="flex flex-col gap-5 sm:gap-3 mb-8">
            <OpportunityCardSkeleton />
            <OpportunityCardSkeleton />
          </div>
        ) : (
          <>
            <ul
              id="tool-your-opportunities-list"
              ref={scrollRef}
              className="flex flex-col gap-5 sm:gap-3"
              style={{
                scrollMarginTop: '140px',
              }}
              data-testid="tool-opportunities-list"
            >
              {mixedMahdollisuudet.map((mahdollisuus) => {
                const { id, mahdollisuusTyyppi } = mahdollisuus;
                const ehdotus = mahdollisuusEhdotukset?.[id];
                const isFavorite = suosikit?.find((s) => s.kohdeId === id) !== undefined;

                return ehdotus ? (
                  <OpportunityCard
                    key={id}
                    as="li"
                    from="tool"
                    to={`/${i18n.language}/${getTypeSlug(mahdollisuusTyyppi)}/${id}`}
                    isFavorite={isFavorite}
                    isLoggedIn={isLoggedIn}
                    toggleFavorite={() => void toggleSuosikki(id, ehdotus.tyyppi)}
                    name={getLocalizedText(mahdollisuus.otsikko)}
                    description={getLocalizedText(mahdollisuus.tiivistelma)}
                    matchValue={ehdotus?.pisteet}
                    matchLabel={t('fit')}
                    headingLevel="h3"
                    ammattiryhma={mahdollisuus.ammattiryhma}
                    ammattiryhmaNimet={ammattiryhmaNimet}
                    aineisto={mahdollisuus.aineisto}
                    tyyppi={mahdollisuus.tyyppi}
                    kesto={mahdollisuus.kesto}
                    yleisinKoulutusala={mahdollisuus.yleisinKoulutusala}
                    type={mahdollisuusTyyppi}
                    rateId={id}
                  />
                ) : null;
              })}
            </ul>

            {!lg && <UpdateEhdotuksetAndTyomahdollisuudetButton className="mt-5 mb-8 border-t-2 border-bg-gray" />}

            <YourOpportunitiesPagination scrollRef={scrollRef} ariaLabel={t('pagination.bottom')} className="my-7" />
          </>
        )}
      </section>
    </>
  );
};

const ProfileLinkComponent = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  const rootLoaderData = useRouteLoaderData('root') as components['schemas']['YksiloCsrfDto'];
  const { t, i18n } = useTranslation();

  return (
    <NavLinkBasedOnAuth
      className={className}
      to={`${t('slugs.profile.index')}/${t('slugs.profile.front')}`}
      shouldLogin={!rootLoaderData}
      lang={i18n.language}
    >
      {children}
    </NavLinkBasedOnAuth>
  );
};

const UpdateEhdotuksetAndTyomahdollisuudetButton = ({ id, className }: { id?: string; className?: string }) => {
  const { t } = useTranslation();
  const { isLoggedIn } = useLoaderData<ToolLoaderData>();
  const { settingsHaveChanged, isLoading, updateEhdotuksetAndTyomahdollisuudet } = useToolStore(
    useShallow((state) => ({
      settingsHaveChanged: state.settingsHaveChanged,
      isLoading: state.ehdotuksetLoading || state.mahdollisuudetLoading,
      updateEhdotuksetAndTyomahdollisuudet: state.updateEhdotuksetAndTyomahdollisuudet,
    })),
  );

  const buttonRef = React.useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = React.useState(false);

  React.useEffect(() => {
    if (!buttonRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When element is intersecting with viewport from bottom, it's not sticky
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: [1], rootMargin: '0px 0px -1px 0px' },
    );

    observer.observe(buttonRef.current);

    return () => observer.disconnect();
  }, []);

  const onUpdateResults = async (loading: boolean) => {
    if (loading) {
      return;
    }
    globalThis._paq?.push(['trackEvent', 'yksilo.Kartoitustyökalut', 'Klikkaus', 'Päivitys']);
    await updateEhdotuksetAndTyomahdollisuudet(isLoggedIn, false);
  };

  const updateButtonLabel = isLoading ? t('updating-list') : t('update');
  return (
    <div
      ref={buttonRef}
      id={id}
      className={`sticky bottom-0 ${isSticky ? 'rounded-t-none' : 'rounded-t-md'} rounded-b-md bg-white py-5 flex justify-center items-center ${className}`}
    >
      <div className="flex items-center gap-2 py-2">
        <Button
          size="sm"
          label={updateButtonLabel}
          variant="accent"
          onClick={() => onUpdateResults(isLoading)}
          disabled={!settingsHaveChanged}
          icon={isLoading ? <Spinner color="white" size={20} /> : undefined}
          iconSide={isLoading ? 'right' : undefined}
          testId="update-opportunities"
        />

        <TooltipWrapper
          tooltipPlacement="top"
          tooltipContent={<div className="text-body-xs max-w-[290px] leading-5">{t('tool.update-tooltip-info')}</div>}
        >
          <JodInfo size={18} className="text-secondary-gray" />
        </TooltipWrapper>
      </div>
    </div>
  );
};

const YourInfoGroup = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col gap-4 lg:gap-3 lg:bg-[#CCD1D8] lg:rounded-[12px] lg:p-3">{children}</div>;
};
const YourInfoGroupSeparator = () => {
  const { lg } = useMediaQueries();
  return lg ? null : <div className="border-t-4 border-primary-light-2 mx-5" />;
};

const YourInfo = () => {
  const { lg } = useMediaQueries();
  const { t } = useTranslation();
  const { isLoggedIn } = useLoaderData<ToolLoaderData>();

  const { mappedKiinnostukset, mappedOsaamiset, profileCompetencesCount } = useTool();

  const kiinnostuksetCount = mappedKiinnostukset.length;
  const osaamisetCount = mappedOsaamiset.length;

  return (
    <>
      <div id="tool-your-info" className="flex flex-col gap-4">
        <YourInfoGroup>
          <div id="tool-your-info-group-1" className="flex flex-col gap-4 lg:gap-3">
            <ToolAccordion title={t('tool.interests', { count: kiinnostuksetCount })} testId="tool-interests-accordion">
              <Interests />
            </ToolAccordion>

            <ToolAccordion
              title={t('tool.map-your-skills', { count: osaamisetCount })}
              testId="tool-competences-accordion"
            >
              <Competences />
            </ToolAccordion>

            <ToolAccordion
              title={t('tool.competency-profile.title', { count: profileCompetencesCount })}
              testId="tool-profile-accordion"
            >
              <ProfileImportExport />
            </ToolAccordion>
          </div>

          <UpdateEhdotuksetAndTyomahdollisuudetButton
            id="tool-update-opportunities-button"
            className={cx('border-t-2 rounded', lg && 'border-primary-light-2', !lg && 'border-bg-gray')}
          />
        </YourInfoGroup>

        <YourInfoGroupSeparator />

        <YourInfoGroup>
          <ToolAccordion title={t('tool.tools.title')} testId="tool-tools-accordion">
            <AdditionalSupport />
          </ToolAccordion>
        </YourInfoGroup>
      </div>
      <div className="lg:mx-3">
        <RateAiContent variant="kohtaanto" area="Kohtaanto työkalu" size="md" />
      </div>

      <div className="flex flex-col bg-secondary-1-dark-2 rounded-md px-5 py-6 gap-3 text-white lg:mx-3">
        <h2 className="text-heading-2">
          {isLoggedIn ? t('profile.banner.title.logged-in') : t('profile.banner.title.unlogged')}
        </h2>
        <div className="flex flex-col gap-6">
          <p className="text-body-lg">
            {isLoggedIn ? t('profile.banner.description.logged-in') : t('profile.banner.description.unlogged')}
          </p>
          <Button
            label={isLoggedIn ? t('profile.banner.link-text.logged-in') : t('profile.banner.link-text.unlogged')}
            variant="white"
            size="lg"
            linkComponent={ProfileLinkComponent}
            iconSide="right"
            testId="tool-go-to-profile"
            icon={<JodArrowRight />}
            className="w-fit"
          />
        </div>
      </div>
    </>
  );
};

const Tool = () => {
  type TabName = 'info' | 'opportunities';
  const STORAGE_KEY = 'jod_tool_last_active_tab';
  const DEFAULT_TAB: TabName = 'info';

  const { t } = useTranslation();
  const { lg } = useMediaQueries();
  const savedTab: TabName = React.useMemo(() => {
    try {
      const stored = globalThis.sessionStorage.getItem(STORAGE_KEY) as TabName;
      return stored ?? DEFAULT_TAB;
    } catch {
      return DEFAULT_TAB;
    }
  }, [STORAGE_KEY]);

  const [currentTab, setCurrentTab] = React.useState<TabName>(savedTab);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [onboardingTourActive, setOnboardingTourActive] = React.useState(false);

  React.useEffect(() => {
    const validTabs: TabName[] = ['info', 'opportunities'];

    if (savedTab && validTabs.includes(savedTab)) {
      setCurrentTab(savedTab);
    }
  }, [savedTab]);

  /**
   * Hide AI chatbot from the Tool page
   */
  React.useEffect(() => {
    let chatBotElement = document.getElementById('ai-agent-component-root');
    let originalDisplay = '';

    if (chatBotElement) {
      // Chatbot already exists, hide it immediately
      originalDisplay = chatBotElement.style.display || '';
      chatBotElement.style.display = 'none';
    } else {
      // Chatbot doesn't exist yet - wait for it with MutationObserver
      const observer = new MutationObserver(() => {
        chatBotElement = document.getElementById('ai-agent-component-root');
        if (chatBotElement) {
          originalDisplay = chatBotElement.style.display || '';
          chatBotElement.style.display = 'none';
        }
      });

      // Observe the entire document for child additions
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      return () => {
        observer.disconnect();
        if (chatBotElement) {
          chatBotElement.style.display = originalDisplay;
        }
      };
    }

    // Cleanup when component unmounts
    return () => {
      if (chatBotElement) {
        chatBotElement.style.display = originalDisplay;
      }
    };
  }, []);

  const setTab = React.useCallback(
    (tab: TabName) => {
      setCurrentTab(tab);
      globalThis.sessionStorage.setItem(STORAGE_KEY, tab);

      if (scrollRef.current && onboardingTourActive) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [onboardingTourActive],
  );

  const tabs = React.useMemo(() => {
    const tabs = [
      {
        text: t('tool.my-own-data.title'),
        active: currentTab === 'info',
        onclick: () => setTab('info'),
      },
      {
        text: `${t('tool.your-opportunities.title')}`,
        active: currentTab === 'opportunities',
        onclick: () => setTab('opportunities'),
      },
    ];

    return tabs;
  }, [currentTab, setTab, t]);

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      switch (event.key) {
        case 'Home':
        case 'ArrowLeft':
          if (index > 0) {
            setTab('info');
            (event.currentTarget.previousElementSibling as HTMLElement)?.focus();
          }
          event.stopPropagation();
          event.preventDefault();
          break;
        case 'End':
        case 'ArrowRight':
          if (index < tabs.length - 1) {
            setTab('opportunities');
            (event.currentTarget.nextElementSibling as HTMLElement)?.focus();
          }
          event.stopPropagation();
          event.preventDefault();
          break;
        default:
          break;
      }
    },
    [setTab, tabs.length],
  );

  const { permanentNotesHeight } = useNoteStack();
  const top = `${(lg ? 68 : 66) + permanentNotesHeight}px`;

  return (
    <main role="main" id="jod-main" className="mx-auto w-full max-w-[1140px] px-5 pb-6 pt-11" data-testid="tool-main">
      <div className="mb-6">
        <Breadcrumb />
      </div>
      <div className="flex">
        <IconHeading icon={<JodCompass className="text-white" />} title={t('tool.title')} testId="tool-title" />
        <div className="ml-1 print:hidden">{<AiInfo type="tool" />}</div>
      </div>
      <p className="text-body-lg-mobile sm:text-body-lg mb-6 max-w-[700px]" ref={scrollRef}>
        {t('tool.description')}
        <OnboardingTour setOnboardingTourActive={setOnboardingTourActive} setCurrentTab={setCurrentTab} />
      </p>
      <title>{t('tool.title')}</title>
      {lg ? (
        // Desktop
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-7">
          <div className="col-span-1 lg:col-span-5 max-h-fit">
            <div
              className="sticky z-10 bg-bg-gray lg:pt-4 lg:-mx-3 lg:px-3"
              style={{
                top,
              }}
            >
              <h2 className="sm:text-heading-2 text-heading-2-mobile h-9">{t('tool.my-own-data.title')}</h2>
            </div>
            <div className="flex flex-col gap-4 -mx-3">
              <YourInfo />
            </div>
          </div>
          <div className="col-span-1 lg:col-span-7">
            {!lg && (
              <h2 id="opportunities-title" tabIndex={-1} className="text-heading-3-mobile sm:text-heading-3">
                {t('tool.your-opportunities.title')}
              </h2>
            )}
            <ExploreOpportunities />
          </div>
        </div>
      ) : (
        // Mobile
        <>
          <div className="sticky z-10 -mx-5 pt-4 bg-bg-gray" style={{ top }}>
            <div id="tool-tabs" role="tablist" className="flex text-button-sm select-none gap-3 px-5">
              {/* eslint-disable-next-line react-hooks/refs */}
              {tabs.map((tab, index) => (
                <button
                  type="button"
                  data-testid={`toggle-tab-${tab.text}`}
                  key={tab.text}
                  onClick={tab.onclick}
                  role="tab"
                  aria-controls={`tabpanel-${currentTab}`}
                  tabIndex={currentTab === 'info' ? undefined : -1}
                  onKeyDown={(event) => onKeyDown(event, index)}
                  id={`tab-${tab.text}`}
                  aria-selected={tab.active}
                  className={cx('flex justify-center items-center bg-white py-4 grow rounded-t cursor-pointer', {
                    'text-accent': tab.active,
                    'bg-bg-gray-2': !tab.active,
                  })}
                >
                  {tab.text}
                </button>
              ))}
            </div>
          </div>
          <div
            id={`tabpanel-${currentTab}`}
            role="tabpanel"
            tabIndex={0}
            aria-labelledby="tab-1"
            className={cx('flex flex-col w-full')}
          >
            {currentTab === 'info' ? (
              <div className="flex flex-col gap-5 -mx-5">
                <YourInfo />
              </div>
            ) : (
              <div className="-mx-5">
                <ExploreOpportunities />
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
};

export default Tool;
