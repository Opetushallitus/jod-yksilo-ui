import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

import { Checkbox } from '@jod/design-system';

import { addPlanStore } from '../store/addPlanStore';

export const FilterShowFavorites = () => {
  const { t } = useTranslation();

  const { filter, setFilter } = addPlanStore(
    useShallow((state) => ({
      filter: state.filters.showFavorites,
      setFilter: state.setShowFavorites,
    })),
  );
  const onFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = event.target.checked;
    setFilter(newFilter);
  };

  return (
    <fieldset className="flex flex-col gap-5" data-testid="filter-show-favorites">
      <legend className="sr-only mb-5 text-heading-4-mobile sm:text-heading-4">{t('show')}</legend>
      <Checkbox
        ariaLabel={t('profile.my-goals.filters.favorites.checkbox-label')}
        className="font-poppins!"
        checked={filter}
        label={t('profile.my-goals.filters.favorites.checkbox-label')}
        name={t('profile.my-goals.filters.favorites.checkbox-label')}
        onChange={onFilterChange}
        value="showFavorites"
        data-testid="show-favorites"
      />
    </fieldset>
  );
};
