import { filterValues, sortingValues } from '@/routes/Tool/utils';
import { useToolStore } from '@/stores/useToolStore';
import { RadioButton, RadioButtonGroup } from '@jod/design-system';
import { useTranslation } from 'react-i18next';

const OpportunitiesFilter = () => {
  const { t } = useTranslation();
  const { filter, sorting, setFilter, setSorting } = useToolStore();
  const filterTitle = t('tool.your-opportunities.filters.title');
  const sortingTitle = t('tool.your-opportunities.sorting.title');

  return (
    <div className="flex flex-col absolute right-0 top-full z-10 bg-bg-gray-2 p-6 rounded-md w-[343px] shadow-border text-left gap-6">
      <h2 className="text-heading-2">{t('do-filter')}</h2>

      <div className="flex flex-col gap-5">
        <h3 className="text-heading-3">{filterTitle}</h3>
        <RadioButtonGroup label={filterTitle} value={filter} onChange={setFilter} hideLabel>
          <RadioButton
            label={t('tool.your-opportunities.filters.job-and-education-opportunities')}
            value={filterValues.ALL}
          />
          <RadioButton
            label={t('tool.your-opportunities.filters.job-opportunities')}
            value={filterValues.TYOMAHDOLLISUUS}
          />
          <RadioButton
            label={t('tool.your-opportunities.filters.education-opportunities')}
            value={filterValues.KOULUTUSMAHDOLLISUUS}
          />
        </RadioButtonGroup>

        <h3 className="text-heading-3">{sortingTitle}</h3>
        <RadioButtonGroup label={sortingTitle} value={sorting} onChange={setSorting} hideLabel>
          <RadioButton label={t('tool.your-opportunities.sorting.by-relevance')} value={sortingValues.RELEVANCE} />
          <RadioButton label={t('tool.your-opportunities.sorting.alphabetically')} value={sortingValues.ALPHABET} />
        </RadioButtonGroup>
      </div>
    </div>
  );
};

export default OpportunitiesFilter;
