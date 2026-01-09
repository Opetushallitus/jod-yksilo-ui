import type { components } from '@/api/schema';
import i18n from '@/i18n/config';

/**
 * Formats duration (in months) to a string representation
 * @param duration Duration in months
 * @returns Formatted duration string
 */
export const formatMonths = (duration: number) => {
  if (!duration) {
    return '';
  }

  const yrs = Math.floor(duration / 12);
  const mths = duration % 12;
  const years = yrs > 0 ? i18n.t('education-opportunity.duration.of-year', { count: yrs }) : '';
  const months = mths > 0 ? i18n.t('education-opportunity.duration.of-month', { count: mths }) : '';

  // Eg. 1 vuoden ja 3 kuukauden
  if (yrs > 0 && mths > 0) {
    return i18n.t('education-opportunity.duration.years-and-months', { years, months });
  }
  // Eg. 2 vuoden
  if (yrs > 0 && mths === 0) {
    return years;
  }
  // Eg. 3 kuukauden
  if (yrs === 0 && mths > 0) {
    return months;
  }
  return '';
};

/**
 * Returns a string representing the duration including median and range if applicable.
 */
export const getDurationText = (kesto: components['schemas']['KoulutusmahdollisuusDto']['kesto']) => {
  if (!kesto?.mediaani || kesto.mediaani === 0) {
    return null;
  }

  // Determine if range should be displayed. If min and max don't exist, are zero or are equal to median, no range is shown.
  const rangePart =
    !kesto?.maksimi || !kesto.minimi || (kesto?.maksimi === kesto?.mediaani && kesto?.minimi === kesto?.mediaani)
      ? ''
      : i18n.t('education-opportunity.duration.range', {
          min: formatMonths(kesto.minimi),
          max: formatMonths(kesto.maksimi),
        });

  const medianPart =
    kesto?.mediaani < 12
      ? i18n.t('education-opportunity.duration.average-months', { count: kesto.mediaani })
      : i18n.t('education-opportunity.duration.average-years', { count: Math.round(kesto.mediaani / 12) });

  return rangePart ? `${medianPart} ${rangePart}` : medianPart;
};
