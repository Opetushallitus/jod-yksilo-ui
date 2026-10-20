import { useTranslation } from 'react-i18next';
import { useMatches, useNavigate } from 'react-router';

import { ServiceBarSearch } from '@jod/design-system';

interface HeaderSearchProps {
  searchInputVisible: boolean;
  setSearchInputVisible: (visible: boolean) => void;
}

export const HeaderSearch = ({ searchInputVisible, setSearchInputVisible }: HeaderSearchProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const navigate = useNavigate();
  const hideSearch = useMatches().some((m) => m.id.startsWith('search|'));

  const handleSearch = (value: string) => {
    globalThis._paq?.push(['trackEvent', 'yksilo.Haku', 'Hakusana', value]);
    const queryParams = new URLSearchParams();
    queryParams.set('q', value);
    void navigate(`/${language}/${t('slugs.search')}?${queryParams.toString()}`);
  };

  return (
    !hideSearch && (
      <ServiceBarSearch
        expanded={searchInputVisible}
        onExpandedChange={setSearchInputVisible}
        onSubmit={handleSearch}
        placeholder={t('search.global-placeholder')}
        ariaLabel={t('search.label')}
        searchLabel={t('search.search')}
        testId="searchbar"
      />
    )
  );
};
