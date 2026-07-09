import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

import { EmptyState, Pagination, useMediaQueries } from '@jod/design-system';

import { OpportunityCard, OpportunityCardSkeleton } from '@/components/OpportunityCard';
import { usePaginationTranslations } from '@/hooks/usePaginationTranslations';
import { useSearchStore } from '@/stores/useSearchStore';
import { getLocalizedText } from '@/utils';

import { getTypeSlug } from '../Profile/utils';
import { getMahdollisuusAlityyppi } from '../Tool/utils';
import { SearchFilters } from './SearchFilters';

export const SearchResults = ({ scrollRef }: { scrollRef: React.RefObject<HTMLDivElement | null> }) => {
  const { lg, reduceMotion } = useMediaQueries();
  const { isLoading, filteredResults, filteredMetadata, pageNr, pageSize, koulutusalaNimet, fetchPage } =
    useSearchStore(
      useShallow((state) => ({
        isLoading: state.isLoading,
        filteredResults: state.filteredResults,
        filteredMetadata: state.filteredMetadata,
        pageNr: state.resultsPageNr,
        pageSize: state.resultsPageSize,
        koulutusalaNimet: state.koulutusalaNimet,
        fetchPage: state.fetchPage,
      })),
    );
  const { t, i18n } = useTranslation();
  const paginationTranslations = usePaginationTranslations();
  const statusText = isLoading ? t('tool.updating') : t('tool.opportunities-loaded', { count: filteredResults.length });

  const resultsCountText = lg
    ? t('search.results-found', { count: filteredMetadata.length })
    : t('search.results-found-short', { count: filteredMetadata.length });

  return (
    <section aria-busy={isLoading} data-testid={isLoading ? 'search-results-loading' : 'search-results'}>
      <output aria-live="polite" className="sr-only">
        {statusText}
      </output>
      {isLoading && (
        <div aria-hidden="true" className="mb-8 flex flex-col gap-5 sm:gap-3">
          <OpportunityCardSkeleton />
          <OpportunityCardSkeleton />
        </div>
      )}
      <div className="flex items-center justify-between gap-3 pb-5 font-arial">
        {!isLoading && (
          <>
            {filteredResults.length === 0 && (
              <EmptyState text={t('search.no-results')} data-testid="search-results-empty-state" />
            )}
            {filteredResults.length > 0 && (
              <span className="flex h-8 items-center" data-testid="search-results-count">
                {resultsCountText}
              </span>
            )}
          </>
        )}
        {!lg && <SearchFilters />}
      </div>

      {!isLoading && filteredResults.length > 0 && (
        <div className="flex flex-col">
          <ul
            id="search-your-opportunities-list"
            className="mb-8 flex flex-col gap-5 sm:gap-3"
            data-testid="search-opportunities-list"
          >
            {filteredResults.map((mahdollisuus) => {
              const { id, mahdollisuusTyyppi } = mahdollisuus;

              return (
                <OpportunityCard
                  key={id}
                  hideFavorite
                  as="li"
                  from="search"
                  to={`/${i18n.language}/${getTypeSlug(mahdollisuusTyyppi)}/${id}`}
                  name={getLocalizedText(mahdollisuus.otsikko)}
                  description={getLocalizedText(mahdollisuus.tiivistelma)}
                  headingLevel="h3"
                  ammattiryhma={mahdollisuus.ammattiryhma}
                  kesto={mahdollisuus.kesto}
                  yleisinKoulutusala={koulutusalaNimet.find((n) => n.code === mahdollisuus?.yleisinKoulutusala)?.value}
                  mahdollisuusTyyppi={mahdollisuusTyyppi}
                  mahdollisuusAlityyppi={getMahdollisuusAlityyppi(mahdollisuus)}
                />
              );
            })}
          </ul>
        </div>
      )}
      {filteredMetadata.length > 0 && (
        <Pagination
          totalItems={filteredMetadata.length}
          pageSize={pageSize}
          siblingCount={lg ? 2 : 1}
          currentPage={pageNr}
          translations={paginationTranslations}
          onPageChange={async (details) => {
            scrollRef.current?.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth' });
            await fetchPage(details.page);
          }}
        />
      )}
    </section>
  );
};
