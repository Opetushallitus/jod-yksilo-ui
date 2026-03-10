import { useToolStore } from '@/stores/useToolStore';
import { RangeSlider } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

export const maxKestoValue = 1000;
const minKestoValue = 0;
const sixYearsInMonths = 6 * 12;

export const FilterKesto = () => {
  const { t } = useTranslation();
  const values = [
    { label: t('tool.settings.general.duration-value.day'), value: 0 },
    { label: t('tool.settings.general.duration-value.month'), value: 1 },
    { label: t('tool.settings.general.duration-value.year'), value: 2 },
    { label: t('tool.settings.general.duration-value.3-years'), value: 3 },
    { label: t('tool.settings.general.duration-value.6plus-years'), value: 4 },
  ];
  const minMonthsByIndex = [minKestoValue, 1, 12, 36, sixYearsInMonths];
  const maxMonthsByIndex = [minKestoValue, 1, 12, 36, maxKestoValue];
  const { filters, setDurationFilters, addToArray } = useToolStore(
    useShallow((state) => ({
      filters: state.filters,
      setDurationFilters: state.setDurationFilter,
      addToArray: state.addToArray,
    })),
  );
  const durationChange = (value: [number, number]) => {
    const minMonths = minMonthsByIndex[value[0]] ?? minKestoValue;
    const maxMonths = maxMonthsByIndex[value[1]] ?? maxKestoValue;
    const isDefaultRange = minMonths === minKestoValue && maxMonths === maxKestoValue;
    if (!isDefaultRange) {
      addToArray('opportunityType', 'KOULUTUSMAHDOLLISUUS');
    }
    setDurationFilters(minMonths, maxMonths);
  };
  const minMonthsToIndex = (months: number | null): number | undefined => {
    if (months === null) {
      return undefined;
    }
    const index = minMonthsByIndex.indexOf(months);
    return index === -1 ? undefined : index;
  };
  const maxMonthsToIndex = (months: number | null): number | undefined => {
    if (months === null) {
      return undefined;
    }
    const index = maxMonthsByIndex.indexOf(months);
    return index === -1 ? undefined : index;
  };

  return (
    <div className="mt-3">
      <RangeSlider
        markers={values}
        value={[minMonthsToIndex(filters.minDuration) ?? 0, maxMonthsToIndex(filters.maxDuration) ?? 4]}
        onValueChange={durationChange}
        minValueDescription={t('tool.settings.general.duration-value.min-aria-label')}
        maxValueDescription={t('tool.settings.general.duration-value.max-aria-label')}
      />
    </div>
  );
};
