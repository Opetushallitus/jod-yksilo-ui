import { useToolStore } from '@/stores/useToolStore';
import { RangeSlider } from '@jod/design-system';
import { useShallow } from 'zustand/shallow';

export const maxKestoValue = 1000;
export const FilterKesto = () => {
  const minvalue = 0;

  const values = [
    { label: '1pvä', value: 0 },
    { label: '1kk', value: 1 },
    { label: '1v', value: 2 },
    { label: '3v', value: 3 },
    { label: '6+v', value: 4 },
  ];
  const { filters, setDurationFilters } = useToolStore(
    useShallow((state) => ({
      filters: state.filters,
      setDurationFilters: state.setDurationFilter,
    })),
  );

  const indexToMonths = [
    {
      index: 0,
      months: minvalue,
    },
    {
      index: 1,
      months: 1,
    },
    {
      index: 2,
      months: 12,
    },
    {
      index: 3,
      months: 36,
    },
    {
      index: 4,
      months: maxKestoValue,
    },
  ];
  const durationChange = (value: [number, number]) => {
    const minMonths = indexToMinMonths(value[0]);
    const maxMonths = indexToMonth(value[1]) ?? maxKestoValue;
    setDurationFilters(minMonths, maxMonths);
  };
  const monthsToIndex = (months: number | null): number | undefined => {
    return indexToMonths.find((im) => im.months === months)?.index;
  };
  const indexToMonth = (index: number | null): number | undefined => {
    return indexToMonths.find((im) => im.index === index)?.months;
  };
  const indexToMinMonths = (index: number | null): number => {
    const minMonths = indexToMonth(index) ?? minvalue;
    return Math.min(minMonths, 6 * 12);
  };

  return (
    <RangeSlider
      markers={values}
      value={[monthsToIndex(filters.minDuration) ?? 0, monthsToIndex(filters.maxDuration) ?? 4]}
      onValueChange={durationChange}
      minValueDescription={'test'}
      maxValueDescription={'test'}
    />
  );
};
