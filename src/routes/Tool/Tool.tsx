import { Breadcrumb, OpportunityCard } from '@/components';
import RateAiContent from '@/components/RateAiContent/RateAiContent';
import { useInteractionMethod } from '@/hooks/useInteractionMethod';
import { useMenuClickHandler } from '@/hooks/useMenuClickHandler';
import AdditionalSupport from '@/routes/Tool/AdditionalSupport';
import CategorizedCompetenceTagList from '@/routes/Tool/CategorizedCompetenceTagList';
import ToolOpportunityCardActionMenu from '@/routes/Tool/ToolOpportunityCardActionMenu';
import { useToolStore } from '@/stores/useToolStore';
import { getLocalizedText } from '@/utils';
import { Button, cx, Spinner, useMediaQueries } from '@jod/design-system';
import { JodClose, JodCompass, JodSettings } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import { useShallow } from 'zustand/shallow';
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
    mahdollisuudetLoading,
    ehdotuksetLoading,
    updateEhdotuksetAndTyomahdollisuudet,
    toggleSuosikki,
  } = useToolStore(
    useShallow((state) => ({
      ammattiryhmaNimet: state.ammattiryhmaNimet,
      mahdollisuusEhdotukset: state.mahdollisuusEhdotukset,
      mixedMahdollisuudet: state.mixedMahdollisuudet,
      suosikit: state.suosikit,
      toggleSuosikki: state.toggleSuosikki,
      updateEhdotuksetAndTyomahdollisuudet: state.updateEhdotuksetAndTyomahdollisuudet,
      mahdollisuudetLoading: state.mahdollisuudetLoading,
      ehdotuksetLoading: state.ehdotuksetLoading,
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
    if (settingsOpen && !isMouseInteraction && firstSettingRef.current) {
      const firstChild = firstSettingRef.current.querySelector('button');
      if (firstChild) {
        (firstChild as HTMLElement).focus();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsOpen]);

  const onUpdateResults = async () => {
    await updateEhdotuksetAndTyomahdollisuudet(isLoggedIn);
  };

  const isLoading = ehdotuksetLoading || mahdollisuudetLoading;
  const updateButtonLabel = ehdotuksetLoading ? t('updating-list') : t('update');

  return (
    <>
      <div className="lg:mb-3 not-lg:sticky not-lg:top-[108px] not-lg:z-10">
        <div className="flex not-lg:bg-bg-gray-2 not-lg:w-full justify-end lg:justify-between not-lg:my-3 not-lg:px-4 h-7">
          {lg && (
            <h2 id="opportunities-title" tabIndex={-1} className="text-heading-3-mobile sm:text-heading-3">
              {t('tool.your-opportunities.title')}
            </h2>
          )}
          <div className="flex gap-6">
            <Button
              variant="plain"
              size="sm"
              className="text-black!"
              onClick={() => setSettingsOpen(!settingsOpen)}
              icon={settingsOpen ? <JodClose className="text-accent!" /> : <JodSettings className="text-accent!" />}
              iconSide="left"
              label={settingsOpen ? t('tool.settings.toggle-title-open') : t('tool.settings.toggle-title-closed')}
              data-testid="open-tool-settings"
            />
            {lg && (
              <Button
                size="sm"
                label={updateButtonLabel}
                variant="accent"
                onClick={onUpdateResults}
                disabled={isLoading}
                icon={isLoading ? <Spinner color="white" size={20} /> : undefined}
                iconSide={isLoading ? 'right' : undefined}
                data-testid="update-opportunities"
              />
            )}
          </div>
        </div>
      </div>

      <>{settingsOpen && <ToolSettings ref={firstSettingRef} />}</>
      <ul
        id="tool-your-opportunities-list"
        ref={scrollRef}
        className="flex flex-col gap-5 sm:gap-3 mb-8 scroll-mt-[96px]"
        data-testid="opportunities-list"
      >
        {mixedMahdollisuudet.map((mahdollisuus) => {
          const { id, mahdollisuusTyyppi } = mahdollisuus;
          const ehdotus = mahdollisuusEhdotukset?.[id];
          const isFavorite = suosikit?.find((s) => s.kohdeId === id) !== undefined;
          const path =
            mahdollisuusTyyppi === 'TYOMAHDOLLISUUS'
              ? `/${i18n.language}/${t('slugs.job-opportunity.index')}/${id}`
              : `/${i18n.language}/${t('slugs.education-opportunity.index')}/${id}`;
          return ehdotus ? (
            <OpportunityCard
              key={id}
              as="li"
              from="tool"
              to={path}
              isFavorite={isFavorite}
              isLoggedIn={isLoggedIn}
              toggleFavorite={() => void toggleSuosikki(id, ehdotus.tyyppi)}
              name={getLocalizedText(mahdollisuus.otsikko)}
              description={getLocalizedText(mahdollisuus.tiivistelma)}
              matchValue={ehdotus?.pisteet}
              matchLabel={t('fit')}
              ammattiryhma={
                mahdollisuus.ammattiryhma ? getLocalizedText(ammattiryhmaNimet?.[mahdollisuus.ammattiryhma]) : undefined
              }
              aineisto={mahdollisuus.aineisto}
              tyyppi={mahdollisuus.tyyppi}
              type={mahdollisuusTyyppi}
              menuContent={
                <ToolOpportunityCardActionMenu
                  mahdollisuusId={id}
                  mahdollisuusTyyppi={mahdollisuusTyyppi}
                  menuId={id}
                  opportunityUrl={path}
                />
              }
              menuId={id}
            />
          ) : null;
        })}
      </ul>

      <YourOpportunitiesPagination scrollRef={scrollRef} ariaLabel={t('pagination.bottom')} className="mb-7" />
    </>
  );
};

const YourInfo = () => {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const noop = () => {};
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

      <RateAiContent onDislike={noop} onLike={noop} variant="kohtaanto" />
    </>
  );
};

const Tool = () => {
  const { t } = useTranslation();
  const { lg } = useMediaQueries();
  const [currentTab, setCurrentTab] = React.useState<'info' | 'opportunities'>('info');
  const tabs = React.useMemo(() => {
    const tabs = [
      {
        text: t('tool.my-own-data.title'),
        active: currentTab === 'info',
        onclick: () => setCurrentTab('info'),
      },
      {
        text: t('tool.your-opportunities.title'),
        active: currentTab === 'opportunities',
        onclick: () => setCurrentTab('opportunities'),
      },
    ];

    return tabs;
  }, [currentTab, t]);

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      switch (event.key) {
        case 'Home':
        case 'ArrowLeft':
          if (index > 0) {
            setCurrentTab('info');
            (event.currentTarget.previousElementSibling as HTMLElement)?.focus();
          }
          event.stopPropagation();
          event.preventDefault();
          break;
        case 'End':
        case 'ArrowRight':
          if (index < tabs.length - 1) {
            setCurrentTab('opportunities');
            (event.currentTarget.nextElementSibling as HTMLElement)?.focus();
          }
          event.stopPropagation();
          event.preventDefault();
          break;
        default:
          break;
      }
    },
    [tabs],
  );

  return (
    <main role="main" id="jod-main" className="mx-auto w-full max-w-[1140px] px-5 pb-6 pt-7" data-testid="tool-main">
      <div className="mb-6">
        <Breadcrumb />
      </div>
      <div className="flex gap-4 mb-6">
        <div className="rounded-full bg-secondary-1-dark-2 size-9 flex justify-center items-center">
          <JodCompass className="text-white" />
        </div>
        <h1 className="text-heading-1-mobile sm:text-heading-1 text-secondary-1-dark-2">{t('tool.title')}</h1>
      </div>
      <p className="text-body-lg-mobile sm:text-body-lg mb-7 sm:mb-9 max-w-[700px]">{t('tool.description')}</p>
      <title>{t('tool.title')}</title>
      {lg ? (
        // Desktop
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-7">
          <div className="col-span-1 lg:col-span-5">
            <h2 className="text-heading-3 mb-3 h-7">{t('tool.my-own-data.title')}</h2>
            <div className="flex flex-col gap-6">
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
          <div className="sticky top-[66px] z-10 -mx-5">
            <div role="tablist" className="flex text-button-sm select-none gap-1 bg-bg-gray px-5">
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
