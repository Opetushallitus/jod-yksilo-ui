import { sortingValues } from '@/routes/Tool/utils';
import { useToolStore } from '@/stores/useToolStore';
import { RadioButton, RadioButtonGroup } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

const OpportunitiesSorting = () => {
  const { t } = useTranslation();
  const { sorting, setSorting } = useToolStore(
    useShallow((state) => ({ sorting: state.sorting, setSorting: state.setSorting })),
  );
  const sortingTitle = t('tool.your-opportunities.sorting.title');

  return (
    <div className="flex flex-col absolute left-0 top-11/12 z-10 bg-bg-gray-2 p-6 rounded-md w-[343px] shadow-border text-left gap-6">
      <div className="flex flex-col gap-5">
        <RadioButtonGroup className="flex flex-row gap-2" label={sortingTitle} onChange={setSorting} value={sorting}>
          <RadioButton
            className="cursor-pointer mr-auto"
            label={t('tool.your-opportunities.sorting.by-relevance')}
            value={sortingValues.RELEVANCE}
          />
          <RadioButton
            className="cursor-pointer mr-auto"
            label={t('tool.your-opportunities.sorting.alphabetically')}
            value={sortingValues.ALPHABET}
          />
        </RadioButtonGroup>
      </div>
    </div>
  );
};

export default OpportunitiesSorting;
