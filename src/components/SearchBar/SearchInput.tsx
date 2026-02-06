import React from 'react';
import { useTranslation } from 'react-i18next';

interface SearchInputProps {
  value?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SearchInput = ({ value, onChange }: SearchInputProps) => {
  const { t } = useTranslation();

  return (
    <div className="search-input-wrapper" data-testid="searchbar-input-wrapper">
      <input
        id="search-input"
        type="text"
        value={value}
        onChange={onChange}
        placeholder={t('search.global-placeholder')}
        autoComplete="off"
        aria-label={t('search.label')}
        role="searchbox"
        className="border-2 border-white bg-white py-[10px] px-4 w-[250px] h-[34px] text-primary-gray focus:outline-2 focus:outline-accent placeholder:text-inactive-gray ds:font-arial ds:text-body-md"
        data-testid="searchbar-input"
      />
    </div>
  );
};
