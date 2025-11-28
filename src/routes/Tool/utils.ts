import type { components } from '@/api/schema';
import type { MahdollisuusTyyppi } from '@/routes/types';

export type EhdotusRecord = Record<string, components['schemas']['EhdotusMetadata']>;

export const ehdotusDataToRecord = (array: components['schemas']['EhdotusDto'][]): EhdotusRecord => {
  return array.reduce((acc, item) => {
    if (item.mahdollisuusId && item.ehdotusMetadata) {
      acc[item.mahdollisuusId] = item?.ehdotusMetadata;
    }
    return acc;
  }, {} as EhdotusRecord);
};

export type OpportunityFilterValue = components['schemas']['EhdotusMetadata']['tyyppi'] | 'ALL';
export type OpportunitySortingValue = 'ALPHABET' | 'RELEVANCE';
export const filterValues: Record<OpportunityFilterValue, OpportunityFilterValue> = {
  ALL: 'ALL',
  KOULUTUSMAHDOLLISUUS: 'KOULUTUSMAHDOLLISUUS',
  TYOMAHDOLLISUUS: 'TYOMAHDOLLISUUS',
} as const;

export const sortingValues: Record<OpportunitySortingValue, OpportunitySortingValue> = {
  ALPHABET: 'ALPHABET',
  RELEVANCE: 'RELEVANCE',
} as const;
export const DEFAULT_SORTING = sortingValues.RELEVANCE;

export const countFilteredEhdotukset = (
  filters: OpportunityFilterValue[],
  counts: Record<MahdollisuusTyyppi, number>,
) =>
  filters.includes('ALL') || filters.length === 0
    ? counts.TYOMAHDOLLISUUS + counts.KOULUTUSMAHDOLLISUUS
    : filters.reduce((acc, curr) => (curr === 'ALL' ? acc : acc + (counts[curr] ?? 0)), 0);

/**
 * Merges new values with current values while:
 * 1. Removing duplicates from new values based on id AND tyyppi
 * 2. Excluding items of a specific type from current values
 * 3. Combining the filtered current values with unique new values
 *
 * @param currentValues - The existing array of values
 * @param newValues - The new values to merge in
 * @param excludedType - The type to exclude from current values (default: 'KARTOITETTU')
 * @returns Combined array with duplicates removed and excluded type filtered out
 */
export const mergeUniqueValuesExcludingType = <T extends { id: string; tyyppi?: string }>(
  currentValues: T[],
  newValues: T[],
  excludedType = 'KARTOITETTU',
): T[] => {
  // Filter new values for uniqueness by id AND tyyppi
  const uniqueNewValues = newValues.filter(
    (newValue, index, self) => index === self.findIndex((v) => v.id === newValue.id && v.tyyppi === newValue.tyyppi),
  );

  // Remove items of excluded type from current values and merge with unique new values
  return [...currentValues.filter((item) => item.tyyppi !== excludedType), ...uniqueNewValues];
};
