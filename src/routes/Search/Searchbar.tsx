import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useShallow } from 'zustand/shallow';

import { SearchBar as DsSearchBar } from '@jod/design-system';

import { useSearchStore } from '@/stores/useSearchStore';

export const SearchBar = ({ scrollRef }: { scrollRef: React.RefObject<HTMLDivElement | null> }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const { search, setQuery, query } = useSearchStore(
    useShallow((state) => ({
      search: state.search,
      setQuery: state.setQuery,
      query: state.query,
    })),
  );
  const onSubmit = (value: string) => {
    const trimmedQuery = value.trim();
    if (trimmedQuery.length < 3) {
      setSubmitError(t('search.min-length', { count: 3 }));
      return;
    }

    setSubmitError(null);
    const queryParams = new URLSearchParams();
    queryParams.set('q', trimmedQuery);
    void navigate(`/${language}/${t('slugs.search')}?${queryParams.toString()}`);
    void search(trimmedQuery);
  };
  return (
    <div className="mb-5 scroll-m-11" ref={scrollRef}>
      <DsSearchBar
        value={query}
        onChange={(value) => {
          setQuery(value);
          setSubmitError(null);
        }}
        onSubmit={onSubmit}
        placeholder={t('search.search-placeholder')}
        searchLabel={t('search.search')}
        clearLabel={t('search.clear')}
        errorMessage={submitError ?? undefined}
        serviceVariant="yksilo"
        testId="searchbar"
      />
    </div>
  );
};
