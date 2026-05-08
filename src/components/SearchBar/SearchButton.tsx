import { useTranslation } from 'react-i18next';

import { Spinner } from '@jod/design-system';
import { JodSearch } from '@jod/design-system/icons';

interface SearchButtonProps {
  form?: string;
  onClick?: () => void;
  isSearching?: boolean;
}

export const SearchButton = ({ form, onClick, isSearching }: SearchButtonProps) => {
  const { t } = useTranslation();

  return (
    <button
      type={onClick ? 'button' : 'submit'}
      form={form}
      onClick={onClick}
      className="flex h-[34px] cursor-pointer items-center gap-3 bg-white p-4 text-button-md text-secondary-gray select-none"
      data-testid={onClick ? 'searchbar-toggle' : 'searchbar-submit'}
    >
      {isSearching ? <Spinner size={24} color="accent" /> : <JodSearch />}
      <span>{t('search.search')}</span>
    </button>
  );
};
