import { Spinner } from '@jod/design-system';
import { JodSearch } from '@jod/design-system/icons';
import { useTranslation } from 'react-i18next';

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
      className="flex cursor-pointer items-center gap-3 select-none p-4 bg-white text-button-md text-secondary-gray h-[34px]"
      data-testid={onClick ? 'searchbar-toggle' : 'searchbar-submit'}
    >
      {isSearching ? <Spinner size={24} color="accent" /> : <JodSearch />}
      <span>{t('search.search')}</span>
    </button>
  );
};
