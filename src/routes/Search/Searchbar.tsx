import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useShallow } from 'zustand/shallow';

import { JodClose, JodSearch } from '@jod/design-system/icons';

import { useSearchStore } from '@/stores/useSearchStore';

export const SearchBar = ({ scrollRef }: { scrollRef: React.RefObject<HTMLDivElement | null> }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const formId = React.useId();
  const errorId = React.useId();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const { search, setQuery, query } = useSearchStore(
    useShallow((state) => ({
      search: state.search,
      setQuery: state.setQuery,
      query: state.query,
    })),
  );
  const onSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
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
    <div className="mb-5 flex scroll-m-11 flex-col gap-2" ref={scrollRef}>
      <form id={formId} className="flex items-center" onSubmit={onSubmit} noValidate>
        <div className="border-border-form flex w-full items-center rounded-md border bg-white p-2 text-primary-gray">
          <input
            type="text"
            name="search"
            className="rounded-l-xs mx-1 mr-3 w-full grow pl-3 font-arial outline-offset-6 outline-accent placeholder:text-body-md placeholder:text-inactive-gray focus:outline-2 focus:outline-accent"
            placeholder={t('search.search-placeholder')}
            maxLength={400}
            onChange={(e) => {
              setQuery(e.target.value);
              setSubmitError(null);
            }}
            value={query}
            aria-invalid={!!submitError}
            aria-describedby={submitError ? errorId : undefined}
          />
          <button
            type="button"
            aria-label={t('search.clear')}
            className="ml-2 flex size-7 shrink cursor-pointer items-center justify-center rounded-sm bg-bg-gray outline-offset-2 outline-accent focus:outline-2 focus:outline-accent"
            onClick={() => {
              setQuery('');
              setSubmitError(null);
            }}
          >
            <JodClose className="text-inactive-gray" />
          </button>
          <button
            type="submit"
            className="hover:bg-accent-dark ml-3 flex h-7 shrink cursor-pointer items-center gap-2 rounded-sm border-y bg-accent px-3 text-heading-4 text-[0.875rem] text-white outline-offset-2 outline-accent focus:outline-2 focus:outline-accent"
          >
            <JodSearch className="text-white" />
            {t('search.search')}
          </button>
        </div>
      </form>
      {submitError && (
        <div id={errorId} className="mt-2 block font-arial text-form-error text-alert-2" role="alert">
          {submitError}
        </div>
      )}
    </div>
  );
};
