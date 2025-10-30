import type { components } from '@/api/schema';
import { Breadcrumb, OpportunityCard } from '@/components';
import { IconHeading } from '@/components/IconHeading';
import { NavLinkBasedOnAuth } from '@/components/NavMenu/NavLinkBasedOnAuth';
import { RateAiContent } from '@/components/RateAiContent/RateAiContent';
import { useInteractionMethod } from '@/hooks/useInteractionMethod';
import { useMenuClickHandler } from '@/hooks/useMenuClickHandler';
import AdditionalSupport from '@/routes/Tool/AdditionalSupport';
import CategorizedCompetenceTagList from '@/routes/Tool/CategorizedCompetenceTagList';
import { useToolStore } from '@/stores/useToolStore';
import { getLocalizedText } from '@/utils';
import { Button, cx, Spinner, useMediaQueries } from '@jod/design-system';
import { JodArrowRight, JodClose, JodCompass, JodSettings } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useRouteLoaderData } from 'react-router';
import { useShallow } from 'zustand/shallow';
import { getTypeSlug } from '../Profile/utils';
import Competences from './Competences';
import ToolAccordion from './components/ToolAccordion';
import Interests from './Interests';
import type { ToolLoaderData } from './loader';
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
    updateEhdotuksetAndTyomahdollisuudet,
    toggleSuosikki,
  } = useToolStore(
    useShallow((state) => ({
      ammattiryhmaNimet: state.ammattiryhmaNimet,
      mahdollisuusEhdotukset: state.mahdollisuusEhdotukset,
      mixedMahdollisuudet: state.mixedMahdollisuudet,
      suosikit: state.suosikit,
      filters: state.filters,
      isLoading: state.ehdotuksetLoading || state.mahdollisuudetLoading,
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

  const onUpdateResults = async (loading: boolean) => {
    if (loading) {
      return;
    }
    globalThis._paq?.push(['trackEvent', 'yksilo.Kartoitustyökalut', 'Klikkaus', 'Päivitys']);
    await updateEhdotuksetAndTyomahdollisuudet(isLoggedIn);
  };

  const onCloseSettings = () => {
    setSettingsOpen(false);
  };

  const getTotalFilterCount = React.useCallback(() => {
    return Object.values(filters).reduce((total, filter) => total + (filter?.length ?? 0), 0);
  }, [filters]);

  const toggleFiltersText = React.useMemo(() => {
    const count = getTotalFilterCount();
    const filterCount = count > 0 ? ` (${count})` : '';
    return `${t('tool.settings.toggle-title-closed')}${filterCount}`;
  }, [getTotalFilterCount, t]);

  const updateButtonLabel = isLoading ? t('updating-list') : t('update');

  return (
    <>
      <div className="sticky top-[120px] lg:top-[66px] z-10 bg-bg-gray -mx-1 px-1 lg:pt-4">
        <div className="flex items-center justify-end h-9 lg:pb-4 not-lg:bg-white not-lg:w-full lg:justify-between not-lg:mb-3 not-lg:px-4">
          {lg && (
            <h2 id="opportunities-title" tabIndex={-1} className="text-heading-2-mobile sm:text-heading-2">
              {t('tool.your-opportunities.title')}
            </h2>
          )}
          <div className="flex gap-6 h-fit">
            <Button
              variant="plain"
              size="sm"
              className="text-black!"
              icon={settingsOpen ? <JodClose className="text-accent!" /> : <JodSettings className="text-accent!" />}
              iconSide="left"
              label={settingsOpen ? t('tool.settings.toggle-title-open') : toggleFiltersText}
              data-testid="open-tool-settings"
              onClick={() => {
                setSettingsOpen(!settingsOpen);
              }}
            />
            {
              <Button
                size={lg ? 'lg' : 'sm'}
                label={updateButtonLabel}
                variant="accent"
                onClick={() => onUpdateResults(isLoading)}
                icon={isLoading ? <Spinner color="white" size={20} /> : undefined}
                iconSide={isLoading ? 'right' : undefined}
                data-testid="update-opportunities"
              />
            }
          </div>
        </div>
      </div>

      {settingsOpen && (
        <ToolSettings ref={firstSettingRef} isOpen={settingsOpen} onClose={onCloseSettings} isModal={!lg} />
      )}

      <ul
        id="tool-your-opportunities-list"
        ref={scrollRef}
        className="flex flex-col gap-5 sm:gap-3 mb-8 scroll-mt-[96px]"
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

      <YourOpportunitiesPagination scrollRef={scrollRef} ariaLabel={t('pagination.bottom')} className="mb-7" />
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

const YourInfo = () => {
  const { t } = useTranslation();

  return (
    <>
      <ToolAccordion title={t('interests')} description={t('tool.my-own-data.interests.description')}>
        <Interests />
      </ToolAccordion>

      <ToolAccordion title={t('competences')} description={t('tool.my-own-data.competences.description')}>
        <Competences />
      </ToolAccordion>

      <ToolAccordion title={t('tool.info-overview.title')} description={t('tool.info-overview.description')}>
        <CategorizedCompetenceTagList />
      </ToolAccordion>

      <ToolAccordion title={t('tool.competency-profile.title')} description={t('tool.competency-profile.description')}>
        <ProfileImportExport />
      </ToolAccordion>

      <ToolAccordion title={t('tool.tools.title')} description={t('tool.tools.description')}>
        <AdditionalSupport />
      </ToolAccordion>

      <RateAiContent variant="kohtaanto" area="Kohtaanto työkalu" size="md" />

      <div className="flex flex-col bg-secondary-1-dark-2 rounded-md px-5 py-6 gap-3 text-white">
        <h2 className="text-heading-2">{t('profile.banner.title')}</h2>
        <div className="flex flex-col gap-6">
          <p className="text-body-lg">{t('profile.banner.description')}</p>
          <Button
            label={t('profile.banner.link-text')}
            variant="white"
            size="lg"
            LinkComponent={ProfileLinkComponent}
            iconSide="right"
            dataTestId="tool-go-to-profile"
            icon={<JodArrowRight />}
          />
        </div>
      </div>
    </>
  );
};

const Tool = () => {
  type TabName = 'info' | 'opportunities';
  const { t } = useTranslation();
  const { lg } = useMediaQueries();
  const [currentTab, setCurrentTab] = React.useState<TabName>('info');
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const setTab = React.useCallback((tab: TabName) => {
    setCurrentTab(tab);
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

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

  return (
    <main role="main" id="jod-main" className="mx-auto w-full max-w-[1140px] px-5 pb-6 pt-7" data-testid="tool-main">
      <div className="mb-6">
        <Breadcrumb />
      </div>
      <div>
        <IconHeading icon={<JodCompass className="text-white" />} title={t('tool.title')} dataTestId="tool-title" />
      </div>
      <p className="text-body-lg-mobile sm:text-body-lg mb-7 sm:mb-9 max-w-[700px]" ref={scrollRef}>
        {t('tool.description')}
      </p>
      <title>{t('tool.title')}</title>
      {lg ? (
        // Desktop
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-7">
          <div className="col-span-1 lg:col-span-5 max-h-fit">
            <div className="sticky top-[68px] z-10 bg-bg-gray lg:pt-4">
              <h2 className="sm:text-heading-2 text-heading-2-mobile h-9">{t('tool.my-own-data.title')}</h2>
            </div>
            <div className="flex flex-col gap-4">
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
          <div className="sticky top-[66px] z-10 -mx-5 pt-4 bg-bg-gray">
            <div role="tablist" className="flex text-button-sm select-none gap-3 px-5">
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
