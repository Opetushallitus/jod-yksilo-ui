import { useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMatches, useNavigate } from 'react-router';
import { SearchButton } from './SearchButton';
import { SearchInput } from './SearchInput';

interface SearchBarProps {
  searchInputVisible: boolean;
  setSearchInputVisible: (visible: boolean) => void;
}

// eslint-disable-next-line sonarjs/function-return-type
export const SearchBar = ({ searchInputVisible, setSearchInputVisible }: SearchBarProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const [searchValue, setSearchValue] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const { sm } = useMediaQueries();
  const navigate = useNavigate();
  const hideSearch = useMatches().find((m) => m.id.startsWith('search|'));

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isSearching) return;
    setSearchValue(event.target.value);
  };

  const handleSearch = (e: React.SubmitEvent) => {
    if (isSearching) return;
    setIsSearching(true);
    e.preventDefault();
    globalThis._paq?.push(['trackEvent', 'yksilo.Haku', 'Hakusana', searchValue]);
    const queryParams = new URLSearchParams();
    queryParams.set('q', searchValue);
    navigate(`/${language}/${t('slugs.search')}?${queryParams.toString()}`);
    setTimeout(() => {
      setSearchValue('');
      setIsSearching(false);
      setSearchInputVisible(false);
    }, 300);
  };

  const showSearchInput = sm || searchInputVisible;

  const searchForm = (
    <form
      id="search"
      className="flex items-center gap-2 justify-end"
      onSubmit={handleSearch}
      data-testid="searchbar-form"
    >
      <SearchInput onChange={handleInputChange} value={searchValue} />
      <SearchButton form="search" isSearching={isSearching} />
    </form>
  );

  const toggleSearchButton = <SearchButton onClick={() => setSearchInputVisible(!searchInputVisible)} />;

  return (
    !hideSearch && (
      <div className="print:hidden mb-2" data-testid="searchbar">
        {showSearchInput ? searchForm : toggleSearchButton}
      </div>
    )
  );
};
