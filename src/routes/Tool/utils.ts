import { components } from '@/api/schema';

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

export const DEFAULT_FILTER = filterValues.ALL;
export const DEFAULT_SORTING = sortingValues.RELEVANCE;
