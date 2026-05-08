import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

import { RadioButton, RadioButtonGroup } from '@jod/design-system';

import { sortingValues } from '@/routes/Tool/utils';
import { useToolStore } from '@/stores/useToolStore';

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
        className="mr-auto mb-2 cursor-pointer"
        label={t('tool.your-opportunities.sorting.by-relevance')}
        value={sortingValues.RELEVANCE}
        testId="sorting-by-relevance"
      />
      <RadioButton
        className="mr-auto cursor-pointer"
        label={t('tool.your-opportunities.sorting.alphabetically')}
        value={sortingValues.ALPHABET}
        testId="sorting-alphabetically"
      />
    </RadioButtonGroup>
  );
};

export default OpportunitiesSorting;
