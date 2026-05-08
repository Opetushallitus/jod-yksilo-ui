import React from 'react';
import { useTranslation } from 'react-i18next';

interface SearchInputProps {
  ref?: React.Ref<HTMLInputElement>;
  value?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SearchInput = ({ ref, value, onChange }: SearchInputProps) => {
  const { t } = useTranslation();

  return (
    <div className="search-input-wrapper" data-testid="searchbar-input-wrapper">
      <input
        ref={ref}
        id="search-input"
        type="text"
        maxLength={400}
        value={value}
        onChange={onChange}
        placeholder={t('search.global-placeholder')}
        autoComplete="off"
        aria-label={t('search.label')}
        role="searchbox"
        className="ds:font-arial ds:text-body-md h-[34px] w-[250px] border-2 border-white bg-white px-4 py-[10px] text-primary-gray placeholder:text-inactive-gray focus:outline-2 focus:outline-accent"
        data-testid="searchbar-input"
      />
    </div>
  );
};
