import { OpportunityCard } from '@/components';
import { useInteractionMethod } from '@/hooks/useInteractionMethod';
import { useMenuClickHandler } from '@/hooks/useMenuClickHandler';
import { OpportunitiesSorting } from '@/routes/Tool';
import AdditionalSupport from '@/routes/Tool/AdditionalSupport';
import CategorizedCompetenceTagList from '@/routes/Tool/CategorizedCompetenceTagList';
import ToolOpportunityCardActionMenu from '@/routes/Tool/ToolOpportunityCardActionMenu';
import {
  countFilteredEhdotukset,
  filterValues,
  type OpportunityFilterValue,
  type OpportunitySortingValue,
} from '@/routes/Tool/utils';
import type { MahdollisuusTyyppi } from '@/routes/types';
import { useToolStore } from '@/stores/useToolStore';
import { getLocalizedText } from '@/utils';
import {
  Button,
  Checkbox,
  cx,
  IconButton,
  PageChangeDetails,
  Pagination,
  Slider,
  Spinner,
  useMediaQueries,
} from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { JodFavs, JodSkills, JodSort } from '@jod/design-system/icons';
import { Outlet, useLoaderData, useLocation, useNavigate, useSearchParams } from 'react-router';
import { useShallow } from 'zustand/shallow';
import type { ToolLoaderData } from './loader';
import { VirtualAssistant } from './VirtualAssistant';

const MyOwnData = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { setVirtualAssistantOpen, setFilter, virtualAssistantOpen } = useToolStore(
    useShallow((state) => ({
      setVirtualAssistantOpen: state.setVirtualAssistantOpen,
      setFilter: state.setFilter,
      virtualAssistantOpen: state.virtualAssistantOpen,
    })),
  );
  const [searchParams] = useSearchParams();
  const titleId = React.useId();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { lg } = useMediaQueries();
  const { isLoggedIn } = useLoaderData() as ToolLoaderData;

  React.useEffect(() => {
    if (searchParams.get('origin') === 'favorites') {
      const filterParam = searchParams.get('filter') as OpportunityFilterValue;
      if (filterParam) {
        setFilter([filterParam]);
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
        text: t('competences'),
        icon: <JodSkills size={lg ? 24 : 32} className="mx-auto" />,
        active: pathname.endsWith(t('slugs.tool.competences', { lng: language })),
        to: t('slugs.tool.competences', { lng: language }),
      },
      {
        text: t('interests'),
        icon: <JodFavs size={lg ? 24 : 32} className="mx-auto" />,
        active: pathname.endsWith(t('slugs.tool.interests', { lng: language })),
        to: t('slugs.tool.interests', { lng: language }),
      },
    ];

    return tabs;
  }, [t, lg, pathname, language]);

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
  const virtualAssistantClassNames = virtualAssistantOpen ? 'h-[calc(100vh-96px-40px)]' : '';

  return (
    <aside className={virtualAssistantClassNames} data-testid="tool-sidebar">
      {virtualAssistantOpen ? (
        <div className="bg-white rounded h-full flex flex-col">
          <VirtualAssistant setVirtualAssistantOpen={setVirtualAssistantOpen} />
        </div>
      ) : (
        <>
          <h2 id={titleId} className="text-heading-2-mobile sm:text-heading-2">
            {`1. ${t('tool.my-own-data.title')}`}
          </h2>
          <p className="text-body-md-mobile sm:text-body-md mb-5 sm:mb-7">{t('tool.my-own-data.description')}</p>
          <div className="lg:sticky lg:top-[96px]">
            <div
              role="tablist"
              aria-labelledby={titleId}
              className="flex text-button-sm select-none"
              data-testid="tool-tabs"
            >
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
                    'text-accent': !tab.active,
                  })}
                  data-testid={`tool-tab-${tab.text.toLowerCase().replace(/\s+/g, '-')}`}
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
              className={cx('flex flex-col bg-white rounded-b', {
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
  const {
    ehdotuksetPageNr,
    ehdotuksetPageSize,
    ehdotuksetCount,
    fetchMahdollisuudetPage,
    mahdollisuudetLoading,
    mixedMahdollisuudet,
    filter,
  } = useToolStore(
    useShallow((state) => ({
      ehdotuksetPageNr: state.ehdotuksetPageNr,
      ehdotuksetPageSize: state.ehdotuksetPageSize,
      ehdotuksetCount: state.ehdotuksetCount,
      fetchMahdollisuudetPage: state.fetchMahdollisuudetPage,
      mahdollisuudetLoading: state.mahdollisuudetLoading,
      mixedMahdollisuudet: state.mixedMahdollisuudet,
      filter: state.filter,
    })),
  );
  const { sm } = useMediaQueries();

  const onPageChange = async ({ page }: PageChangeDetails) => {
    if (mahdollisuudetLoading) {
      return;
    }

    await fetchMahdollisuudetPage(undefined, page);

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

  const filters = typeof filter === 'string' ? [filter] : filter;

  return mixedMahdollisuudet.length > 0 ? (
    <div className={className} data-testid="tool-pagination">
      <Pagination
        currentPage={ehdotuksetPageNr}
        type="button"
        ariaLabel={ariaLabel}
        pageSize={ehdotuksetPageSize}
        siblingCount={sm ? 1 : 0}
        translations={{
          nextTriggerLabel: t('pagination.next'),
          prevTriggerLabel: t('pagination.previous'),
        }}
        totalItems={countFilteredEhdotukset(filters, ehdotuksetCount)}
        onPageChange={(data) => void onPageChange(data)}
      />
    </div>
  ) : null;
};

const YourOpportunitiesCard = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const {
    ehdotuksetLoading,
    kiinnostukset,
    kiinnostuksetVapaateksti,
    osaamiset,
    osaamisetVapaateksti,
    osaamisKiinnostusPainotus,
    updateEhdotuksetAndTyomahdollisuudet,
    setOsaamisKiinnostusPainotus,
  } = useToolStore(
    useShallow((state) => ({
      ehdotuksetLoading: state.ehdotuksetLoading,
      kiinnostukset: state.kiinnostukset,
      kiinnostuksetVapaateksti: state.kiinnostuksetVapaateksti,
      osaamiset: state.osaamiset,
      osaamisetVapaateksti: state.osaamisetVapaateksti,
      osaamisKiinnostusPainotus: state.osaamisKiinnostusPainotus,
      updateEhdotuksetAndTyomahdollisuudet: state.updateEhdotuksetAndTyomahdollisuudet,
      setOsaamisKiinnostusPainotus: state.setOsaamisKiinnostusPainotus,
    })),
  );

  const updateButtonLabel = ehdotuksetLoading ? t('updating-list') : t('tool.your-opportunities.card.action');

  const onClick = async () => {
    await updateEhdotuksetAndTyomahdollisuudet(isLoggedIn);
  };

  const painotus = React.useMemo(() => {
    if (
      kiinnostukset.length === 0 &&
      kiinnostuksetVapaateksti?.[language].length === undefined &&
      osaamiset.length === 0 &&
      osaamisetVapaateksti?.[language].length === undefined
    ) {
      return { value: 50, disabled: true };
    } else if (osaamiset.length === 0 && osaamisetVapaateksti?.[language].length === undefined) {
      return { value: 100, disabled: true };
    } else if (kiinnostukset.length === 0 && kiinnostuksetVapaateksti?.[language].length === undefined) {
      return { value: 0, disabled: true };
    } else {
      return { value: osaamisKiinnostusPainotus, disabled: false };
    }
  }, [
    kiinnostukset.length,
    kiinnostuksetVapaateksti,
    osaamisKiinnostusPainotus,
    osaamiset.length,
    osaamisetVapaateksti,
    language,
  ]);

  return (
    <div
      id="tool-your-opportunities-card"
      className="flex flex-col gap-5 p-5 sm:p-6 bg-secondary-1-25 rounded z-10 mb-2"
    >
      <p className="text-button-sm">{t('tool.your-opportunities.card.description')}</p>
      <Slider
        label={t('competences')}
        rightLabel={t('interests')}
        onValueChange={(val) => setOsaamisKiinnostusPainotus(val)}
        value={painotus.value}
        disabled={painotus.disabled}
      />
      <div className="flex justify-center sm:justify-start">
        <Button
          onClick={() => void onClick()}
          label={updateButtonLabel}
          variant="accent"
          disabled={ehdotuksetLoading}
          iconSide="left"
          icon={ehdotuksetLoading ? <Spinner size={24} color="white" /> : undefined}
          data-testid="update-opportunities"
        />
      </div>
    </div>
  );
};

const ExploreOpportunities = () => {
  const { t, i18n } = useTranslation();
  const {
    ammattiryhmaNimet,
    ehdotuksetCount,
    filter,
    mahdollisuusEhdotukset,
    mixedMahdollisuudet,
    setFilter,
    sorting,
    suosikit,
    toggleSuosikki,
  } = useToolStore(
    useShallow((state) => ({
      ammattiryhmaNimet: state.ammattiryhmaNimet,
      ehdotuksetCount: state.ehdotuksetCount,
      filter: state.filter,
      mahdollisuusEhdotukset: state.mahdollisuusEhdotukset,
      mixedMahdollisuudet: state.mixedMahdollisuudet,
      setFilter: state.setFilter,
      sorting: state.sorting,
      suosikit: state.suosikit,
      toggleSuosikki: state.toggleSuosikki,
    })),
  );

  const scrollRef = React.useRef<HTMLUListElement>(null);
  const { isLoggedIn } = useLoaderData() as ToolLoaderData;
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const filterMenuButtonRef = React.useRef<HTMLButtonElement>(null);
  const filterMenuRef = useMenuClickHandler(() => setFiltersOpen(false), filterMenuButtonRef);
  const isMouseInteraction = useInteractionMethod();

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

  const onFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = event.target.value as MahdollisuusTyyppi;

    if (filter.includes(newFilter)) {
      setFilter(filter.filter((f) => f !== newFilter));
    } else {
      setFilter([...filter, newFilter]);
    }
  };

  const getCheckboxLabel = (type: MahdollisuusTyyppi) =>
    type === 'TYOMAHDOLLISUUS'
      ? t('n-job-opportunities', { count: ehdotuksetCount.TYOMAHDOLLISUUS })
      : t('n-education-opportunities', { count: ehdotuksetCount.KOULUTUSMAHDOLLISUUS });

  const getSortingTranslationKey = (sorting: OpportunitySortingValue) =>
    sorting === 'ALPHABET'
      ? t('tool.your-opportunities.sorting.alphabetically')
      : t('tool.your-opportunities.sorting.by-relevance');

  return (
    <main role="main" className="col-span-3 lg:col-span-1" id="jod-main" data-testid="tool-main">
      <h2 id="opportunities-title" tabIndex={-1} className="text-heading-2-mobile sm:text-heading-2 scroll-mt-11 mb-5">
        {`2. ${t('tool.your-opportunities.title')}`}
      </h2>

      <YourOpportunitiesCard isLoggedIn={isLoggedIn} />

      <div className="lg:sticky lg:top-11 lg:z-10 lg:h-[186px] relative">
        <div className="flex gap-5 justify-between items-center py-5 bg-linear-to-b from-85% from-bg-gray lg:absolute lg:-left-4 lg:-right-4 lg:px-4">
          <div className="flex flex-col gap-5 mb-5 items-start">
            <fieldset className="flex flex-col gap-5" data-testid="tool-filters">
              <legend className="text-heading-4-mobile sm:text-heading-4 mb-5">{t('show')}</legend>
              <Checkbox
                ariaLabel={getCheckboxLabel('TYOMAHDOLLISUUS')}
                checked={filter.includes('ALL') || filter.includes('TYOMAHDOLLISUUS')}
                label={getCheckboxLabel('TYOMAHDOLLISUUS')}
                name={filterValues.TYOMAHDOLLISUUS}
                onChange={onFilterChange}
                value={filterValues.TYOMAHDOLLISUUS}
                data-testid="filter-job-opportunities"
              />
              <Checkbox
                ariaLabel={getCheckboxLabel('KOULUTUSMAHDOLLISUUS')}
                checked={filter.includes('ALL') || filter.includes('KOULUTUSMAHDOLLISUUS')}
                label={getCheckboxLabel('KOULUTUSMAHDOLLISUUS')}
                name={filterValues.KOULUTUSMAHDOLLISUUS}
                onChange={onFilterChange}
                value={filterValues.KOULUTUSMAHDOLLISUUS}
                data-testid="filter-education-opportunities"
              />
            </fieldset>

            <IconButton
              label={`${t('sort')} (${getSortingTranslationKey(sorting)})`}
              icon={<JodSort size={18} />}
              bgColor="white"
              onClick={() => setFiltersOpen(!filtersOpen)}
              data-testid="open-sorting"
            />
          </div>
        </div>
        {filtersOpen && (
          <div ref={filterMenuRef} onBlur={handleBlur} data-testid="sorting-menu">
            <OpportunitiesSorting />
          </div>
        )}
      </div>

      <ul
        id="tool-your-opportunities-list"
        ref={scrollRef}
        className="flex flex-col gap-3 sm:gap-5 mb-8 scroll-mt-[96px]"
        data-testid="opportunities-list"
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
              to={
                mahdollisuusTyyppi === 'TYOMAHDOLLISUUS'
                  ? `/${i18n.language}/${t('slugs.job-opportunity.index')}/${id}`
                  : `/${i18n.language}/${t('slugs.education-opportunity.index')}/${id}`
              }
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
    <div className="mx-auto w-full max-w-[1140px] grow px-5 pb-6 pt-8 sm:px-6">
      <div>
        <h1 className="text-heading-1-mobile sm:text-heading-1">{t('tool.title')}</h1>
        <p className="text-body-md-mobile sm:text-body-md mb-5 sm:mb-7">{t('tool.description')}</p>
      </div>
      <title>{t('tool.title')}</title>

      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6">
        <div className="flex flex-col gap-4">
          <MyOwnData />
          <CategorizedCompetenceTagList />
          <AdditionalSupport />
        </div>
        <ExploreOpportunities />
      </div>
    </div>
  );
};

export default Tool;
