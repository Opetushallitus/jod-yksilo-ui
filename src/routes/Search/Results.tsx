import { OpportunityCard, OpportunityCardSkeleton } from '@/components/OpportunityCard';
import { usePaginationTranslations } from '@/hooks/usePaginationTranslations';
import { useSearchStore } from '@/stores/useSearchStore';
import { getLocalizedText } from '@/utils';
import { EmptyState, Pagination, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';
import { getTypeSlug } from '../Profile/utils';
import { SearchFilters } from './SearchFilters';

export const SearchResults = ({ scrollRef }: { scrollRef: React.RefObject<HTMLDivElement | null> }) => {
  const { sm } = useMediaQueries();
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

  return (
    <section aria-busy={isLoading}>
      <div role="status" aria-live="polite" className="sr-only">
        {statusText}
      </div>
      {isLoading && (
        <div aria-hidden="true" className="flex flex-col gap-5 sm:gap-3 mb-8">
          <OpportunityCardSkeleton />
          <OpportunityCardSkeleton />
        </div>
      )}
      {!isLoading && filteredResults.length === 0 && <EmptyState text={t('search.no-results')} />}
      {!isLoading && filteredResults.length > 0 && (
        <div className="flex flex-col">
          <div className="pb-5 font-arial flex justify-between items-center">
            {sm
              ? t('search.results-found', { count: filteredMetadata.length })
              : t('search.results-found-short', { count: filteredMetadata.length })}
            {!sm && <SearchFilters />}
          </div>
          <ul
            id="search-your-opportunities-list"
            className="flex flex-col gap-5 sm:gap-3 mb-8"
            data-testid="search-opportunities-list"
          >
            {filteredResults.map((mahdollisuus) => {
              const { id, mahdollisuusTyyppi } = mahdollisuus;

              return (
                <OpportunityCard
                  key={id}
                  hideFavorite
                  collapsible
                  as="li"
                  from="search"
                  to={`/${i18n.language}/${getTypeSlug(mahdollisuusTyyppi)}/${id}`}
                  name={getLocalizedText(mahdollisuus.otsikko)}
                  description={getLocalizedText(mahdollisuus.tiivistelma)}
                  headingLevel="h3"
                  ammattiryhma={mahdollisuus.ammattiryhma}
                  aineisto={mahdollisuus.aineisto}
                  tyyppi={mahdollisuus.tyyppi}
                  kesto={mahdollisuus.kesto}
                  yleisinKoulutusala={koulutusalaNimet.find((n) => n.code === mahdollisuus?.yleisinKoulutusala)?.value}
                  type={mahdollisuusTyyppi}
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
          siblingCount={sm ? 2 : 1}
          currentPage={pageNr}
          translations={paginationTranslations}
          onPageChange={async (details) => {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
            await fetchPage(details.page);
          }}
        />
      )}
    </section>
  );
};
