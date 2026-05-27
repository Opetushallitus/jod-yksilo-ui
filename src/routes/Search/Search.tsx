import React from 'react';
import { useTranslation } from 'react-i18next';

import { IconHeading, MainLayout, useMediaQueries } from '@jod/design-system';
import { JodSearch } from '@jod/design-system/icons';

import { Breadcrumb } from '@/components';

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
      breadcrumbComponent={<Breadcrumb />}
      navChildren={
        <div className="flex flex-col gap-6">
          <SearchFilters />
          <InfoCards />
        </div>
      }
    >
      <div className="px-5 sm:px-6 lg:pr-0 lg:pl-6">
        <IconHeading icon={<JodSearch className="text-white" />} title={t('search.title')} testId="search-title" />
        <title>{t('search.title')}</title>
        <p className="mb-6 max-w-[700px] text-body-lg-mobile sm:text-body-lg">{t('search.description')}</p>
        <SearchBar scrollRef={scrollRef} />
        <SearchResults scrollRef={scrollRef} />
        {!sm && (
          <div className="mt-6">
            <InfoCards />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Search;
