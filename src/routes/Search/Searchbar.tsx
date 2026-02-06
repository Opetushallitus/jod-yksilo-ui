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
  const navigate = useNavigate();
  const { search, setQuery, query } = useSearchStore(
    useShallow((state) => ({
      search: state.search,
      setQuery: state.setQuery,
      query: state.query,
    })),
  );
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    queryParams.set('s', query);
    navigate(`/${language}/${t('slugs.search')}?${queryParams.toString()}`);
    search(query);
  };
  return (
    <div className="flex flex-col gap-6 scroll-m-11 mb-5" ref={scrollRef}>
      <form id={formId} className="flex items-center" onSubmit={onSubmit}>
        <div className="flex items-center w-full rounded-md border border-border-form bg-white text-primary-gray p-2">
          <input
            type="text"
            name="search"
            className="font-arial grow w-full mr-3 placeholder:text-inactive-gray placeholder:text-body-md focus:outline-2 focus:outline-accent pl-3 outline-accent outline-offset-6 rounded-l-xs mx-1"
            placeholder={t('search.search-placeholder')}
            minLength={3}
            maxLength={400}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            value={query}
          />
          <button
            type="button"
            className="shrink rounded-sm bg-bg-gray focus:outline-2 focus:outline-accent cursor-pointer size-7 justify-center flex items-center outline-accent outline-offset-2 ml-2"
            onClick={() => {
              setQuery('');
            }}
          >
            <JodClose className="text-inactive-gray" />
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 shrink ml-3 rounded-sm h-7 bg-accent border-y px-3 text-white hover:bg-accent-dark focus:outline-2 focus:outline-accent cursor-pointer text-heading-4 text-[14px] outline-accent outline-offset-2"
          >
            <JodSearch className="text-white" />
            {t('search.search')}
          </button>
        </div>
      </form>
    </div>
  );
};
