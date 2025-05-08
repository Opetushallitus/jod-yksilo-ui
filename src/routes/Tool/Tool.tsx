import { OpportunityCard } from '@/components';
import { FilterButton } from '@/components/MobileFilterButton/MobileFilterButton';
import { useEnvironment } from '@/hooks/useEnvironment';
import { useInteractionMethod } from '@/hooks/useInteractionMethod';
import { useMenuClickHandler } from '@/hooks/useMenuClickHandler';
import { OpportunitiesFilter } from '@/routes/Tool';
import ToolOpportunityCardActionMenu from '@/routes/Tool/ToolOpportunityCardActionMenu';
import { MahdollisuusTyyppi } from '@/routes/types';
import { useToolStore } from '@/stores/useToolStore';
import { getLocalizedText } from '@/utils';
import { Button, PageChangeDetails, Pagination, Slider, Spinner, cx, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdBlock, MdOutlineInterests, MdOutlineSchool } from 'react-icons/md';
import { Outlet, useLoaderData, useLocation, useNavigate, useSearchParams } from 'react-router';
import { ToolLoaderData } from './loader';
import { VirtualAssistant } from './VirtualAssistant';

const MdTarget = ({ size, className }: { size: number; className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 -960 960 960"
    fill="currentColor"
    className={className}
  >
    <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-80q-100 0-170-70t-70-170q0-100 70-170t170-70q100 0 170 70t70 170q0 100-70 170t-170 70Zm0-80q66 0 113-47t47-113q0-66-47-113t-113-47q-66 0-113 47t-47 113q0 66 47 113t113 47Zm0-80q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Z" />
  </svg>
);

const MyOwnData = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const toolStore = useToolStore();
  const [searchParams] = useSearchParams();
  const titleId = React.useId();
  const { isDev } = useEnvironment();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { lg } = useMediaQueries();
  const { isLoggedIn } = useLoaderData() as ToolLoaderData;

  React.useEffect(() => {
    if (searchParams.get('origin') === 'favorites') {
      const filterParam = searchParams.get('filter');
      if (filterParam) {
        toolStore.setFilter(filterParam);
      }
      const opportunitiesTitleElement = document.getElementById('opportunities-title');
      if (opportunitiesTitleElement) {
        opportunitiesTitleElement.scrollIntoView({ behavior: 'smooth' });
        opportunitiesTitleElement.focus();
      }
      const url = new URL(window.location.href);
      url.search = ''; // Clear search parameters
      window.history.replaceState({}, '', url.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tabs = React.useMemo(() => {
    const tabs = [
      {
        text: t('goals'),
        icon: <MdTarget size={lg ? 24 : 32} className="mx-auto" />,
        active: pathname.endsWith(t('slugs.tool.goals', { lng: language })),
        to: t('slugs.tool.goals', { lng: language }),
        wip: true,
      },
      {
        text: t('competences'),
        icon: <MdOutlineSchool size={lg ? 24 : 32} className="mx-auto" />,
        active: pathname.endsWith(t('slugs.tool.competences', { lng: language })),
        to: t('slugs.tool.competences', { lng: language }),
      },
      {
        text: t('interests'),
        icon: <MdOutlineInterests size={lg ? 24 : 32} className="mx-auto" />,
        active: pathname.endsWith(t('slugs.tool.interests', { lng: language })),
        to: t('slugs.tool.interests', { lng: language }),
      },
      {
        text: t('restrictions'),
        icon: <MdBlock size={lg ? 24 : 32} className="mx-auto" />,
        active: pathname.endsWith(t('slugs.tool.restrictions', { lng: language })),
        to: t('slugs.tool.restrictions', { lng: language }),
        wip: true,
      },
    ];

    return isDev ? tabs : tabs.filter((tab) => !tab.wip);
  }, [t, lg, pathname, language, isDev]);

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      switch (event.key) {
        case 'ArrowLeft':
          if (index > 0) {
            navigate(tabs[index - 1].to, { replace: true, preventScrollReset: true });
            (event.currentTarget.previousElementSibling as HTMLElement)?.focus();
          }
          event.stopPropagation();
          event.preventDefault();
          break;
        case 'ArrowRight':
          if (index < tabs.length - 1) {
            navigate(tabs[index + 1].to, { replace: true, preventScrollReset: true });
            (event.currentTarget.nextElementSibling as HTMLElement)?.focus();
          }
          event.stopPropagation();
          event.preventDefault();
          break;
        case 'Home':
          navigate(tabs[0].to, { replace: true, preventScrollReset: true });
          (event.currentTarget.parentElement?.firstElementChild as HTMLElement)?.focus();
          event.stopPropagation();
          event.preventDefault();
          break;
        case 'End':
          navigate(tabs[tabs.length - 1].to, { replace: true, preventScrollReset: true });
          (event.currentTarget.parentElement?.lastElementChild as HTMLElement)?.focus();
          event.stopPropagation();
          event.preventDefault();
          break;
        default:
          break;
      }
    },
    [navigate, tabs],
  );

  // 100vh - header height - padding
  const virtualAssistantClassNames: string = toolStore.virtualAssistantOpen ? 'h-[calc(100vh-96px-40px)]' : '';

  return (
    <aside className={`col-span-3 lg:col-span-1 ${virtualAssistantClassNames}`}>
      {toolStore.virtualAssistantOpen ? (
        <div className="bg-white rounded h-full flex flex-col">
          <VirtualAssistant setVirtualAssistantOpen={toolStore.setVirtualAssistantOpen} />
        </div>
      ) : (
        <>
          <h1 id={titleId} className="text-heading-1-mobile sm:text-heading-1">
            {t('tool.my-own-data.title')}
          </h1>
          <p className="text-body-md-mobile sm:text-body-md mb-5 sm:mb-7">{t('tool.my-own-data.description')}</p>

          <div className="lg:sticky lg:top-[96px]">
            <div role="tablist" aria-labelledby={titleId} className="flex text-button-sm select-none">
              {tabs.map((tab, index) => (
                <button
                  key={tab.text}
                  id={`tab-${index + 1}`}
                  type="button"
                  role="tab"
                  aria-selected={pathname.endsWith(tab.to)}
                  aria-controls={`tabpanel-${index + 1}`}
                  tabIndex={tab.active ? undefined : -1}
                  onKeyDown={(event) => onKeyDown(event, index)}
                  onClick={() => navigate(tab.to, { replace: true, preventScrollReset: true })}
                  className={cx(`cursor-pointer w-full p-3 rounded-t text-center overflow-hidden`, {
                    'bg-white': tab.active,
                    'text-link': !tab.active,
                  })}
                >
                  {tab.icon}
                  {tab.text}
                </button>
              ))}
            </div>

            <div
              id={`tabpanel-${tabs.findIndex((tab) => tab.active) + 1}`}
              role="tabpanel"
              tabIndex={0}
              aria-labelledby="tab-1"
              className={cx('flex flex-col bg-white rounded-b lg:max-h-[calc(100vh-186px)] lg:overflow-y-auto', {
                'rounded-tl': tabs.findIndex((tab) => tab.active) !== 0,
                'rounded-tr': tabs.findIndex((tab) => tab.active) !== tabs.length - 1,
              })}
            >
              <Outlet context={{ isLoggedIn }} />
            </div>
          </div>
        </>
      )}
    </aside>
  );
};

const YourOpportunitiesPagination = ({
  scrollRef,
  className,
  ariaLabel,
}: {
  scrollRef: React.RefObject<HTMLUListElement | null>;
  className?: string;
  ariaLabel?: string;
}) => {
  const { t } = useTranslation();
  const toolStore = useToolStore();
  const { sm } = useMediaQueries();

  const onPageChange = async ({ page }: PageChangeDetails) => {
    if (toolStore.mahdollisuudetLoading) {
      return;
    }

    await toolStore.fetchMahdollisuudetPage(undefined, page);

    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
      const focusableElements = scrollRef.current.querySelectorAll(
        'a, button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])',
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return toolStore.mixedMahdollisuudet.length > 0 ? (
    <div className={className}>
      <Pagination
        currentPage={toolStore.ehdotuksetPageNr}
        type="button"
        ariaLabel={ariaLabel}
        pageSize={toolStore.ehdotuksetPageSize}
        siblingCount={sm ? 1 : 0}
        translations={{
          nextTriggerLabel: t('pagination.next'),
          prevTriggerLabel: t('pagination.previous'),
        }}
        totalItems={toolStore.itemCount}
        onPageChange={(data) => void onPageChange(data)}
      />
    </div>
  ) : (
    <></>
  );
};

const YourOpportunitiesCard = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const { t } = useTranslation();
  const toolStore = useToolStore();

  const updateButtonLabel = toolStore.ehdotuksetLoading ? t('updating-list') : t('tool.your-opportunities.card.action');

  const onClick = async () => {
    await toolStore.updateEhdotuksetAndTyomahdollisuudet(isLoggedIn);
  };

  const value = React.useMemo(() => {
    if (toolStore.kiinnostukset.length === 0 && toolStore.osaamiset.length === 0) {
      return 50;
    } else if (toolStore.osaamiset.length === 0) {
      return 100;
    } else if (toolStore.kiinnostukset.length === 0) {
      return 0;
    } else {
      return toolStore.osaamisKiinnostusPainotus;
    }
  }, [toolStore.kiinnostukset.length, toolStore.osaamisKiinnostusPainotus, toolStore.osaamiset.length]);

  return (
    <div
      id="tool-your-opportunities-card"
      className="flex flex-col gap-5 p-5 sm:p-6 bg-secondary-1-25 rounded shadow-border z-10"
    >
      <p className="text-body-md-mobile sm:text-body-md">{t('tool.your-opportunities.card.description')}</p>
      <Slider
        label={t('competences')}
        rightLabel={t('interests')}
        onValueChange={(val) => toolStore.setOsaamisKiinnostusPainotus(val)}
        value={value}
        disabled={toolStore.osaamiset.length === 0 || toolStore.kiinnostukset.length === 0}
      />
      <div className="flex justify-center sm:justify-start">
        <Button
          onClick={() => void onClick()}
          label={updateButtonLabel}
          variant="accent"
          disabled={toolStore.ehdotuksetLoading}
          iconSide="left"
          icon={toolStore.ehdotuksetLoading ? <Spinner size={24} color="white" /> : undefined}
        />
      </div>
    </div>
  );
};

const YourOpportunities = () => {
  const { t, i18n } = useTranslation();
  const toolStore = useToolStore();
  const scrollRef = React.useRef<HTMLUListElement>(null);
  const { isLoggedIn } = useLoaderData() as ToolLoaderData;
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const filterMenuButtonRef = React.useRef<HTMLButtonElement>(null);
  const filterMenuRef = useMenuClickHandler(() => setFiltersOpen(false), filterMenuButtonRef);
  const isMouseInteraction = useInteractionMethod();

  const ehdotuksetCount = toolStore.ehdotuksetCount ?? {};
  const filter = toolStore.filter;
  const count =
    filter === 'ALL'
      ? Object.keys(ehdotuksetCount).reduce((acc, key) => acc + ehdotuksetCount[key as MahdollisuusTyyppi], 0)
      : ehdotuksetCount[filter];

  // Move focus to menu content when opened
  React.useEffect(() => {
    if (filtersOpen && !isMouseInteraction && filterMenuRef.current) {
      const firstChild = filterMenuRef.current.querySelector('span');
      if (firstChild) {
        (firstChild as HTMLElement).focus();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersOpen]);

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (filterMenuRef.current && !filterMenuRef.current.contains(event.relatedTarget as Node)) {
      setFiltersOpen(false);
    }
  };

  return (
    <main role="main" className="col-span-3 lg:col-span-1" id="jod-main">
      <h1 id="opportunities-title" tabIndex={-1} className="text-heading-1-mobile sm:text-heading-1 scroll-mt-11">
        {t('tool.your-opportunities.title')}
      </h1>
      <p className="text-body-md-mobile sm:text-body-md mb-7">{t('tool.your-opportunities.description')}</p>

      <YourOpportunitiesCard isLoggedIn={isLoggedIn} />

      <div className="lg:sticky lg:top-11 lg:z-10 lg:h-11 relative">
        <div className="flex gap-5 justify-between items-center py-5 bg-linear-to-b from-85% from-bg-gray lg:absolute lg:-left-4 lg:-right-4 lg:px-4">
          <span className="font-arial text-form-label">
            {t('tool.your-opportunities.n-opportunities-found', { count })}
          </span>
          <FilterButton
            label={t('do-filter')}
            onClick={() => setFiltersOpen(!filtersOpen)}
            ref={filterMenuButtonRef}
            hideAfterBreakpoint="none"
            inline
          />
        </div>
        {filtersOpen && (
          <div ref={filterMenuRef} onBlur={handleBlur}>
            <OpportunitiesFilter />
          </div>
        )}
      </div>

      <ul
        id="tool-your-opportunities-list"
        ref={scrollRef}
        className="flex flex-col gap-3 sm:gap-5 mb-8 scroll-mt-[96px]"
      >
        {toolStore.mixedMahdollisuudet.map((mahdollisuus) => {
          const { id, mahdollisuusTyyppi } = mahdollisuus;
          const ehdotus = toolStore.mahdollisuusEhdotukset?.[id];
          const isFavorite = toolStore.suosikit?.find((s) => s.kohdeId === id) !== undefined;
          return ehdotus ? (
            <OpportunityCard
              key={id}
              as="li"
              to={
                mahdollisuusTyyppi === 'TYOMAHDOLLISUUS'
                  ? `/${i18n.language}/${t('slugs.job-opportunity.index')}/${id}`
                  : `/${i18n.language}/${t('slugs.education-opportunity.index')}/${id}`
              }
              isFavorite={isFavorite}
              isLoggedIn={isLoggedIn}
              toggleFavorite={() => void toolStore.toggleSuosikki(id, ehdotus.tyyppi)}
              name={getLocalizedText(mahdollisuus.otsikko)}
              description={getLocalizedText(mahdollisuus.tiivistelma)}
              matchValue={ehdotus?.pisteet}
              matchLabel={t('fit')}
              type={mahdollisuusTyyppi}
              trend={ehdotus?.trendi}
              employmentOutlook={ehdotus?.tyollisyysNakyma ?? 0}
              hasRestrictions
              industryName="TODO: Lorem ipsum dolor"
              mostCommonEducationBackground="TODO: Lorem ipsum dolor"
              menuContent={
                <ToolOpportunityCardActionMenu
                  mahdollisuusId={id}
                  mahdollisuusTyyppi={mahdollisuusTyyppi}
                  menuId={id}
                />
              }
              menuId={id}
            />
          ) : null;
        })}
      </ul>

      <YourOpportunitiesPagination scrollRef={scrollRef} ariaLabel={t('pagination.bottom')} className="mb-7" />
    </main>
  );
};

const Tool = () => {
  const { t } = useTranslation();

  return (
    <div className="mx-auto grid w-full max-w-[1140px] grow grid-cols-2 gap-6 px-5 pb-6 pt-8 sm:px-6">
      <title>{t('tool.title')}</title>
      <MyOwnData />
      <YourOpportunities />
    </div>
  );
};

export default Tool;
