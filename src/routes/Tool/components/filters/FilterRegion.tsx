import { useToolStore } from '@/stores/useToolStore';
import { Checkbox } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import { useShallow } from 'zustand/shallow';
import { ToolLoaderData } from '../../loader';

const FilterRegion = () => {
  const loaderData = useLoaderData<ToolLoaderData>();
  const { filter, setFilter } = useToolStore(
    useShallow((state) => ({ filter: state.filters.region, setFilter: state.setArrayFilter })),
  );
  const regions = loaderData?.filters?.maakunta || [];
  const { t } = useTranslation();

  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="text-heading-4-mobile sm:text-heading-4 mb-5 sr-only">{t('show')}</legend>
      {regions.map((region) => (
        <Checkbox
          key={region.code}
          ariaLabel={t(region.value)}
          className="font-poppins!"
          checked={filter.includes(region.code)}
          label={t(region.value)}
          name={t(region.value)}
          onChange={() => setFilter('region', region.code)}
          value={region.code}
          data-testid="filter-location"
        />
      ))}
    </fieldset>
  );
};

export default FilterRegion;
