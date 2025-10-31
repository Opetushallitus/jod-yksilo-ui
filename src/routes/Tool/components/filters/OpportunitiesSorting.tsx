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
  return (
    <RadioButtonGroup
      label={t('tool.your-opportunities.sorting.title')}
      onChange={(value) =>
        value === sortingValues.RELEVANCE || value === sortingValues.ALPHABET ? setSorting(value) : null
      }
      value={sorting}
      hideLabel
    >
      <RadioButton
        className="cursor-pointer mr-auto mb-2"
        label={t('tool.your-opportunities.sorting.by-relevance')}
        value={sortingValues.RELEVANCE}
        data-testid="sorting-by-relevance"
      />
      <RadioButton
        className="cursor-pointer mr-auto"
        label={t('tool.your-opportunities.sorting.alphabetically')}
        value={sortingValues.ALPHABET}
        data-testid="sorting-alphabetically"
      />
    </RadioButtonGroup>
  );
};

export default OpportunitiesSorting;
