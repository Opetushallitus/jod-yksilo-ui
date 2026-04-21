import { useSearchStore } from '@/stores/useSearchStore';
import { JodClose, JodSearch } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useShallow } from 'zustand/shallow';

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
    navigate(`/${language}/${t('slugs.search')}?${queryParams.toString()}`);
    search(trimmedQuery);
  };
  return (
    <div className="flex flex-col gap-2 scroll-m-11 mb-5" ref={scrollRef}>
      <form id={formId} className="flex items-center" onSubmit={onSubmit} noValidate>
        <div className="flex items-center w-full rounded-md border border-border-form bg-white text-primary-gray p-2">
          <input
            type="text"
            name="search"
            className="font-arial grow w-full mr-3 placeholder:text-inactive-gray placeholder:text-body-md focus:outline-2 focus:outline-accent pl-3 outline-accent outline-offset-6 rounded-l-xs mx-1"
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
            className="shrink rounded-sm bg-bg-gray focus:outline-2 focus:outline-accent cursor-pointer size-7 justify-center flex items-center outline-accent outline-offset-2 ml-2"
            onClick={() => {
              setQuery('');
              setSubmitError(null);
            }}
          >
            <JodClose className="text-inactive-gray" />
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 shrink ml-3 rounded-sm h-7 bg-accent border-y px-3 text-white hover:bg-accent-dark focus:outline-2 focus:outline-accent cursor-pointer text-heading-4 text-[0.875rem] outline-accent outline-offset-2"
          >
            <JodSearch className="text-white" />
            {t('search.search')}
          </button>
        </div>
      </form>
      {submitError && (
        <div id={errorId} className="mt-2 block text-form-error text-alert-text-2 font-arial" role="alert">
          {submitError}
        </div>
      )}
    </div>
  );
};
