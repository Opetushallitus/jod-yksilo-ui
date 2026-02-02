import { MainLayout } from '@/components';
import { IconHeading } from '@/components/IconHeading';
import { useMediaQueries } from '@jod/design-system';
import { JodSearch } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { InfoCards } from './InfoCards';
import { SearchResults } from './Results';
import { SearchBar } from './Searchbar';
import { SearchFilters } from './SearchFilters';

const Search = () => {
  const { t } = useTranslation();
  const { sm } = useMediaQueries();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  return (
    <MainLayout
      navChildren={
        <div className="flex flex-col gap-6">
          <SearchFilters />
          <InfoCards />
        </div>
      }
    >
      <IconHeading icon={<JodSearch className="text-white" />} title={t('search.title')} testId="search-title" />
      <title>{t('search.title')}</title>
      <p className="text-body-lg-mobile sm:text-body-lg mb-6 max-w-[700px]">{t('search.description')}</p>
      <SearchBar scrollRef={scrollRef} />
      <SearchResults scrollRef={scrollRef} />
      {!sm && (
        <div className="mt-6">
          <InfoCards />
        </div>
      )}
    </MainLayout>
  );
};

export default Search;
