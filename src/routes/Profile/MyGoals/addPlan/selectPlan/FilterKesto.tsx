import { addPlanStore } from '@/routes/Profile/MyGoals/addPlan/store/addPlanStore';
import { RangeSlider } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';
import { MAX_KESTO_VALUE, MIN_KESTO_VALUE } from '../store/PlanOptionStoreModel';

export const FilterKesto = () => {
  const { t } = useTranslation();
  const values = [
    { label: t('tool.settings.general.duration-value.day'), value: 0 },
    { label: t('tool.settings.general.duration-value.month'), value: 1 },
    { label: t('tool.settings.general.duration-value.year'), value: 2 },
    { label: t('tool.settings.general.duration-value.3-years'), value: 3 },
    { label: t('tool.settings.general.duration-value.6plus-years'), value: 4 },
  ];
  const { filters, setDurationFilters } = addPlanStore(
    useShallow((state) => ({
      filters: state.filters,
      setDurationFilters: state.setDurationFilter,
    })),
  );

  const indexToMonths = [
    {
      index: 0,
      months: MIN_KESTO_VALUE,
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
    // There is 2 entries for index 4. Index 4 can be 6 years or maxKestoValue, depending if its minDuration or maxDuration
    {
      index: 4,
      months: 6 * 12, // 6 years
    },
    {
      index: 4,
      months: MAX_KESTO_VALUE,
    },
  ];
  const onDurationChange = (value: [number, number]) => {
    const minMonths = indexToMinMonths(value[0]);
    const maxMonths = indexToMonth(value[1]) ?? MAX_KESTO_VALUE;
    setDurationFilters(minMonths, maxMonths);
  };
  const monthsToIndex = (months: number | null): number | undefined => {
    return indexToMonths.find((im) => im.months === months)?.index;
  };
  const indexToMonth = (index: number | null): number | undefined => {
    return indexToMonths.find((im) => im.index === index)?.months;
  };
  const indexToMinMonths = (index: number | null): number => {
    const minMonths = indexToMonth(index) ?? MIN_KESTO_VALUE;
    const sixYears = 6 * 12;
    // Min months cant be over six years
    return Math.min(minMonths, sixYears);
  };

  return (
    <div className="p-3" data-testid="select-plan-duration-slider">
      <RangeSlider
        markers={values}
        value={[monthsToIndex(filters.minDuration) ?? 0, monthsToIndex(filters.maxDuration) ?? 4]}
        onValueChange={onDurationChange}
        minValueDescription={t('tool.settings.general.duration-value.min-aria-label')}
        maxValueDescription={t('tool.settings.general.duration-value.max-aria-label')}
      />
    </div>
  );
};
